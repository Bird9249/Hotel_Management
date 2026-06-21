import { and, eq, gte, lt, sql } from "drizzle-orm";
import type { DbClient } from "@/server/platform/db/client";
import { user } from "@/server/platform/db/schema/auth";
import { hkRoomTask, hkShift } from "@/server/platform/db/schema/housekeeping";
import type { DbTransaction } from "@/shared/types";
import { toExclusiveEnd } from "../lib/date-range";

export type HkProductivityDailyRow = {
  day: string;
  shiftsClosed: number;
  roomsCompleted: number;
  roomsPending: number;
  avgMinutesPerRoom: number | null;
};

export type HkProductivityShiftRow = {
  shiftId: string;
  openedAt: Date;
  closedAt: Date | null;
  openedByName: string;
  roomsCompleted: number;
  roomsPending: number;
  avgMinutesPerRoom: number | null;
};

export async function queryHkProductivityDaily(
  from: string,
  inclusiveTo: string,
  client: DbTransaction | DbClient,
): Promise<HkProductivityDailyRow[]> {
  const exclusiveTo = toExclusiveEnd(inclusiveTo);

  const shiftRows = await client
    .select({
      day: sql<string>`date_trunc('day', ${hkShift.closedAt})::date::text`.as(
        "day",
      ),
      shiftsClosed: sql<number>`count(*)::int`.as("shifts_closed"),
      roomsCompleted:
        sql<number>`coalesce(sum(${hkShift.roomsCompleted}), 0)::int`.as(
          "rooms_completed",
        ),
      roomsPending:
        sql<number>`coalesce(sum(${hkShift.roomsPending}), 0)::int`.as(
          "rooms_pending",
        ),
    })
    .from(hkShift)
    .where(
      and(
        eq(hkShift.status, "closed"),
        gte(hkShift.closedAt, sql`${from}::date`),
        lt(hkShift.closedAt, sql`${exclusiveTo}::date`),
      ),
    )
    .groupBy(sql`date_trunc('day', ${hkShift.closedAt})::date`)
    .orderBy(sql`date_trunc('day', ${hkShift.closedAt})::date`);

  const avgRows = await client
    .select({
      day: sql<string>`date_trunc('day', ${hkRoomTask.completedAt})::date::text`.as(
        "day",
      ),
      avgMinutes:
        sql<string>`avg(extract(epoch from (${hkRoomTask.completedAt} - ${hkRoomTask.startedAt})) / 60)`.as(
          "avg_minutes",
        ),
    })
    .from(hkRoomTask)
    .where(
      and(
        eq(hkRoomTask.status, "done"),
        sql`${hkRoomTask.startedAt} is not null`,
        sql`${hkRoomTask.completedAt} is not null`,
        gte(hkRoomTask.completedAt, sql`${from}::date`),
        lt(hkRoomTask.completedAt, sql`${exclusiveTo}::date`),
      ),
    )
    .groupBy(sql`date_trunc('day', ${hkRoomTask.completedAt})::date`);

  const avgByDay = new Map(
    avgRows.map((row) => [
      row.day,
      row.avgMinutes != null
        ? Math.round(Number(row.avgMinutes) * 10) / 10
        : null,
    ]),
  );

  return shiftRows.map((row) => ({
    day: row.day,
    shiftsClosed: row.shiftsClosed,
    roomsCompleted: row.roomsCompleted,
    roomsPending: row.roomsPending,
    avgMinutesPerRoom: avgByDay.get(row.day) ?? null,
  }));
}

export async function queryHkProductivityByShift(
  from: string,
  inclusiveTo: string,
  client: DbTransaction | DbClient,
): Promise<HkProductivityShiftRow[]> {
  const exclusiveTo = toExclusiveEnd(inclusiveTo);

  const shifts = await client
    .select({
      shiftId: hkShift.id,
      openedAt: hkShift.openedAt,
      closedAt: hkShift.closedAt,
      openedByName: user.name,
      roomsCompleted: hkShift.roomsCompleted,
      roomsPending: hkShift.roomsPending,
    })
    .from(hkShift)
    .innerJoin(user, eq(hkShift.openedByUserId, user.id))
    .where(
      and(
        eq(hkShift.status, "closed"),
        gte(hkShift.closedAt, sql`${from}::date`),
        lt(hkShift.closedAt, sql`${exclusiveTo}::date`),
      ),
    )
    .orderBy(hkShift.closedAt);

  const avgRows = await client
    .select({
      shiftId: hkRoomTask.shiftId,
      avgMinutes:
        sql<string>`avg(extract(epoch from (${hkRoomTask.completedAt} - ${hkRoomTask.startedAt})) / 60)`.as(
          "avg_minutes",
        ),
    })
    .from(hkRoomTask)
    .where(
      and(
        eq(hkRoomTask.status, "done"),
        sql`${hkRoomTask.startedAt} is not null`,
        sql`${hkRoomTask.completedAt} is not null`,
        sql`${hkRoomTask.shiftId} is not null`,
      ),
    )
    .groupBy(hkRoomTask.shiftId);

  const avgByShift = new Map(
    avgRows.map((row) => [
      row.shiftId,
      row.avgMinutes != null
        ? Math.round(Number(row.avgMinutes) * 10) / 10
        : null,
    ]),
  );

  return shifts.map((row) => ({
    shiftId: row.shiftId,
    openedAt: row.openedAt,
    closedAt: row.closedAt,
    openedByName: row.openedByName,
    roomsCompleted: row.roomsCompleted ?? 0,
    roomsPending: row.roomsPending ?? 0,
    avgMinutesPerRoom: avgByShift.get(row.shiftId) ?? null,
  }));
}
