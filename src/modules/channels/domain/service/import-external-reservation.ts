import { randomUUIDv7 } from "bun";
import { findAvailableRoomForRoomType } from "@/modules/booking-engine/domain/repo/find-available-room";
import { publishChannelReservationImportedEvent } from "@/modules/channels/domain/events/channel-reservation-events";
import { createGuest } from "@/modules/guests/domain/repo/create-guest";
import { getReservationById } from "@/modules/reservations/domain/repo/get-reservation-by-id";
import { createReservation } from "@/modules/reservations/domain/repo/create-reservation";
import { findOverlapping } from "@/modules/reservations/domain/repo/find-overlapping";
import { updateReservation } from "@/modules/reservations/domain/repo/update-reservation";
import type { DbTransaction } from "@/shared/types";
import type { ChannelWebhookPayload } from "../contracts";
import { getChannelByCode } from "../repo/get-channel-by-code";
import { getMappingByExternalRoomType } from "../repo/get-mapping-by-external-room-type";
import { getReservationByExternalId } from "../repo/get-reservation-by-external-id";
import { reserveInventoryService } from "./reserve-inventory";

async function emitChannelReservationEvent(
  client: DbTransaction,
  params: {
    channel: { code: string; name: string };
    input: ChannelWebhookPayload;
    reservationId: string | null;
    action: "created" | "updated" | "cancelled";
    roomTypeName: string | null;
    roomNumber?: string | null;
  },
) {
  let roomNumber = params.roomNumber ?? null;
  let guestName = params.input.guestName;
  let checkInDate = params.input.checkInDate;
  let checkOutDate = params.input.checkOutDate;

  if (params.reservationId) {
    const detail = await getReservationById(params.reservationId, client);
    if (detail) {
      roomNumber = detail.roomNumber;
      guestName = detail.guestName;
      checkInDate = detail.checkInDate;
      checkOutDate = detail.checkOutDate;
    }
  }

  publishChannelReservationImportedEvent({
    channelCode: params.channel.code,
    channelName: params.channel.name,
    externalBookingId: params.input.externalBookingId,
    reservationId: params.reservationId,
    guestName,
    roomNumber,
    roomTypeName: params.roomTypeName,
    checkInDate,
    checkOutDate,
    action: params.action,
  });
}

export async function importExternalReservationService(
  client: DbTransaction,
  params: {
    channelCode: string;
    input: ChannelWebhookPayload;
  },
) {
  const channel = await getChannelByCode(params.channelCode, client);
  if (!channel) throw new Error("CHANNEL_NOT_FOUND");
  if (!channel.isActive) throw new Error("CHANNEL_INACTIVE");

  const mapping = await getMappingByExternalRoomType(
    {
      channelId: channel.id,
      externalRoomTypeId: params.input.externalRoomTypeId,
    },
    client,
  );
  if (!mapping) throw new Error("ROOM_MAPPING_NOT_FOUND");

  const existing = await getReservationByExternalId(
    {
      channelId: channel.id,
      externalBookingId: params.input.externalBookingId,
    },
    client,
  );

  if (params.input.status === "cancelled") {
    if (!existing)
      return { reservation: null, created: false, cancelled: false };
    const updated = await updateReservation(
      existing.id,
      { status: "cancelled" },
      client,
    );
    await emitChannelReservationEvent(client, {
      channel,
      input: params.input,
      reservationId: updated?.id ?? existing.id,
      action: "cancelled",
      roomTypeName: mapping.roomTypeName,
    });
    return { reservation: updated, created: false, cancelled: true };
  }

  if (existing) {
    const overlap = await findOverlapping(
      {
        roomId: existing.roomId,
        checkInDate: params.input.checkInDate,
        checkOutDate: params.input.checkOutDate,
        excludeId: existing.id,
      },
      client,
    );

    let roomId = existing.roomId;
    if (!overlap) {
      await reserveInventoryService(client, {
        roomId: existing.roomId,
        checkInDate: params.input.checkInDate,
        checkOutDate: params.input.checkOutDate,
        excludeReservationId: existing.id,
      });
    } else {
      const availableRoom = await findAvailableRoomForRoomType(
        {
          roomTypeId: mapping.roomTypeId,
          checkInDate: params.input.checkInDate,
          checkOutDate: params.input.checkOutDate,
        },
        client,
      );
      if (!availableRoom) throw new Error("ROOM_NOT_AVAILABLE");
      roomId = availableRoom.id;
    }

    const updated = await updateReservation(
      existing.id,
      {
        roomId,
        checkInDate: params.input.checkInDate,
        checkOutDate: params.input.checkOutDate,
        guestsCount: params.input.guestsCount,
        status: "booked",
        notes: params.input.note ?? existing.notes,
        externalPayload: {
          ...(existing.externalPayload as Record<string, unknown> | null),
          source: "channel_webhook",
          email: params.input.email || null,
        },
      },
      client,
    );
    await emitChannelReservationEvent(client, {
      channel,
      input: params.input,
      reservationId: updated?.id ?? existing.id,
      action: "updated",
      roomTypeName: mapping.roomTypeName,
    });
    return { reservation: updated, created: false, cancelled: false };
  }

  const availableRoom = await findAvailableRoomForRoomType(
    {
      roomTypeId: mapping.roomTypeId,
      checkInDate: params.input.checkInDate,
      checkOutDate: params.input.checkOutDate,
    },
    client,
  );
  if (!availableRoom) throw new Error("ROOM_NOT_AVAILABLE");

  await reserveInventoryService(client, {
    roomId: availableRoom.id,
    checkInDate: params.input.checkInDate,
    checkOutDate: params.input.checkOutDate,
  });

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

  const reservation = await createReservation(
    {
      id: randomUUIDv7(),
      guestId: guest.id,
      roomId: availableRoom.id,
      checkInDate: params.input.checkInDate,
      checkOutDate: params.input.checkOutDate,
      guestsCount: params.input.guestsCount,
      status: "booked",
      source: channel.code,
      channelId: channel.id,
      externalBookingId: params.input.externalBookingId,
      externalPayload: {
        source: "channel_webhook",
        email: params.input.email || null,
      },
      notes: params.input.note || null,
    },
    client,
  );
  if (!reservation) throw new Error("FAILED_TO_CREATE_RESERVATION");

  await emitChannelReservationEvent(client, {
    channel,
    input: params.input,
    reservationId: reservation.id,
    action: "created",
    roomTypeName: mapping.roomTypeName,
    roomNumber: availableRoom.roomNumber,
  });

  return { reservation, created: true, cancelled: false };
}
