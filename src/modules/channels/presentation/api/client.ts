import type {
  ChannelRoomMappingUpsertInput,
  RoomTypeAvailabilityQueryDTO,
  SalesChannelUpdateInput,
  SyncAvailabilityBody,
  SyncLogListQuery,
} from "@/modules/channels/domain/contracts";
import type {
  ChannelMappingsResult,
  ChannelsListResult,
  RetrySyncLogResult,
  RoomTypeAvailabilityResult,
  SyncChannelAvailabilityResult,
  SyncLogsResult,
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
  async logs(channelId: string, query: SyncLogListQuery) {
    const url = new URL(`${hotelBase}/channels/${channelId}/logs`);
    url.searchParams.set("limit", String(query.limit ?? 20));
    url.searchParams.set("offset", String(query.offset ?? 0));
    if (query.status) url.searchParams.set("status", query.status);
    return fetcher.get<SyncLogsResult>(url.toString());
  },
  async sync(channelId: string, body: SyncAvailabilityBody = {}) {
    return fetcher.post<SyncChannelAvailabilityResult>(
      `${hotelBase}/channels/${channelId}/sync`,
      body,
    );
  },
  async testWebhook(channelId: string) {
    return fetcher.post<{
      created: boolean;
      cancelled: boolean;
      reservation: { id: string } | null;
      logId: string | null;
      payload: {
        externalBookingId: string;
        externalRoomTypeId: string;
      };
    }>(`${hotelBase}/channels/${channelId}/test-webhook`);
  },
  async syncAll(body: SyncAvailabilityBody = {}) {
    return fetcher.post<Array<{ channelId: string; ok: boolean }>>(
      `${hotelBase}/channels/sync-all`,
      body,
    );
  },
  async retryLog(logId: string) {
    return fetcher.post<RetrySyncLogResult>(
      `${hotelBase}/channels/logs/${logId}/retry`,
    );
  },
};
