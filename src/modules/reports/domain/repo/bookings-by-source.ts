import { and, gte, lt, ne, sql } from "drizzle-orm";
import type { DbClient } from "@/server/platform/db/client";
import { reservation } from "@/server/platform/db/schema/reservations";
import type { DbTransaction } from "@/shared/types";
import { toExclusiveEnd } from "../lib/date-range";

type BookingsBySourceRow = {
  day: string;
  sourceKey: string;
  total: string;
};

export async function queryBookingsBySource(
  from: string,
  inclusiveTo: string,
  client: DbTransaction | DbClient,
) {
  const exclusiveTo = toExclusiveEnd(inclusiveTo);

  const rows = await client
    .select({
      day: sql<string>`date_trunc('day', ${reservation.createdAt})::date::text`.as(
        "day",
      ),
      sourceKey:
        sql<string>`coalesce(${reservation.channelId}, ${reservation.source})`.as(
          "source_key",
        ),
      total: sql<string>`count(*)`.as("total"),
    })
    .from(reservation)
    .where(
      and(
        gte(reservation.createdAt, sql`${from}::date`),
        lt(reservation.createdAt, sql`${exclusiveTo}::date`),
        ne(reservation.status, "cancelled"),
      ),
    )
    .groupBy(
      sql`date_trunc('day', ${reservation.createdAt})::date`,
      sql`coalesce(${reservation.channelId}, ${reservation.source})`,
    )
    .orderBy(sql`date_trunc('day', ${reservation.createdAt})::date`);

  return rows as BookingsBySourceRow[];
}
