import { eq } from "drizzle-orm";
import type { DbClient } from "@/server/platform/db/client";
import { guest } from "@/server/platform/db/schema/hotel-guests";
import { reservation } from "@/server/platform/db/schema/reservations";
import { room, roomType } from "@/server/platform/db/schema/rooms";
import type { DbTransaction } from "@/shared/types";

export async function getBookingByCode(
  code: string,
  client: DbTransaction | DbClient,
) {
  const [row] = await client
    .select({
      code: reservation.externalBookingId,
      reservationId: reservation.id,
      status: reservation.status,
      guestName: guest.fullName,
      phone: guest.phone,
      roomNumber: room.roomNumber,
      roomTypeName: roomType.name,
      checkInDate: reservation.checkInDate,
      checkOutDate: reservation.checkOutDate,
      guestsCount: reservation.guestsCount,
      notes: reservation.notes,
      createdAt: reservation.createdAt,
    })
    .from(reservation)
    .innerJoin(guest, eq(reservation.guestId, guest.id))
    .innerJoin(room, eq(reservation.roomId, room.id))
    .leftJoin(roomType, eq(room.roomTypeId, roomType.id))
    .where(eq(reservation.externalBookingId, code))
    .limit(1);
  return row ?? null;
}
