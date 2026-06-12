import { eq } from "drizzle-orm";
import type { DbClient } from "@/server/platform/db/client";
import { payment } from "@/server/platform/db/schema/billing";
import type { DbTransaction } from "@/shared/types";

export type ShiftPaymentTotals = {
  cash: number;
  transfer: number;
  card: number;
};

export async function sumPaymentsByShift(
  shiftId: string,
  client: DbTransaction | DbClient,
): Promise<ShiftPaymentTotals> {
  const rows = await client
    .select({
      method: payment.method,
      amount: payment.amount,
    })
    .from(payment)
    .where(eq(payment.shiftId, shiftId));

  const totals: ShiftPaymentTotals = { cash: 0, transfer: 0, card: 0 };

  for (const row of rows) {
    const amount = Number(row.amount);
    if (row.method === "cash") totals.cash += amount;
    else if (row.method === "bank_transfer") totals.transfer += amount;
    else if (row.method === "credit_card") totals.card += amount;
  }

  return {
    cash: Number(totals.cash.toFixed(2)),
    transfer: Number(totals.transfer.toFixed(2)),
    card: Number(totals.card.toFixed(2)),
  };
}
