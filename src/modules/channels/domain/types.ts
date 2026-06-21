import type { listChannels } from "./repo/list-channels";
import type { listRoomMappings } from "./repo/list-room-mappings";
import type { listSyncLogs } from "./repo/list-sync-logs";
import type { getRoomTypeAvailabilityService } from "./service/get-room-type-availability";
import type { retrySyncLogService } from "./service/retry-sync-log";
import type { syncChannelAvailabilityService } from "./service/sync-channel-availability";
import type { updateChannelService } from "./service/update-channel";
import type { upsertRoomMappingService } from "./service/upsert-room-mapping";

export type ChannelsListResult = Awaited<ReturnType<typeof listChannels>>;
export type ChannelDTO = ChannelsListResult[number];
export type ChannelMappingsResult = Awaited<
  ReturnType<typeof listRoomMappings>
>;
export type RoomTypeAvailabilityResult = Awaited<
  ReturnType<typeof getRoomTypeAvailabilityService>
>;
export type UpdateChannelServiceResult = Awaited<
  ReturnType<typeof updateChannelService>
>;
export type UpsertRoomMappingServiceResult = Awaited<
  ReturnType<typeof upsertRoomMappingService>
>;
export type SyncLogsResult = Awaited<ReturnType<typeof listSyncLogs>>;
export type SyncLogDTO = SyncLogsResult["data"][number];
export type SyncChannelAvailabilityResult = Awaited<
  ReturnType<typeof syncChannelAvailabilityService>
>;
export type RetrySyncLogResult = Awaited<
  ReturnType<typeof retrySyncLogService>
>;
