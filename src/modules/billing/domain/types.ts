import type { getInvoiceById } from "./repo/get-invoice-by-id";
import type { getShiftById } from "./repo/get-shift-by-id";
import type { listInvoices } from "./repo/list-invoices";
import type { listPaymentsByInvoice } from "./repo/list-payments-by-invoice";
import type { listShifts } from "./repo/list-shifts";
import type { addPaymentService } from "./service/add-payment";
import type { closeShiftService } from "./service/close-shift";
import type { createInvoiceService } from "./service/create-invoice";
import type { getCurrentShiftService } from "./service/get-current-shift";
import type { openShiftService } from "./service/open-shift";

export type InvoicesListResult = Awaited<ReturnType<typeof listInvoices>>;
export type InvoiceByIdResult = NonNullable<
  Awaited<ReturnType<typeof getInvoiceById>>
> & {
  verifyToken: string;
};
export type InvoicePaymentsResult = Awaited<
  ReturnType<typeof listPaymentsByInvoice>
>;
export type CreateInvoiceServiceResult = Awaited<
  ReturnType<typeof createInvoiceService>
>;
export type AddPaymentServiceResult = Awaited<
  ReturnType<typeof addPaymentService>
>;
export type CurrentShiftResult = Awaited<
  ReturnType<typeof getCurrentShiftService>
>;
export type OpenShiftServiceResult = Awaited<
  ReturnType<typeof openShiftService>
>;
export type CloseShiftServiceResult = Awaited<
  ReturnType<typeof closeShiftService>
>;
export type ShiftByIdResult = Awaited<ReturnType<typeof getShiftById>>;
export type ShiftsListResult = Awaited<ReturnType<typeof listShifts>>;
