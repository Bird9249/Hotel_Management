import { eq } from "drizzle-orm";
import type { DbClient } from "@/server/platform/db/client";
import { guest } from "@/server/platform/db/schema/hotel-guests";
import { reservation } from "@/server/platform/db/schema/reservations";
import { room, roomType } from "@/server/platform/db/schema/rooms";
import type { DbTransaction } from "@/shared/types";

export type ReservationForBilling = {
  id: string;
  guestName: string;
  roomNumber: string;
  roomTypeName: string | null;
  checkInDate: string;
  checkOutDate: string;
  status: string;
  basePrice: string;
};

export async function getReservationForBilling(
  id: string,
  client: DbTransaction | DbClient,
): Promise<ReservationForBilling | null> {
  const [row] = await client
    .select({
      id: reservation.id,
      guestName: guest.fullName,
      roomNumber: room.roomNumber,
      roomTypeName: roomType.name,
      checkInDate: reservation.checkInDate,
      checkOutDate: reservation.checkOutDate,
      status: reservation.status,
      basePrice: roomType.basePrice,
    })
    .from(reservation)
    .innerJoin(guest, eq(reservation.guestId, guest.id))
    .innerJoin(room, eq(reservation.roomId, room.id))
    .innerJoin(roomType, eq(room.roomTypeId, roomType.id))
    .where(eq(reservation.id, id))
    .limit(1);
  return row ?? null;
}
