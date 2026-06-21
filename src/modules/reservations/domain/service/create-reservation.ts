import { randomUUIDv7 } from "bun";
import { reserveInventoryService } from "@/modules/channels/domain/service/reserve-inventory";
import { getGuestById } from "@/modules/guests/domain/repo/get-guest-by-id";
import type { DbTransaction } from "@/shared/types";
import type { ReservationCreateInput } from "../contracts";
import { createReservation } from "../repo/create-reservation";

export async function createReservationService(
  client: DbTransaction,
  params: { input: ReservationCreateInput },
) {
  const guest = await getGuestById(params.input.guestId, client);
  if (!guest) throw new Error("Guest not found");

  await reserveInventoryService(client, {
    roomId: params.input.roomId,
    checkInDate: params.input.checkInDate,
    checkOutDate: params.input.checkOutDate,
  });

  const created = await createReservation(
    {
      id: randomUUIDv7(),
      guestId: params.input.guestId,
      roomId: params.input.roomId,
      checkInDate: params.input.checkInDate,
      checkOutDate: params.input.checkOutDate,
      guestsCount: params.input.guestsCount,
      status: "booked",
      source: "front_desk",
    },
    client,
  );
  if (!created) throw new Error("Failed to create reservation");
  return { created };
}
