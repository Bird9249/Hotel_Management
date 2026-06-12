import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AddPaymentInput,
  CloseShiftInput,
  CreateInvoiceInput,
  OpenShiftInput,
} from "@/modules/billing/domain/contracts";
import type { OffsetPageQueryDTO } from "@/shared/contracts/base";
import { billingApi } from "./client";

export const invoicesKeys = {
  all: ["invoices"] as const,
  list: (q: Partial<OffsetPageQueryDTO>) => ["invoices", "list", q] as const,
  detail: (id: string) => ["invoices", "detail", id] as const,
};

export const cashShiftKeys = {
  all: ["cash-shifts"] as const,
  current: () => ["cash-shifts", "current"] as const,
  list: (q: Partial<OffsetPageQueryDTO>) => ["cash-shifts", "list", q] as const,
  detail: (id: string) => ["cash-shifts", "detail", id] as const,
};

export function useInvoicesQuery(query: Partial<OffsetPageQueryDTO> = {}) {
  const q: OffsetPageQueryDTO = {
    limit: query.limit ?? 20,
    offset: query.offset ?? 0,
    sort: query.sort,
    filters: query.filters,
  };
  return useQuery({
    queryKey: invoicesKeys.list(q),
    queryFn: () => billingApi.list(q),
  });
}

export function useInvoiceQuery(id: string) {
  return useQuery({
    queryKey: invoicesKeys.detail(id),
    queryFn: () => billingApi.get(id),
    enabled: !!id,
  });
}

export function useCreateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateInvoiceInput) => billingApi.create(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: invoicesKeys.all });
    },
  });
}

export function useAddPayment(invoiceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AddPaymentInput) =>
      billingApi.addPayment(invoiceId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: invoicesKeys.detail(invoiceId) });
      qc.invalidateQueries({ queryKey: invoicesKeys.all });
      qc.invalidateQueries({ queryKey: cashShiftKeys.current() });
    },
  });
}

export function useCurrentShiftQuery(enabled = true) {
  return useQuery({
    queryKey: cashShiftKeys.current(),
    queryFn: () => billingApi.getCurrentShift(),
    enabled,
    refetchInterval: 30_000,
  });
}

export function useOpenShift() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: OpenShiftInput) => billingApi.openShift(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: cashShiftKeys.all });
    },
  });
}

export function useCloseShift() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: CloseShiftInput }) =>
      billingApi.closeShift(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: cashShiftKeys.all });
    },
  });
}

export function useShiftsQuery(
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
    queryKey: cashShiftKeys.list(q),
    queryFn: () => billingApi.listShifts(q),
    enabled,
  });
}
