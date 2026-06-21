import { randomUUIDv7 } from "bun";
import { addDays, format } from "date-fns";
import type { DbTransaction } from "@/shared/types";
import type { ChannelWebhookPayload } from "../contracts";
import {
  resolveSeedWebhookExternalRoomTypeId,
  SEED_CHANNEL_WEBHOOK_BOOKING_ID_PREFIX,
  SEED_CHANNEL_WEBHOOK_GUEST_NAMES,
} from "../demo/seed-webhook-fixtures";
import { getChannelById } from "../repo/get-channel-by-id";
import { listRoomMappings } from "../repo/list-room-mappings";
import { processChannelWebhookService } from "./process-channel-webhook";

function buildTestWebhookPayload(
  channelCode: string,
  externalRoomTypeId: string,
): ChannelWebhookPayload {
  const checkIn = addDays(new Date(), 30);
  const checkOut = addDays(checkIn, 2);
  const suffix = randomUUIDv7().slice(0, 8).toUpperCase();
  const bookingPrefix =
    SEED_CHANNEL_WEBHOOK_BOOKING_ID_PREFIX[channelCode] ??
    `DEV-${channelCode.toUpperCase()}`;

  return {
    externalBookingId: `${bookingPrefix}-${suffix}`,
    externalRoomTypeId,
    guestName: SEED_CHANNEL_WEBHOOK_GUEST_NAMES[channelCode] ?? "Webhook Test Guest",
    phone: "02012345678",
    checkInDate: format(checkIn, "yyyy-MM-dd"),
    checkOutDate: format(checkOut, "yyyy-MM-dd"),
    guestsCount: 2,
    status: "booked",
  };
}

export async function testChannelWebhookService(
  client: DbTransaction,
  params: { channelId: string },
) {
  if (process.env.NODE_ENV !== "development") {
    throw new Error("DEV_ONLY");
  }

  const channel = await getChannelById(params.channelId, client);
  if (!channel) throw new Error("CHANNEL_NOT_FOUND");

  const mappings = await listRoomMappings(params.channelId, client);
  const externalRoomTypeId = resolveSeedWebhookExternalRoomTypeId(
    channel.code,
    mappings,
  );

  const input = buildTestWebhookPayload(channel.code, externalRoomTypeId);

  const result = await processChannelWebhookService(client, {
    channelCode: channel.code,
    input,
  });

  return { ...result, payload: input };
}
