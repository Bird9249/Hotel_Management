import type { DbTransaction } from "@/shared/types";
import type { CreateBookingHoldInput } from "../contracts";
import { createBookingHold } from "../repo/holds";
import { releaseExpiredBookingHoldsService } from "./release-expired-holds";
import { searchPublicAvailabilityService } from "./search-availability";

const DEFAULT_HOLD_MINUTES = 15;

function getHoldMinutes() {
  const raw = process.env.BOOKING_HOLD_MINUTES;
  const parsed = raw ? Number.parseInt(raw, 10) : DEFAULT_HOLD_MINUTES;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_HOLD_MINUTES;
}

export async function createBookingHoldService(
  client: DbTransaction,
  params: { input: CreateBookingHoldInput },
) {
  if (params.input.checkOutDate <= params.input.checkInDate) {
    throw new Error("INVALID_DATE_RANGE");
  }

  await releaseExpiredBookingHoldsService(client, { force: true });

  const availability = await searchPublicAvailabilityService(client, {
    query: {
      from: params.input.checkInDate,
      to: params.input.checkOutDate,
      guests: params.input.guestsCount,
    },
  });
  const selected = availability.roomTypes.find(
    (item) => item.roomTypeId === params.input.roomTypeId,
  );

  if (!selected || selected.availableRooms < 1) {
    throw new Error("ROOM_TYPE_NOT_AVAILABLE");
  }

  const hold = await createBookingHold(
    {
      roomTypeId: params.input.roomTypeId,
      checkInDate: params.input.checkInDate,
      checkOutDate: params.input.checkOutDate,
      source: "direct_web",
      holdMinutes: getHoldMinutes(),
    },
    client,
  );

  if (!hold) throw new Error("FAILED_TO_CREATE_HOLD");
  return { hold, roomType: selected };
}
