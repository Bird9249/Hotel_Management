import { eq } from "drizzle-orm";
import type { DbClient } from "@/server/platform/db/client";
import { guest } from "@/server/platform/db/schema/hotel-guests";
import { reservation } from "@/server/platform/db/schema/reservations";
import { room } from "@/server/platform/db/schema/rooms";
import type { DbTransaction } from "@/shared/types";

export type ReservationDetailRow = {
  id: string;
  guestId: string;
  guestName: string;
  roomId: string;
  roomNumber: string;
  checkInDate: string;
  checkOutDate: string;
  guestsCount: number;
  status: string;
  createdAt: Date;
};

export async function getReservationById(
  id: string,
  client: DbTransaction | DbClient,
): Promise<ReservationDetailRow | null> {
  const [row] = await client
    .select({
      id: reservation.id,
      guestId: reservation.guestId,
      guestName: guest.fullName,
      roomId: reservation.roomId,
      roomNumber: room.roomNumber,
      checkInDate: reservation.checkInDate,
      checkOutDate: reservation.checkOutDate,
      guestsCount: reservation.guestsCount,
      status: reservation.status,
      createdAt: reservation.createdAt,
    })
    .from(reservation)
    .innerJoin(guest, eq(reservation.guestId, guest.id))
    .innerJoin(room, eq(reservation.roomId, room.id))
    .where(eq(reservation.id, id))
    .limit(1);
  return row ?? null;
}
