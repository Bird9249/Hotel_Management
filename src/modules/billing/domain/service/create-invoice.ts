import { randomUUIDv7 } from "bun";
import { differenceInCalendarDays, parseISO } from "date-fns";
import type { DbTransaction } from "@/shared/types";
import type { CreateInvoiceInput } from "../contracts";
import { calcTax, lineAmount, toMoney } from "../lib/money";
import { createInvoice as createInvoiceDb } from "../repo/create-invoice";
import { getInvoiceById } from "../repo/get-invoice-by-id";
import { getInvoiceByReservationId } from "../repo/get-invoice-by-reservation";
import { getReservationForBilling } from "../repo/get-reservation-for-billing";
import { insertInvoiceItems } from "../repo/insert-invoice-items";
import { nextInvoiceNumber } from "../repo/next-invoice-number";

function countNights(checkIn: string, checkOut: string) {
  const nights = differenceInCalendarDays(
    parseISO(checkOut),
    parseISO(checkIn),
  );
  return nights > 0 ? nights : 1;
}

export async function createInvoiceService(
  client: DbTransaction,
  params: { input: CreateInvoiceInput },
) {
  const res = await getReservationForBilling(
    params.input.reservationId,
    client,
  );
  if (!res) throw new Error("RESERVATION_NOT_FOUND");
  if (res.status !== "checked_in" && res.status !== "checked_out") {
    throw new Error("INVALID_RESERVATION_STATE");
  }

  const existing = await getInvoiceByReservationId(res.id, client);
  if (existing) throw new Error("INVOICE_EXISTS");

  const nights = countNights(res.checkInDate, res.checkOutDate);
  const unitPrice = Number(res.basePrice);

  const lineItems: {
    description: string;
    qty: number;
    unitPrice: number;
    amount: number;
  }[] = [
    {
      description: `ຄ່າຫ້ອງ ${res.roomNumber} (${res.roomTypeName ?? "ຫ້ອງ"}) × ${nights} ຄືນ`,
      qty: nights,
      unitPrice,
      amount: lineAmount(nights, unitPrice),
    },
    ...params.input.extraItems.map((item) => ({
      description: item.description,
      qty: item.qty,
      unitPrice: item.unitPrice,
      amount: lineAmount(item.qty, item.unitPrice),
    })),
  ];

  const subtotal = Number(
    lineItems.reduce((sum, item) => sum + item.amount, 0).toFixed(2),
  );
  const taxRate = params.input.taxRate;
  const taxAmount = calcTax(subtotal, taxRate);
  const total = Number((subtotal + taxAmount).toFixed(2));

  const invoiceId = await nextInvoiceNumber(client);
  const created = await createInvoiceDb(
    {
      id: invoiceId,
      reservationId: res.id,
      subtotal: toMoney(subtotal),
      taxRate: toMoney(taxRate),
      taxAmount: toMoney(taxAmount),
      total: toMoney(total),
      status: "unpaid",
    },
    client,
  );
  if (!created) throw new Error("Failed to create invoice");

  await insertInvoiceItems(
    lineItems.map((item) => ({
      id: randomUUIDv7(),
      invoiceId,
      description: item.description,
      qty: toMoney(item.qty),
      unitPrice: toMoney(item.unitPrice),
      amount: toMoney(item.amount),
    })),
    client,
  );

  const detail = await getInvoiceById(invoiceId, client);
  if (!detail) throw new Error("Failed to load invoice");
  return { created: detail };
}
