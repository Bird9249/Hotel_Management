import type { getInvoiceById } from "./repo/get-invoice-by-id";
import type { listInvoices } from "./repo/list-invoices";
import type { listPaymentsByInvoice } from "./repo/list-payments-by-invoice";
import type { addPaymentService } from "./service/add-payment";
import type { createInvoiceService } from "./service/create-invoice";

export type InvoicesListResult = Awaited<ReturnType<typeof listInvoices>>;
export type InvoiceByIdResult = Awaited<ReturnType<typeof getInvoiceById>>;
export type InvoicePaymentsResult = Awaited<
  ReturnType<typeof listPaymentsByInvoice>
>;
export type CreateInvoiceServiceResult = Awaited<
  ReturnType<typeof createInvoiceService>
>;
export type AddPaymentServiceResult = Awaited<
  ReturnType<typeof addPaymentService>
>;
