import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/kit";
import type {
  GuestCreateInput,
  GuestUpdateInput,
} from "@/modules/guests/domain/contracts";
import type { OffsetPageQueryDTO } from "@/shared/contracts/base";
import { guestsApi } from "./client";

export const guestsKeys = {
  all: ["guests"] as const,
  list: (q: Partial<OffsetPageQueryDTO>) => ["guests", "list", q] as const,
  detail: (id: string) => ["guests", "detail", id] as const,
};

export function useGuestsQuery(query: Partial<OffsetPageQueryDTO> = {}) {
  const q: OffsetPageQueryDTO = {
    limit: query.limit ?? 20,
    offset: query.offset ?? 0,
    sort: query.sort,
    filters: query.filters,
  };
  return useQuery({
    queryKey: guestsKeys.list(q),
    queryFn: () => guestsApi.list(q),
  });
}

export function useGuestQuery(id: string) {
  return useQuery({
    queryKey: guestsKeys.detail(id),
    queryFn: () => guestsApi.get(id),
    enabled: !!id,
  });
}

export function useCreateGuest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: GuestCreateInput) => guestsApi.create(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: guestsKeys.all });
      toast.success("ສ້າງລູກຄ້າສໍາເລັດ");
    },
  });
}

export function useUpdateGuest(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: GuestUpdateInput) => guestsApi.update(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: guestsKeys.detail(id) });
      qc.invalidateQueries({ queryKey: guestsKeys.all });
      toast.success("ແກ້ໄຂລູກຄ້າສໍາເລັດ");
    },
  });
}

export function useDeleteGuest() {
  const qc = useQueryClient();
  const base = useMutation({
    mutationFn: (id: string) => guestsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: guestsKeys.all });
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
