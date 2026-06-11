import { desc, eq } from "drizzle-orm";
import type { DbClient } from "@/server/platform/db/client";
import { payment } from "@/server/platform/db/schema/billing";
import type { DbTransaction } from "@/shared/types";

export async function listPaymentsByInvoice(
  invoiceId: string,
  client: DbTransaction | DbClient,
) {
  return client
    .select()
    .from(payment)
    .where(eq(payment.invoiceId, invoiceId))
    .orderBy(desc(payment.paidAt));
}
