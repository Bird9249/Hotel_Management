import { and, eq, gt, inArray, lt } from "drizzle-orm";
import type { DbClient } from "@/server/platform/db/client";
import { guest } from "@/server/platform/db/schema/hotel-guests";
import { reservation } from "@/server/platform/db/schema/reservations";
import { room, roomType } from "@/server/platform/db/schema/rooms";
import type { DbTransaction } from "@/shared/types";

export type RoomAvailabilityItem = {
  roomId: string;
  roomNumber: string;
  roomTypeName: string | null;
  floor: number | null;
  available: boolean;
  reservationId: string | null;
  source: string | null;
  guestName: string | null;
  checkInDate: string | null;
  checkOutDate: string | null;
};

const ACTIVE_STATUSES = ["booked", "checked_in"] as const;

export async function listRoomAvailability(
  params: { from: string; to: string; roomTypeId?: string },
  client: DbTransaction | DbClient,
): Promise<RoomAvailabilityItem[]> {
  const baseRooms = client
    .select({
      roomId: room.id,
      roomNumber: room.roomNumber,
      roomTypeName: roomType.name,
      floor: room.floor,
    })
    .from(room)
    .leftJoin(roomType, eq(room.roomTypeId, roomType.id));
  const filteredRooms = params.roomTypeId
    ? baseRooms.where(eq(room.roomTypeId, params.roomTypeId))
    : baseRooms;
  const rooms = await filteredRooms.orderBy(room.roomNumber);

  const activeReservations = await client
    .select({
      id: reservation.id,
      source: reservation.source,
      roomId: reservation.roomId,
      guestName: guest.fullName,
      checkInDate: reservation.checkInDate,
      checkOutDate: reservation.checkOutDate,
    })
    .from(reservation)
    .innerJoin(guest, eq(reservation.guestId, guest.id))
    .where(
      and(
        inArray(reservation.status, [...ACTIVE_STATUSES]),
        lt(reservation.checkInDate, params.to),
        gt(reservation.checkOutDate, params.from),
      ),
    );

  const byRoom = new Map<string, (typeof activeReservations)[number]>();
  for (const r of activeReservations) {
    if (!byRoom.has(r.roomId)) byRoom.set(r.roomId, r);
  }

  return rooms.map((r) => {
    const hit = byRoom.get(r.roomId);
    return {
      roomId: r.roomId,
      roomNumber: r.roomNumber,
      roomTypeName: r.roomTypeName,
      floor: r.floor,
      available: !hit,
      reservationId: hit?.id ?? null,
      source: hit?.source ?? null,
      guestName: hit?.guestName ?? null,
      checkInDate: hit?.checkInDate ?? null,
      checkOutDate: hit?.checkOutDate ?? null,
    };
  });
}
