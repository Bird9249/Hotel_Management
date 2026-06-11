import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AddPaymentInput,
  CreateInvoiceInput,
} from "@/modules/billing/domain/contracts";
import type { OffsetPageQueryDTO } from "@/shared/contracts/base";
import { billingApi } from "./client";

export const invoicesKeys = {
  all: ["invoices"] as const,
  list: (q: Partial<OffsetPageQueryDTO>) => ["invoices", "list", q] as const,
  detail: (id: string) => ["invoices", "detail", id] as const,
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
    },
  });
}
