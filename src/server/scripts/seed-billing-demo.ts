#!/usr/bin/env bun

import { like } from "drizzle-orm";
import { addPaymentService } from "@/modules/billing/domain/service/add-payment";
import { createInvoiceService } from "@/modules/billing/domain/service/create-invoice";
import { db } from "@/server/platform/db/client";
import { invoice } from "@/server/platform/db/schema/billing";
import { logger } from "@/server/platform/observability/logger";

const DEMO_PREFIX = "demo-";

const DEMO_RES_DONE = `${DEMO_PREFIX}res-done`;
const DEMO_RES_DONE_2 = `${DEMO_PREFIX}res-done-2`;

async function seedBillingDemo() {
  try {
    logger.info("Starting billing demo seed (Phase 4)...");

    await db.transaction(async (tx) => {
      logger.info("Clearing previous demo billing data...");
      await tx
        .delete(invoice)
        .where(like(invoice.reservationId, `${DEMO_PREFIX}%`));

      logger.info("Creating invoice for completed stay (unpaid)...");
      const { created: unpaid } = await createInvoiceService(tx, {
        input: {
          reservationId: DEMO_RES_DONE,
          taxRate: 10,
          extraItems: [
            {
              description: "ມິນິບາ",
              qty: 1,
              unitPrice: 50_000,
            },
          ],
        },
      });

      logger.info("Creating invoice for suite stay (partial payment)...");
      const { created: partial } = await createInvoiceService(tx, {
        input: {
          reservationId: DEMO_RES_DONE_2,
          taxRate: 10,
          extraItems: [
            {
              description: "ບໍລິການຊາກຜົນ",
              qty: 1,
              unitPrice: 80_000,
            },
          ],
        },
      });

      const partialPayAmount = Math.min(
        Number(partial.total) * 0.5,
        Number(partial.balance),
      );

      await addPaymentService(tx, {
        invoiceId: partial.id,
        input: {
          method: "bank_transfer",
          amount: partialPayAmount,
        },
      });

      logger.info("Billing demo seed completed!");
      logger.info(`  Unpaid invoice: ${unpaid.id} (${unpaid.total} LAK)`);
      logger.info(`  Partial invoice: ${partial.id}`);
      logger.info("  View at /app/invoices");
    });
  } catch (error) {
    logger.error("Billing demo seed failed:", error);
    logger.error("Run `bun run seed:hotel` first to create demo reservations.");
    process.exit(1);
  }
}

seedBillingDemo();
