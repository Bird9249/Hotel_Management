import type { DbClient } from "@/server/platform/db/client";
import type { DbTransaction } from "@/shared/types";
import { getChannelAdapter } from "../adapters/registry";
import { createSyncLog } from "../repo/create-sync-log";
import { getChannelById } from "../repo/get-channel-by-id";
import { listRoomMappings } from "../repo/list-room-mappings";
import { listRoomTypeAvailability } from "../repo/list-room-type-availability";
import { updateSyncLog } from "../repo/sync-log";
import { updateChannel } from "../repo/update-channel";

function defaultDateRange() {
  const from = new Date();
  const to = new Date(from);
  to.setDate(to.getDate() + 30);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

async function recordChannelSyncResult(
  client: DbTransaction | DbClient,
  params: {
    channelId: string;
    success: boolean;
    errorMessage?: string;
  },
) {
  const channel = await getChannelById(params.channelId, client);
  const config =
    (channel?.config as Record<string, unknown> | null | undefined) ?? {};
  const consecutiveFailures = params.success
    ? 0
    : Number(config.consecutiveFailures ?? 0) + 1;

  await updateChannel(
    params.channelId,
    {
      lastSyncAt: params.success ? new Date() : (channel?.lastSyncAt ?? null),
      config: {
        ...config,
        consecutiveFailures,
        lastSyncAlertAt:
          consecutiveFailures >= 3
            ? new Date().toISOString()
            : config.lastSyncAlertAt,
      },
    },
    client,
  );

  return { consecutiveFailures };
}

export async function syncChannelAvailabilityService(
  client: DbTransaction | DbClient,
  params: {
    channelId: string;
    from?: string;
    to?: string;
  },
) {
  const range = defaultDateRange();
  const from = params.from ?? range.from;
  const to = params.to ?? range.to;
  if (to <= from) throw new Error("INVALID_DATE_RANGE");

  const channel = await getChannelById(params.channelId, client);
  if (!channel) throw new Error("CHANNEL_NOT_FOUND");
  if (!channel.isActive) throw new Error("CHANNEL_INACTIVE");

  const adapter = getChannelAdapter(channel.code);
  const mappings = await listRoomMappings(channel.id, client);
  const availability = await listRoomTypeAvailability({ from, to }, client);

  const log = await createSyncLog(
    {
      channelId: channel.id,
      direction: "push",
      operation: "availability",
      status: "partial",
      requestSummary: { from, to, mappingCount: mappings.length },
    },
    client,
  );

  try {
    const result = await adapter.pushAvailability({
      channel: {
        id: channel.id,
        code: channel.code,
        name: channel.name,
        isActive: channel.isActive,
        config: (channel.config as Record<string, unknown> | null) ?? null,
      },
      mappings,
      availability,
      from,
      to,
    });

    if (log) {
      await updateSyncLog(
        log.id,
        {
          status: "success",
          requestSummary: {
            from,
            to,
            mappingCount: mappings.length,
            pushedCount: result.pushedCount,
          },
        },
        client,
      );
    }

    await recordChannelSyncResult(client, {
      channelId: channel.id,
      success: true,
    });

    return {
      channelId: channel.id,
      pushedCount: result.pushedCount,
      logId: log?.id,
    };
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
    await recordChannelSyncResult(client, {
      channelId: channel.id,
      success: false,
      errorMessage: message,
    });
    throw error;
  }
}

export async function syncAllActiveChannelsService(
  client: DbTransaction | DbClient,
  params?: { from?: string; to?: string },
) {
  const { listChannels } = await import("../repo/list-channels");
  const channels = await listChannels(client);
  const results = [];

  for (const channel of channels) {
    if (!channel.isActive) continue;
    try {
      const result = await syncChannelAvailabilityService(client, {
        channelId: channel.id,
        from: params?.from,
        to: params?.to,
      });
      results.push({ channelId: channel.id, ok: true, ...result });
    } catch (error) {
      results.push({
        channelId: channel.id,
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return results;
}
