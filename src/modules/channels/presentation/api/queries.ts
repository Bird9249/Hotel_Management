import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/kit";
import type {
  ChannelRoomMappingUpsertInput,
  RoomTypeAvailabilityQueryDTO,
  SalesChannelUpdateInput,
} from "@/modules/channels/domain/contracts";
import { channelsApi } from "./client";

export const channelKeys = {
  all: ["channels"] as const,
  list: () => ["channels", "list"] as const,
  mappings: (channelId: string) => ["channels", "mappings", channelId] as const,
  availability: (q: RoomTypeAvailabilityQueryDTO) =>
    ["channels", "availability", q] as const,
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
