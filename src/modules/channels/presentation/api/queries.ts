import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/kit";
import type {
  ChannelRoomMappingUpsertInput,
  RoomTypeAvailabilityQueryDTO,
  SalesChannelUpdateInput,
  SyncAvailabilityBody,
  SyncLogListQuery,
} from "@/modules/channels/domain/contracts";
import { channelsApi } from "./client";

export const channelKeys = {
  all: ["channels"] as const,
  list: () => ["channels", "list"] as const,
  mappings: (channelId: string) => ["channels", "mappings", channelId] as const,
  availability: (q: RoomTypeAvailabilityQueryDTO) =>
    ["channels", "availability", q] as const,
  logs: (channelId: string, q: SyncLogListQuery) =>
    ["channels", "logs", channelId, q] as const,
};

export function useChannelsQuery() {
  return useQuery({
    queryKey: channelKeys.list(),
    queryFn: () => channelsApi.list(),
  });
}

export function useChannelMappingsQuery(channelId: string | null) {
  return useQuery({
    queryKey: channelKeys.mappings(channelId ?? ""),
    queryFn: () => channelsApi.mappings(channelId ?? ""),
    enabled: !!channelId,
  });
}

export function useRoomTypeAvailabilityQuery(
  query: RoomTypeAvailabilityQueryDTO,
) {
  return useQuery({
    queryKey: channelKeys.availability(query),
    queryFn: () => channelsApi.availability(query),
  });
}

export function useUpdateChannel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: SalesChannelUpdateInput;
    }) => channelsApi.update(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: channelKeys.all });
      toast.success("ອັບເດດຊ່ອງທາງສໍາເລັດ");
    },
  });
}

export function useUpsertChannelMapping(channelId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ChannelRoomMappingUpsertInput) => {
      if (!channelId) throw new Error("CHANNEL_REQUIRED");
      return channelsApi.upsertMapping(channelId, input);
    },
    onSuccess: () => {
      if (channelId) {
        qc.invalidateQueries({ queryKey: channelKeys.mappings(channelId) });
      }
      qc.invalidateQueries({ queryKey: channelKeys.all });
      toast.success("ອັບເດດ mapping ສໍາເລັດ");
    },
  });
}

export function useChannelLogsQuery(
  channelId: string | null,
  query: SyncLogListQuery,
) {
  return useQuery({
    queryKey: channelKeys.logs(channelId ?? "", query),
    queryFn: () => channelsApi.logs(channelId ?? "", query),
    enabled: !!channelId,
  });
}

export function useTestChannelWebhook(channelId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => {
      if (!channelId) throw new Error("CHANNEL_REQUIRED");
      return channelsApi.testWebhook(channelId);
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: channelKeys.all });
      if (channelId) {
        qc.invalidateQueries({
          queryKey: channelKeys.logs(channelId, { limit: 20, offset: 0 }),
        });
      }
      toast.success(
        `Test webhook ສຳເລັດ (${data.payload.externalBookingId})`,
      );
    },
    onError: () => {
      toast.error("Test webhook ລົ້ມເຫຼວ");
    },
  });
}

export function useSyncChannel(channelId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: SyncAvailabilityBody = {}) => {
      if (!channelId) throw new Error("CHANNEL_REQUIRED");
      return channelsApi.sync(channelId, body);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: channelKeys.all });
      if (channelId) {
        qc.invalidateQueries({
          queryKey: channelKeys.logs(channelId, { limit: 20, offset: 0 }),
        });
      }
      toast.success("Sync availability ສຳເລັດ");
    },
    onError: () => {
      toast.error("Sync availability ລົ້ມເຫຼວ");
    },
  });
}

export function useRetrySyncLog(channelId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (logId: string) => channelsApi.retryLog(logId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: channelKeys.all });
      if (channelId) {
        qc.invalidateQueries({
          queryKey: channelKeys.logs(channelId, { limit: 20, offset: 0 }),
        });
      }
      toast.success("Retry sync ສຳເລັດ");
    },
    onError: () => {
      toast.error("Retry sync ລົ້ມເຫຼວ");
    },
  });
}
