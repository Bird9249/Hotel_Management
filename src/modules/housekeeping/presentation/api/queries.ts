import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CloseHkShiftInput,
  HkTaskUpdateInput,
} from "@/modules/housekeeping/domain/contracts";
import type { OffsetPageQueryDTO } from "@/shared/contracts/base";
import { housekeepingApi } from "./client";

export const hkShiftKeys = {
  all: ["hk-shifts"] as const,
  current: () => ["hk-shifts", "current"] as const,
  list: (q: Partial<OffsetPageQueryDTO>) => ["hk-shifts", "list", q] as const,
};

export const hkTaskKeys = {
  all: ["hk-tasks"] as const,
  list: () => ["hk-tasks", "list"] as const,
};

export function useCurrentHkShiftQuery(
  enabled = true,
  refetchInterval = 30_000,
) {
  return useQuery({
    queryKey: hkShiftKeys.current(),
    queryFn: () => housekeepingApi.getCurrentShift(),
    enabled,
    refetchInterval,
  });
}

export function useOpenHkShift() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => housekeepingApi.openShift({}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: hkShiftKeys.all });
      qc.invalidateQueries({ queryKey: hkTaskKeys.all });
    },
  });
}

export function useCloseHkShift() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: CloseHkShiftInput }) =>
      housekeepingApi.closeShift(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: hkShiftKeys.all });
      qc.invalidateQueries({ queryKey: hkTaskKeys.all });
    },
  });
}

export function useHkShiftsQuery(
  query: Partial<OffsetPageQueryDTO> = {},
  enabled = true,
) {
  const q: OffsetPageQueryDTO = {
    limit: query.limit ?? 20,
    offset: query.offset ?? 0,
    sort: query.sort,
    filters: query.filters,
  };
  return useQuery({
    queryKey: hkShiftKeys.list(q),
    queryFn: () => housekeepingApi.listShifts(q),
    enabled,
  });
}

export function useHkTasksQuery(enabled = true, refetchInterval = 30_000) {
  return useQuery({
    queryKey: hkTaskKeys.list(),
    queryFn: () => housekeepingApi.listTasks(),
    enabled,
    refetchInterval,
  });
}

export function useUpdateHkTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: HkTaskUpdateInput }) =>
      housekeepingApi.updateTask(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: hkShiftKeys.all });
      qc.invalidateQueries({ queryKey: hkTaskKeys.all });
    },
  });
}
