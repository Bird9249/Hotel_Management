import type {
  AddPaymentInput,
  CreateInvoiceInput,
} from "@/modules/billing/domain/contracts";
import type {
  AddPaymentServiceResult,
  CreateInvoiceServiceResult,
  InvoiceByIdResult,
  InvoicePaymentsResult,
  InvoicesListResult,
} from "@/modules/billing/domain/types";
import type { OffsetPageQueryDTO } from "@/shared/contracts/base";
import { config } from "@/shared/lib/config";
import { fetcher } from "@/shared/lib/fetcher";

export type InvoiceDTO = InvoicesListResult["data"][number];

const hotelBase = `${config.apiUrl}/hotel`;

export const billingApi = {
  async list(query: OffsetPageQueryDTO) {
    const url = new URL(`${hotelBase}/invoices`);
    url.searchParams.set("limit", String(query.limit ?? 20));
    url.searchParams.set("offset", String(query.offset ?? 0));
    if (query.sort) url.searchParams.set("sort", JSON.stringify(query.sort));
    if (query.filters)
      url.searchParams.set("filters", JSON.stringify(query.filters));
    return fetcher.get<InvoicesListResult>(url.toString());
  },
  async get(id: string) {
    return fetcher.get<InvoiceByIdResult>(`${hotelBase}/invoices/${id}`);
  },
  async create(input: CreateInvoiceInput) {
    return fetcher.post<CreateInvoiceServiceResult["created"]>(
      `${hotelBase}/invoices`,
      input,
    );
  },
  async listPayments(id: string) {
    return fetcher.get<InvoicePaymentsResult>(
      `${hotelBase}/invoices/${id}/payments`,
    );
  },
  async addPayment(id: string, input: AddPaymentInput) {
    return fetcher.post<AddPaymentServiceResult>(
      `${hotelBase}/invoices/${id}/payments`,
      input,
    );
  },
};
