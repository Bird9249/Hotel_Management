import { and, count, eq, gt, inArray, lt, ne, sql } from "drizzle-orm";
import type { DbClient } from "@/server/platform/db/client";
import { inventoryHold } from "@/server/platform/db/schema/channels";
import { reservation } from "@/server/platform/db/schema/reservations";
import { room, roomType } from "@/server/platform/db/schema/rooms";
import type { DbTransaction } from "@/shared/types";

const ACTIVE_RESERVATION_STATUSES = ["booked", "checked_in"] as const;

export type RoomTypeAvailabilityRow = {
  roomTypeId: string;
  roomTypeName: string;
  basePrice: string;
  capacity: number;
  totalRooms: number;
  reservedRooms: number;
  heldRooms: number;
  availableRooms: number;
};

export async function listRoomTypeAvailability(
  params: {
    from: string;
    to: string;
    roomTypeId?: string;
    excludeReservationId?: string;
  },
  client: DbTransaction | DbClient,
): Promise<RoomTypeAvailabilityRow[]> {
  const typeWhere = params.roomTypeId
    ? eq(roomType.id, params.roomTypeId)
    : undefined;

  const physicalBase = client
    .select({
      roomTypeId: roomType.id,
      roomTypeName: roomType.name,
      basePrice: roomType.basePrice,
      capacity: roomType.capacity,
      totalRooms: sql<number>`count(${room.id})::int`,
    })
    .from(roomType)
    .leftJoin(room, eq(room.roomTypeId, roomType.id));
  const physicalFiltered = typeWhere
    ? physicalBase.where(typeWhere)
    : physicalBase;
  const physical = await physicalFiltered
    .groupBy(roomType.id, roomType.name, roomType.basePrice, roomType.capacity)
    .orderBy(roomType.name);

  const reserved = await client
    .select({
      roomTypeId: room.roomTypeId,
      reservedRooms: sql<number>`count(distinct ${reservation.id})::int`,
    })
    .from(reservation)
    .innerJoin(room, eq(reservation.roomId, room.id))
    .where(
      and(
        overlapsActiveReservation({ from: params.from, to: params.to }),
        params.roomTypeId ? eq(room.roomTypeId, params.roomTypeId) : undefined,
        params.excludeReservationId
          ? ne(reservation.id, params.excludeReservationId)
          : undefined,
      ),
    )
    .groupBy(room.roomTypeId);

  const holds = await client
    .select({
      roomTypeId: inventoryHold.roomTypeId,
      heldRooms: sql<number>`coalesce(sum(${inventoryHold.quantity}), 0)::int`,
    })
    .from(inventoryHold)
    .where(
      and(
        gt(inventoryHold.expiresAt, sql`now()`),
        lt(inventoryHold.checkInDate, params.to),
        gt(inventoryHold.checkOutDate, params.from),
        params.roomTypeId
          ? eq(inventoryHold.roomTypeId, params.roomTypeId)
          : undefined,
      ),
    )
    .groupBy(inventoryHold.roomTypeId);

  const reservedByType = new Map(
    reserved.map((row) => [row.roomTypeId, Number(row.reservedRooms)]),
  );
  const heldByType = new Map(
    holds.map((row) => [row.roomTypeId, Number(row.heldRooms)]),
  );

  return physical.map((row) => {
    const reservedRooms = reservedByType.get(row.roomTypeId) ?? 0;
    const heldRooms = heldByType.get(row.roomTypeId) ?? 0;
    const totalRooms = Number(row.totalRooms);
    return {
      ...row,
      totalRooms,
      reservedRooms,
      heldRooms,
      availableRooms: Math.max(totalRooms - reservedRooms - heldRooms, 0),
    };
  });
}

export async function getRoomTypeInventoryCount(
  roomTypeId: string,
  client: DbTransaction | DbClient,
) {
  const [row] = await client
    .select({ value: count() })
    .from(room)
    .where(eq(room.roomTypeId, roomTypeId));
  return row?.value ?? 0;
}

export function overlapsActiveReservation(params: {
  from: string;
  to: string;
}) {
  return and(
    inArray(reservation.status, [...ACTIVE_RESERVATION_STATUSES]),
    lt(reservation.checkInDate, params.to),
    gt(reservation.checkOutDate, params.from),
  );
}
