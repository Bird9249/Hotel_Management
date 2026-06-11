import { setRoomStatusService } from "@/modules/rooms/domain/service/set-room-status";
import type { DbTransaction } from "@/shared/types";
import { getReservationById } from "../repo/get-reservation-by-id";
import { updateReservationStatus } from "../repo/update-reservation-status";

export async function checkInService(
  client: DbTransaction,
  params: { reservationId: string },
) {
  const res = await getReservationById(params.reservationId, client);
  if (!res) throw new Error("RESERVATION_NOT_FOUND");
  if (res.status !== "booked") throw new Error("INVALID_STATE");

  const updated = await updateReservationStatus(res.id, "checked_in", client);
  if (!updated) throw new Error("Failed to update reservation");

  await setRoomStatusService(client, {
    id: res.roomId,
    input: { status: "occupied" },
  });

  const detail = await getReservationById(res.id, client);
  if (!detail) throw new Error("RESERVATION_NOT_FOUND");
  return { updated: detail, before: res };
}
