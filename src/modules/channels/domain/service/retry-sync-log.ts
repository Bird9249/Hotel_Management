import type { DbClient } from "@/server/platform/db/client";
import type { DbTransaction } from "@/shared/types";
import type { ChannelWebhookPayload } from "../contracts";
import { getSyncLogById } from "../repo/sync-log";
import { importExternalReservationService } from "./import-external-reservation";
import { syncChannelAvailabilityService } from "./sync-channel-availability";

export async function retrySyncLogService(
  client: DbTransaction | DbClient,
  params: { logId: string },
) {
  const log = await getSyncLogById(params.logId, client);
  if (!log) throw new Error("SYNC_LOG_NOT_FOUND");

  if (log.operation === "availability" && log.direction === "push") {
    const summary = (log.requestSummary ?? {}) as {
      from?: string;
      to?: string;
    };
    return syncChannelAvailabilityService(client, {
      channelId: log.channelId,
      from: summary.from,
      to: summary.to,
    });
  }

  if (log.operation === "reservation" && log.direction === "pull") {
    const summary = (log.requestSummary ?? {}) as ChannelWebhookPayload;
    if (!summary.externalBookingId || !summary.externalRoomTypeId) {
      throw new Error("SYNC_LOG_NOT_RETRYABLE");
    }

    const { getChannelById } = await import("../repo/get-channel-by-id");
    const channel = await getChannelById(log.channelId, client);
    if (!channel) throw new Error("CHANNEL_NOT_FOUND");

    return importExternalReservationService(client, {
      channelCode: channel.code,
      input: {
        externalBookingId: summary.externalBookingId,
        externalRoomTypeId: summary.externalRoomTypeId,
        guestName: summary.guestName ?? "OTA Guest",
        phone: summary.phone ?? "00000000",
        email: summary.email,
        checkInDate: summary.checkInDate,
        checkOutDate: summary.checkOutDate,
        guestsCount: summary.guestsCount ?? 1,
        status: summary.status ?? "booked",
        note: summary.note,
      },
    });
  }

  throw new Error("SYNC_LOG_NOT_RETRYABLE");
}
