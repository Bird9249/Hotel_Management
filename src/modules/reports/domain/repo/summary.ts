import { and, eq, gte, lt, sql } from "drizzle-orm";
import type { DbClient } from "@/server/platform/db/client";
import { payment } from "@/server/platform/db/schema/billing";
import { reservation } from "@/server/platform/db/schema/reservations";
import { room } from "@/server/platform/db/schema/rooms";
import type { DbTransaction } from "@/shared/types";
import { todayIso, toExclusiveEnd } from "../lib/date-range";

export async function queryTodayRevenue(
  client: DbTransaction | DbClient,
  day = todayIso(),
) {
  const exclusiveTo = toExclusiveEnd(day);
  const [row] = await client
    .select({
      total: sql<string>`coalesce(sum(${payment.amount}), 0)`.as("total"),
    })
    .from(payment)
    .where(
      and(
        gte(payment.paidAt, sql`${day}::date`),
        lt(payment.paidAt, sql`${exclusiveTo}::date`),
      ),
    );
  return Number(row?.total ?? 0);
}

export async function queryTodayOccupancy(
  client: DbTransaction | DbClient,
  day = todayIso(),
) {
  const [totalRow] = await client
    .select({ count: sql<number>`count(*)::int`.as("count") })
    .from(room)
    .where(sql`${room.status} <> 'maintenance'`);

  const totalRooms = totalRow?.count ?? 0;
  if (totalRooms === 0) {
    return { occupiedRooms: 0, totalRooms: 0, rate: 0 };
  }

  const [occupiedRow] = await client
    .select({
      count: sql<number>`count(distinct ${reservation.roomId})::int`.as(
        "count",
      ),
    })
    .from(reservation)
    .where(
      and(
        sql`${reservation.status} in ('checked_in', 'checked_out', 'booked')`,
        sql`${reservation.checkInDate} <= ${day}::date`,
        sql`${reservation.checkOutDate} > ${day}::date`,
      ),
    );

  const occupiedRooms = occupiedRow?.count ?? 0;
  return {
    occupiedRooms,
    totalRooms,
    rate: occupiedRooms / totalRooms,
  };
}

export async function queryTodayArrivals(
  client: DbTransaction | DbClient,
  day = todayIso(),
) {
  const [row] = await client
    .select({ count: sql<number>`count(*)::int`.as("count") })
    .from(reservation)
    .where(
      and(eq(reservation.checkInDate, day), eq(reservation.status, "booked")),
    );
  return row?.count ?? 0;
}

export async function queryTodayDepartures(
  client: DbTransaction | DbClient,
  day = todayIso(),
) {
  const [row] = await client
    .select({ count: sql<number>`count(*)::int`.as("count") })
    .from(reservation)
    .where(
      and(
        eq(reservation.checkOutDate, day),
        eq(reservation.status, "checked_in"),
      ),
    );
  return row?.count ?? 0;
}
