import type { DbTransaction } from "@/shared/types";
import type { ChannelWebhookPayload } from "../contracts";
import { createSyncLog } from "../repo/create-sync-log";
import { getChannelByCode } from "../repo/get-channel-by-code";
import { updateSyncLog } from "../repo/sync-log";
import { importExternalReservationService } from "./import-external-reservation";

export async function processChannelWebhookService(
  client: DbTransaction,
  params: {
    channelCode: string;
    input: ChannelWebhookPayload;
  },
) {
  const channel = await getChannelByCode(params.channelCode, client);
  if (!channel) throw new Error("CHANNEL_NOT_FOUND");

  const log = await createSyncLog(
    {
      channelId: channel.id,
      direction: "pull",
      operation: "reservation",
      status: "partial",
      requestSummary: {
        externalBookingId: params.input.externalBookingId,
        externalRoomTypeId: params.input.externalRoomTypeId,
        status: params.input.status,
      },
    },
    client,
  );

  try {
    const result = await importExternalReservationService(client, params);
    if (log) {
      await updateSyncLog(
        log.id,
        {
          status: "success",
          requestSummary: {
            externalBookingId: params.input.externalBookingId,
            created: result.created,
            cancelled: result.cancelled,
            reservationId: result.reservation?.id ?? null,
          },
        },
        client,
      );
    }
    return { ...result, logId: log?.id ?? null };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (log) {
      await updateSyncLog(
        log.id,
        {
          status: "failed",
          errorMessage: message,
        },
        client,
      );
    }
    throw error;
  }
}
