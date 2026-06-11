import type { getReservationById } from "./repo/get-reservation-by-id";
import type { listReservations } from "./repo/list-reservations";
import type { listRoomAvailability } from "./repo/list-room-availability";
import type { cancelReservationService } from "./service/cancel-reservation";
import type { checkInService } from "./service/check-in";
import type { checkOutService } from "./service/check-out";
import type { createReservationService } from "./service/create-reservation";
import type { getAvailabilityService } from "./service/get-availability";
import type { updateReservationService } from "./service/update-reservation";

export type ReservationsListResult = Awaited<
  ReturnType<typeof listReservations>
>;
export type ReservationByIdResult = Awaited<
  ReturnType<typeof getReservationById>
>;
export type AvailabilityResult = Awaited<
  ReturnType<typeof getAvailabilityService>
>;
export type RoomAvailabilityItem = Awaited<
  ReturnType<typeof listRoomAvailability>
>[number];
export type CreateReservationServiceResult = Awaited<
  ReturnType<typeof createReservationService>
>;
export type UpdateReservationServiceResult = Awaited<
  ReturnType<typeof updateReservationService>
>;
export type CancelReservationServiceResult = Awaited<
  ReturnType<typeof cancelReservationService>
>;
export type CheckInServiceResult = Awaited<ReturnType<typeof checkInService>>;
export type CheckOutServiceResult = Awaited<ReturnType<typeof checkOutService>>;
