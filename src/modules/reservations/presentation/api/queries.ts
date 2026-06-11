import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/kit";
import type {
  AvailabilityQueryDTO,
  ReservationCreateInput,
  ReservationUpdateInput,
} from "@/modules/reservations/domain/contracts";
import { roomsKeys } from "@/modules/rooms/presentation/api/queries";
import type { OffsetPageQueryDTO } from "@/shared/contracts/base";
import { reservationsApi } from "./client";

export const reservationsKeys = {
  all: ["reservations"] as const,
  list: (q: Partial<OffsetPageQueryDTO>) =>
    ["reservations", "list", q] as const,
  detail: (id: string) => ["reservations", "detail", id] as const,
  availability: (q: AvailabilityQueryDTO) =>
    ["reservations", "availability", q] as const,
};

export function useReservationsQuery(query: Partial<OffsetPageQueryDTO> = {}) {
  const q: OffsetPageQueryDTO = {
    limit: query.limit ?? 20,
    offset: query.offset ?? 0,
    sort: query.sort,
    filters: query.filters,
  };
  return useQuery({
    queryKey: reservationsKeys.list(q),
    queryFn: () => reservationsApi.list(q),
  });
}

export function useReservationQuery(id: string) {
  return useQuery({
    queryKey: reservationsKeys.detail(id),
    queryFn: () => reservationsApi.get(id),
    enabled: !!id,
  });
}

export function useAvailabilityQuery(query: AvailabilityQueryDTO | null) {
  const q = query ?? { from: "", to: "" };
  return useQuery({
    queryKey: reservationsKeys.availability(q),
    queryFn: () => reservationsApi.availability(q),
    enabled: !!query && query.from.length > 0 && query.to.length > 0,
  });
}

export function useCreateReservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ReservationCreateInput) =>
      reservationsApi.create(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: reservationsKeys.all });
      toast.success("ສ້າງການຈອງສໍາເລັດ");
    },
  });
}

export function useUpdateReservation(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ReservationUpdateInput) =>
      reservationsApi.update(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: reservationsKeys.detail(id) });
      qc.invalidateQueries({ queryKey: reservationsKeys.all });
      toast.success("ແກ້ໄຂການຈອງສໍາເລັດ");
    },
  });
}

export function useCancelReservation() {
  const qc = useQueryClient();
  const base = useMutation({
    mutationFn: (id: string) => reservationsApi.cancel(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: reservationsKeys.all });
      toast.success("ຍົກເລີກການຈອງສໍາເລັດ");
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

function invalidateFrontDeskQueries(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: reservationsKeys.all });
  qc.invalidateQueries({ queryKey: roomsKeys.all });
}

export function useCheckIn() {
  const qc = useQueryClient();
  const base = useMutation({
    mutationFn: (id: string) => reservationsApi.checkIn(id),
    onSuccess: () => invalidateFrontDeskQueries(qc),
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

export function useCheckOut() {
  const qc = useQueryClient();
  const base = useMutation({
    mutationFn: (id: string) => reservationsApi.checkOut(id),
    onSuccess: () => invalidateFrontDeskQueries(qc),
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
