import { and, gte, lt, sql } from "drizzle-orm";
import type { DbClient } from "@/server/platform/db/client";
import { invoice, payment } from "@/server/platform/db/schema/billing";
import { reservation } from "@/server/platform/db/schema/reservations";
import type { DbTransaction } from "@/shared/types";
import { toExclusiveEnd } from "../lib/date-range";

type RevenueBySourceRow = {
  day: string;
  sourceKey: string;
  total: string;
};

export async function queryRevenueBySource(
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
      sourceKey:
        sql<string>`coalesce(${reservation.channelId}, ${reservation.source})`.as(
          "source_key",
        ),
      total: sql<string>`sum(${payment.amount})`.as("total"),
    })
    .from(payment)
    .innerJoin(invoice, sql`${invoice.id} = ${payment.invoiceId}`)
    .innerJoin(reservation, sql`${reservation.id} = ${invoice.reservationId}`)
    .where(
      and(
        gte(payment.paidAt, sql`${from}::date`),
        lt(payment.paidAt, sql`${exclusiveTo}::date`),
      ),
    )
    .groupBy(
      sql`date_trunc('day', ${payment.paidAt})::date`,
      sql`coalesce(${reservation.channelId}, ${reservation.source})`,
    )
    .orderBy(sql`date_trunc('day', ${payment.paidAt})::date`);

  return rows as RevenueBySourceRow[];
}
