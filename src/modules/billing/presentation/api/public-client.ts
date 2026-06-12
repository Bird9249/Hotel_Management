import type { InvoiceVerifyPublicDTO } from "@/modules/billing/domain/contracts";
import { config } from "@/shared/lib/config";

const publicBase = `${config.apiUrl}/public`;

export async function fetchPublicJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const data = (await res.json().catch(() => null)) as {
    error?: string;
    message?: string;
  } | null;

  if (!res.ok) {
    throw new Error(data?.error ?? data?.message ?? "REQUEST_FAILED");
  }

  return data as T;
}

export const invoiceVerifyPublicApi = {
  verify(invoiceId: string, token: string) {
    const url = new URL(`${publicBase}/invoices/${encodeURIComponent(invoiceId)}/verify`);
    url.searchParams.set("t", token);
    return fetchPublicJson<InvoiceVerifyPublicDTO>(url.toString());
  },
};
