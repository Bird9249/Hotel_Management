import { desc, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import type { DbClient } from "@/server/platform/db/client";
import { user } from "@/server/platform/db/schema/auth";
import { payment } from "@/server/platform/db/schema/billing";
import type { DbTransaction } from "@/shared/types";

const recordedByUser = alias(user, "payment_recorded_by");

export async function listPaymentsByInvoice(
  invoiceId: string,
  client: DbTransaction | DbClient,
) {
  return client
    .select({
      id: payment.id,
      method: payment.method,
      amount: payment.amount,
      paidAt: payment.paidAt,
      recordedByName: recordedByUser.name,
    })
    .from(payment)
    .leftJoin(
      recordedByUser,
      eq(payment.recordedByUserId, recordedByUser.id),
    )
    .where(eq(payment.invoiceId, invoiceId))
    .orderBy(desc(payment.paidAt));
}
