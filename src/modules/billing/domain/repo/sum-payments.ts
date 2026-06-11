import { eq, sum } from "drizzle-orm";
import type { DbClient } from "@/server/platform/db/client";
import { payment } from "@/server/platform/db/schema/billing";
import type { DbTransaction } from "@/shared/types";

export async function sumPayments(
  invoiceId: string,
  client: DbTransaction | DbClient,
): Promise<number> {
  const [row] = await client
    .select({ value: sum(payment.amount) })
    .from(payment)
    .where(eq(payment.invoiceId, invoiceId));
  return Number(row?.value ?? 0);
}
