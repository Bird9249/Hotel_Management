import { and, eq, gte, lt, sql } from "drizzle-orm";
import type { DbClient } from "@/server/platform/db/client";
import { cashShift } from "@/server/platform/db/schema/billing";
import type { DbTransaction } from "@/shared/types";
import { toExclusiveEnd } from "../lib/date-range";

export type DailyCashSummaryRow = {
  day: string;
  shiftCount: number;
  openingCash: string;
  cashReceived: string;
  expectedCash: string;
  closingCashCounted: string;
  totalVariance: string;
};

export async function queryDailyCashSummary(
  from: string,
  inclusiveTo: string,
  client: DbTransaction | DbClient,
) {
  const exclusiveTo = toExclusiveEnd(inclusiveTo);

  const rows = await client
    .select({
      day: sql<string>`date_trunc('day', ${cashShift.closedAt})::date::text`.as(
        "day",
      ),
      shiftCount: sql<number>`count(*)::int`.as("shift_count"),
      openingCash: sql<string>`coalesce(sum(${cashShift.openingCash}), 0)`.as(
        "opening_cash",
      ),
      cashReceived: sql<string>`coalesce(sum(${cashShift.cashReceived}), 0)`.as(
        "cash_received",
      ),
      expectedCash: sql<string>`coalesce(sum(${cashShift.expectedCash}), 0)`.as(
        "expected_cash",
      ),
      closingCashCounted:
        sql<string>`coalesce(sum(${cashShift.closingCashCounted}), 0)`.as(
          "closing_cash_counted",
        ),
      totalVariance: sql<string>`coalesce(sum(${cashShift.variance}), 0)`.as(
        "total_variance",
      ),
    })
    .from(cashShift)
    .where(
      and(
        eq(cashShift.status, "closed"),
        gte(cashShift.closedAt, sql`${from}::date`),
        lt(cashShift.closedAt, sql`${exclusiveTo}::date`),
      ),
    )
    .groupBy(sql`date_trunc('day', ${cashShift.closedAt})::date`)
    .orderBy(sql`date_trunc('day', ${cashShift.closedAt})::date`);

  return rows as DailyCashSummaryRow[];
}
