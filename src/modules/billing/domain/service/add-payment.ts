import { randomUUIDv7 } from "bun";
import type { DbTransaction } from "@/shared/types";
import type { AddPaymentInput } from "../contracts";
import { toMoney } from "../lib/money";
import { addPayment as addPaymentDb } from "../repo/add-payment";
import { getInvoiceById } from "../repo/get-invoice-by-id";
import { getOpenShift } from "../repo/get-open-shift";
import { sumPayments } from "../repo/sum-payments";
import { updateInvoiceStatus } from "../repo/update-invoice-status";

function resolvePaymentStatus(paidTotal: number, invoiceTotal: number) {
  if (paidTotal >= invoiceTotal) return "paid";
  if (paidTotal > 0) return "partially_paid";
  return "unpaid";
}

export async function addPaymentService(
  client: DbTransaction,
  params: {
    invoiceId: string;
    input: AddPaymentInput;
    actorId?: string | null;
  },
) {
  const invoice = await getInvoiceById(params.invoiceId, client);
  if (!invoice) throw new Error("INVOICE_NOT_FOUND");
  if (invoice.status === "paid") throw new Error("INVOICE_ALREADY_PAID");

  const openShift = await getOpenShift(client);

  const payment = await addPaymentDb(
    {
      id: randomUUIDv7(),
      invoiceId: params.invoiceId,
      method: params.input.method,
      amount: toMoney(params.input.amount),
      shiftId: openShift?.id ?? null,
      recordedByUserId: params.actorId ?? null,
    },
    client,
  );
  if (!payment) throw new Error("Failed to add payment");

  const paidTotal = await sumPayments(params.invoiceId, client);
  const total = Number(invoice.total);
  const status = resolvePaymentStatus(paidTotal, total);
  await updateInvoiceStatus(params.invoiceId, status, client);

  const detail = await getInvoiceById(params.invoiceId, client);
  if (!detail) throw new Error("INVOICE_NOT_FOUND");
  return { payment, invoice: detail };
}
