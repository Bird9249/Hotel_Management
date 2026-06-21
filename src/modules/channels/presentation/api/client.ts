import type {
  ChannelRoomMappingUpsertInput,
  RoomTypeAvailabilityQueryDTO,
  SalesChannelUpdateInput,
} from "@/modules/channels/domain/contracts";
import type {
  ChannelMappingsResult,
  ChannelsListResult,
  RoomTypeAvailabilityResult,
  UpdateChannelServiceResult,
  UpsertRoomMappingServiceResult,
} from "@/modules/channels/domain/types";
import { config } from "@/shared/lib/config";
import { fetcher } from "@/shared/lib/fetcher";

const hotelBase = `${config.apiUrl}/hotel`;

export type ChannelDTO = ChannelsListResult[number];
export type ChannelMappingDTO = ChannelMappingsResult[number];
export type RoomTypeAvailabilityDTO =
  RoomTypeAvailabilityResult["roomTypes"][number];

export const channelsApi = {
  async list() {
    return fetcher.get<ChannelsListResult>(`${hotelBase}/channels`);
  },
  async update(id: string, input: SalesChannelUpdateInput) {
    return fetcher.patch<UpdateChannelServiceResult["updated"]>(
      `${hotelBase}/channels/${id}`,
      input,
    );
  },
  async mappings(channelId: string) {
    return fetcher.get<ChannelMappingsResult>(
      `${hotelBase}/channels/${channelId}/mappings`,
    );
  },
  async upsertMapping(channelId: string, input: ChannelRoomMappingUpsertInput) {
    return fetcher.put<UpsertRoomMappingServiceResult["mapping"]>(
      `${hotelBase}/channels/${channelId}/mappings`,
      input,
    );
  },
  async availability(query: RoomTypeAvailabilityQueryDTO) {
    const url = new URL(`${hotelBase}/channels/availability`);
    url.searchParams.set("from", query.from);
    url.searchParams.set("to", query.to);
    if (query.roomTypeId) url.searchParams.set("roomTypeId", query.roomTypeId);
    return fetcher.get<RoomTypeAvailabilityResult>(url.toString());
  },
};
