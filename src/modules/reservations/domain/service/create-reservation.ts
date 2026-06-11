import { randomUUIDv7 } from "bun";
import { getGuestById } from "@/modules/guests/domain/repo/get-guest-by-id";
import { getRoomById } from "@/modules/rooms/domain/repo/get-room-by-id";
import type { DbTransaction } from "@/shared/types";
import type { ReservationCreateInput } from "../contracts";
import { createReservation } from "../repo/create-reservation";
import { findOverlapping } from "../repo/find-overlapping";

export async function createReservationService(
  client: DbTransaction,
  params: { input: ReservationCreateInput },
) {
  const guest = await getGuestById(params.input.guestId, client);
  if (!guest) throw new Error("Guest not found");
  const room = await getRoomById(params.input.roomId, client);
  if (!room) throw new Error("Room not found");

  const overlap = await findOverlapping(
    {
      roomId: params.input.roomId,
      checkInDate: params.input.checkInDate,
      checkOutDate: params.input.checkOutDate,
    },
    client,
  );
  if (overlap) throw new Error("ROOM_NOT_AVAILABLE");

  const created = await createReservation(
    {
      id: randomUUIDv7(),
      guestId: params.input.guestId,
      roomId: params.input.roomId,
      checkInDate: params.input.checkInDate,
      checkOutDate: params.input.checkOutDate,
      guestsCount: params.input.guestsCount,
      status: "booked",
    },
    client,
  );
  if (!created) throw new Error("Failed to create reservation");
  return { created };
}
