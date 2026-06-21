import { reserveInventoryService } from "@/modules/channels/domain/service/reserve-inventory";
import { getGuestById } from "@/modules/guests/domain/repo/get-guest-by-id";
import { getRoomById } from "@/modules/rooms/domain/repo/get-room-by-id";
import type { DbTransaction } from "@/shared/types";
import type { ReservationUpdateInput } from "../contracts";
import { getReservationById } from "../repo/get-reservation-by-id";
import { updateReservation } from "../repo/update-reservation";

export async function updateReservationService(
  client: DbTransaction,
  params: { id: string; input: ReservationUpdateInput },
) {
  const before = await getReservationById(params.id, client);
  if (!before) throw new Error("Reservation not found");
  if (before.status === "cancelled" || before.status === "checked_out") {
    throw new Error("RESERVATION_NOT_EDITABLE");
  }

  if (params.input.guestId) {
    const guest = await getGuestById(params.input.guestId, client);
    if (!guest) throw new Error("Guest not found");
  }
  if (params.input.roomId) {
    const room = await getRoomById(params.input.roomId, client);
    if (!room) throw new Error("Room not found");
  }

  const roomId = params.input.roomId ?? before.roomId;
  const checkInDate = params.input.checkInDate ?? before.checkInDate;
  const checkOutDate = params.input.checkOutDate ?? before.checkOutDate;

  await reserveInventoryService(client, {
    roomId,
    checkInDate,
    checkOutDate,
    excludeReservationId: params.id,
  });

  const updated = await updateReservation(params.id, params.input, client);
  if (!updated) throw new Error("Failed to update reservation");
  return { updated, before };
}
