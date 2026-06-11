import type { getGuestById } from "./repo/get-guest-by-id";
import type { listGuests } from "./repo/list-guests";
import type { createGuestService } from "./service/create-guest";
import type { deleteGuestService } from "./service/delete-guest";
import type { updateGuestService } from "./service/update-guest";

export type GuestsListResult = Awaited<ReturnType<typeof listGuests>>;
export type GuestByIdResult = Awaited<ReturnType<typeof getGuestById>>;
export type CreateGuestServiceResult = Awaited<
  ReturnType<typeof createGuestService>
>;
export type UpdateGuestServiceResult = Awaited<
  ReturnType<typeof updateGuestService>
>;
export type DeleteGuestServiceResult = Awaited<
  ReturnType<typeof deleteGuestService>
>;
