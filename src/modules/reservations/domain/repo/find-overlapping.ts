import { and, eq, gt, inArray, lt, ne } from "drizzle-orm";
import type { DbClient } from "@/server/platform/db/client";
import { reservation } from "@/server/platform/db/schema/reservations";
import type { DbTransaction } from "@/shared/types";

const ACTIVE_STATUSES = ["booked", "checked_in"] as const;

export async function findOverlapping(
  params: {
    roomId: string;
    checkInDate: string;
    checkOutDate: string;
    excludeId?: string;
  },
  client: DbTransaction | DbClient,
) {
  const conditions = [
    eq(reservation.roomId, params.roomId),
    inArray(reservation.status, [...ACTIVE_STATUSES]),
    lt(reservation.checkInDate, params.checkOutDate),
    gt(reservation.checkOutDate, params.checkInDate),
  ];
  if (params.excludeId) {
    conditions.push(ne(reservation.id, params.excludeId));
  }
  const [row] = await client
    .select()
    .from(reservation)
    .where(and(...conditions))
    .limit(1);
  return row ?? null;
}
