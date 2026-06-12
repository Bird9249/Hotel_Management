import type { DbClient } from "@/server/platform/db/client";
import type { DbTransaction } from "@/shared/types";
import { queryDailyCashSummary } from "../repo/daily-cash-summary";

export async function getDailyCashSummary(
  from: string,
  to: string,
  client: DbTransaction | DbClient,
) {
  const rows = await queryDailyCashSummary(from, to, client);

  return rows.map((row) => ({
    day: row.day,
    shiftCount: row.shiftCount,
    openingCash: Number(row.openingCash),
    cashReceived: Number(row.cashReceived),
    expectedCash: Number(row.expectedCash),
    closingCashCounted: Number(row.closingCashCounted),
    totalVariance: Number(row.totalVariance),
  }));
}
