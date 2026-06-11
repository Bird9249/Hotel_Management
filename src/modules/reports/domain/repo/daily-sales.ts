import { and, gte, lt, sql } from "drizzle-orm";
import type { DbClient } from "@/server/platform/db/client";
import { payment } from "@/server/platform/db/schema/billing";
import type { DbTransaction } from "@/shared/types";
import { toExclusiveEnd } from "../lib/date-range";

type DailySalesRow = {
  day: string;
  method: string;
  total: string;
};

export async function queryDailySales(
  from: string,
  inclusiveTo: string,
  client: DbTransaction | DbClient,
) {
  const exclusiveTo = toExclusiveEnd(inclusiveTo);

  const rows = await client
    .select({
      day: sql<string>`date_trunc('day', ${payment.paidAt})::date::text`.as(
        "day",
      ),
      method: payment.method,
      total: sql<string>`sum(${payment.amount})`.as("total"),
    })
    .from(payment)
    .where(
      and(
        gte(payment.paidAt, sql`${from}::date`),
        lt(payment.paidAt, sql`${exclusiveTo}::date`),
      ),
    )
    .groupBy(sql`date_trunc('day', ${payment.paidAt})::date`, payment.method)
    .orderBy(sql`date_trunc('day', ${payment.paidAt})::date`);

  return rows as DailySalesRow[];
}
