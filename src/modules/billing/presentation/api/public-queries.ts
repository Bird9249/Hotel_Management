import { useQuery } from "@tanstack/react-query";
import { invoiceVerifyPublicApi } from "./public-client";

export const invoiceVerifyKeys = {
  detail: (invoiceId: string, token: string) =>
    ["invoice-verify", invoiceId, token] as const,
};

export function useInvoiceVerifyQuery(invoiceId: string, token: string) {
  return useQuery({
    queryKey: invoiceVerifyKeys.detail(invoiceId, token),
    queryFn: () => invoiceVerifyPublicApi.verify(invoiceId, token),
    enabled: Boolean(invoiceId && token),
    retry: false,
    staleTime: 60_000,
  });
}
