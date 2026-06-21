import { randomUUIDv7 } from "bun";
import { getChannelByCode } from "@/modules/channels/domain/repo/get-channel-by-code";
import { createGuest } from "@/modules/guests/domain/repo/create-guest";
import { publishHousekeepingEvent } from "@/modules/housekeeping/domain/events/housekeeping-events";
import { createReservation } from "@/modules/reservations/domain/repo/create-reservation";
import type { DbTransaction } from "@/shared/types";
import type { ConfirmBookingInput } from "../contracts";
import { findAvailableRoomForRoomType } from "../repo/find-available-room";
import { getBookingByCode } from "../repo/get-booking-by-code";
import {
  getBookingHoldById,
  isBookingHoldExpired,
  releaseBookingHold,
} from "../repo/holds";
import { releaseExpiredBookingHoldsService } from "./release-expired-holds";

function createBookingCode() {
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `DW-${new Date().getFullYear()}-${suffix}`;
}

export async function confirmBookingService(
  client: DbTransaction,
  params: { input: ConfirmBookingInput },
) {
  if (params.input.website) throw new Error("BOT_DETECTED");

  await releaseExpiredBookingHoldsService(client, { force: true });

  const hold = await getBookingHoldById(params.input.holdId, client);
  if (!hold) throw new Error("HOLD_NOT_FOUND");
  if (await isBookingHoldExpired(hold.id, client)) {
    await releaseBookingHold(hold.id, client);
    throw new Error("HOLD_EXPIRED");
  }

  const availableRoom = await findAvailableRoomForRoomType(
    {
      roomTypeId: hold.roomTypeId,
      checkInDate: hold.checkInDate,
      checkOutDate: hold.checkOutDate,
    },
    client,
  );
  if (!availableRoom) throw new Error("ROOM_TYPE_NOT_AVAILABLE");

  const guest = await createGuest(
    {
      id: randomUUIDv7(),
      fullName: params.input.guestName,
      phone: params.input.phone,
      nationality: params.input.email || null,
    },
    client,
  );
  if (!guest) throw new Error("FAILED_TO_CREATE_GUEST");

  let code = createBookingCode();
  for (let attempt = 0; attempt < 3; attempt++) {
    const existing = await getBookingByCode(code, client);
    if (!existing) break;
    code = createBookingCode();
  }

  const directChannel = await getChannelByCode("direct_web", client);
  const reservation = await createReservation(
    {
      id: randomUUIDv7(),
      guestId: guest.id,
      roomId: availableRoom.id,
      checkInDate: hold.checkInDate,
      checkOutDate: hold.checkOutDate,
      guestsCount: params.input.guestsCount,
      status: "booked",
      source: "direct_web",
      channelId: directChannel?.id ?? null,
      externalBookingId: code,
      externalPayload: {
        source: "booking_engine",
        email: params.input.email || null,
      },
      notes: params.input.note || null,
    },
    client,
  );
  if (!reservation) throw new Error("FAILED_TO_CREATE_BOOKING");

  const booking = await getBookingByCode(code, client);
  await releaseBookingHold(hold.id, client);
  if (booking) {
    publishHousekeepingEvent({
      type: "direct_booking_created",
      code,
      reservationId: reservation.id,
      guestName: booking.guestName,
      roomNumber: booking.roomNumber,
      roomTypeName: booking.roomTypeName,
      checkInDate: booking.checkInDate,
      checkOutDate: booking.checkOutDate,
      occurredAt: new Date().toISOString(),
    });
  }

  return { code, reservation };
}
