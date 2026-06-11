import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/kit";
import type {
  RoomCreateInput,
  RoomStatusUpdateInput,
  RoomTypeCreateInput,
  RoomTypeUpdateInput,
  RoomUpdateInput,
} from "@/modules/rooms/domain/contracts";
import type { OffsetPageQueryDTO } from "@/shared/contracts/base";
import { roomTypesApi, roomsApi } from "./client";

export const roomTypesKeys = {
  all: ["room-types"] as const,
  list: (q: Partial<OffsetPageQueryDTO>) =>
    ["room-types", "list", q] as const,
  detail: (id: string) => ["room-types", "detail", id] as const,
};

export const roomsKeys = {
  all: ["rooms"] as const,
  list: (q: Partial<OffsetPageQueryDTO>) => ["rooms", "list", q] as const,
  detail: (id: string) => ["rooms", "detail", id] as const,
};

export function useRoomTypesQuery(query: Partial<OffsetPageQueryDTO> = {}) {
  const q: OffsetPageQueryDTO = {
    limit: query.limit ?? 20,
    offset: query.offset ?? 0,
    sort: query.sort,
    filters: query.filters,
  };
  return useQuery({
    queryKey: roomTypesKeys.list(q),
    queryFn: () => roomTypesApi.list(q),
  });
}

export function useRoomTypeQuery(id: string) {
  return useQuery({
    queryKey: roomTypesKeys.detail(id),
    queryFn: () => roomTypesApi.get(id),
    enabled: !!id,
  });
}

export function useCreateRoomType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: RoomTypeCreateInput) => roomTypesApi.create(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: roomTypesKeys.all });
      toast.success("ສ້າງປະເພດຫ້ອງສໍາເລັດ");
    },
  });
}

export function useUpdateRoomType(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: RoomTypeUpdateInput) =>
      roomTypesApi.update(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: roomTypesKeys.detail(id) });
      qc.invalidateQueries({ queryKey: roomTypesKeys.all });
      toast.success("ແກ້ໄຂປະເພດຫ້ອງສໍາເລັດ");
    },
  });
}

export function useDeleteRoomType() {
  const qc = useQueryClient();
  const base = useMutation({
    mutationFn: (id: string) => roomTypesApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: roomTypesKeys.all });
    },
  });

  const run = (id: string) =>
    new Promise<void>((resolve, reject) => {
      base.mutate(id, {
        onSuccess: () => resolve(),
        onError: (e) => reject(e),
      });
    });

  return { ...base, run };
}

export function useRoomsQuery(query: Partial<OffsetPageQueryDTO> = {}) {
  const q: OffsetPageQueryDTO = {
    limit: query.limit ?? 20,
    offset: query.offset ?? 0,
    sort: query.sort,
    filters: query.filters,
  };
  return useQuery({
    queryKey: roomsKeys.list(q),
    queryFn: () => roomsApi.list(q),
  });
}

export function useRoomQuery(id: string) {
  return useQuery({
    queryKey: roomsKeys.detail(id),
    queryFn: () => roomsApi.get(id),
    enabled: !!id,
  });
}

export function useCreateRoom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: RoomCreateInput) => roomsApi.create(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: roomsKeys.all });
      toast.success("ສ້າງຫ້ອງສໍາເລັດ");
    },
  });
}

export function useUpdateRoom(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: RoomUpdateInput) => roomsApi.update(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: roomsKeys.detail(id) });
      qc.invalidateQueries({ queryKey: roomsKeys.all });
      toast.success("ແກ້ໄຂຫ້ອງສໍາເລັດ");
    },
  });
}

export function useSetRoomStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: RoomStatusUpdateInput;
    }) => roomsApi.setStatus(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: roomsKeys.all });
      toast.success("ອັບເດດສະຖານະຫ້ອງສໍາເລັດ");
    },
  });
}

export function useDeleteRoom() {
  const qc = useQueryClient();
  const base = useMutation({
    mutationFn: (id: string) => roomsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: roomsKeys.all });
    },
  });

  const run = (id: string) =>
    new Promise<void>((resolve, reject) => {
      base.mutate(id, {
        onSuccess: () => resolve(),
        onError: (e) => reject(e),
      });
    });

  return { ...base, run };
}
