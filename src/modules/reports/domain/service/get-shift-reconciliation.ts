import type { DbClient } from "@/server/platform/db/client";
import type { DbTransaction } from "@/shared/types";
import { queryShiftReconciliation } from "../repo/shift-reconciliation";

function toNum(value: string | null | undefined) {
  if (value == null) return null;
  return Number(value);
}

export async function getShiftReconciliation(
  from: string,
  to: string,
  client: DbTransaction | DbClient,
) {
  const rows = await queryShiftReconciliation(from, to, client);

  return rows.map((row) => ({
    id: row.id,
    status: row.status,
    openedByName: row.openedByName,
    closedByName: row.closedByName,
    openedAt: row.openedAt.toISOString(),
    closedAt: row.closedAt?.toISOString() ?? null,
    openingCash: Number(row.openingCash),
    cashReceived: toNum(row.cashReceived),
    transferReceived: toNum(row.transferReceived),
    cardReceived: toNum(row.cardReceived),
    expectedCash: toNum(row.expectedCash),
    closingCashCounted: toNum(row.closingCashCounted),
    variance: toNum(row.variance),
    handoverNote: row.handoverNote,
  }));
}
