import type { DbTransaction } from "@/shared/types";
import { cancelReservation } from "../repo/cancel-reservation";
import { getReservationById } from "../repo/get-reservation-by-id";

export async function cancelReservationService(
  client: DbTransaction,
  params: { id: string },
) {
  const before = await getReservationById(params.id, client);
  if (!before) throw new Error("Reservation not found");
  if (before.status === "cancelled") throw new Error("ALREADY_CANCELLED");
  if (before.status === "checked_out") {
    throw new Error("CANNOT_CANCEL_CHECKED_OUT");
  }

  const updated = await cancelReservation(params.id, client);
  if (!updated) throw new Error("Failed to cancel reservation");
  return { updated, before };
}
