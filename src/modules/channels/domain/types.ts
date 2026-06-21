import type { listChannels } from "./repo/list-channels";
import type { listRoomMappings } from "./repo/list-room-mappings";
import type { getRoomTypeAvailabilityService } from "./service/get-room-type-availability";
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
