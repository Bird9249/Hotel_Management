import { eq } from "drizzle-orm";
import type { DbClient } from "@/server/platform/db/client";
import { invoice, invoiceItem } from "@/server/platform/db/schema/billing";
import { guest } from "@/server/platform/db/schema/hotel-guests";
import { reservation } from "@/server/platform/db/schema/reservations";
import { room } from "@/server/platform/db/schema/rooms";
import type { DbTransaction } from "@/shared/types";
import { listPaymentsByInvoice } from "./list-payments-by-invoice";
import { sumPayments } from "./sum-payments";

export type InvoiceDetail = {
  id: string;
  reservationId: string;
  guestName: string;
  roomNumber: string;
  checkInDate: string;
  checkOutDate: string;
  subtotal: string;
  taxRate: string;
  taxAmount: string;
  total: string;
  status: string;
  createdAt: Date;
  items: {
    id: string;
    description: string;
    qty: string;
    unitPrice: string;
    amount: string;
  }[];
  payments: {
    id: string;
    method: string;
    amount: string;
    paidAt: Date;
  }[];
  paidTotal: number;
  balance: number;
};

export async function getInvoiceById(
  id: string,
  client: DbTransaction | DbClient,
): Promise<InvoiceDetail | null> {
  const [header] = await client
    .select({
      id: invoice.id,
      reservationId: invoice.reservationId,
      guestName: guest.fullName,
      roomNumber: room.roomNumber,
      checkInDate: reservation.checkInDate,
      checkOutDate: reservation.checkOutDate,
      subtotal: invoice.subtotal,
      taxRate: invoice.taxRate,
      taxAmount: invoice.taxAmount,
      total: invoice.total,
      status: invoice.status,
      createdAt: invoice.createdAt,
    })
    .from(invoice)
    .innerJoin(reservation, eq(invoice.reservationId, reservation.id))
    .innerJoin(guest, eq(reservation.guestId, guest.id))
    .innerJoin(room, eq(reservation.roomId, room.id))
    .where(eq(invoice.id, id))
    .limit(1);

  if (!header) return null;

  const items = await client
    .select()
    .from(invoiceItem)
    .where(eq(invoiceItem.invoiceId, id));

  const payments = await listPaymentsByInvoice(id, client);
  const paidTotal = await sumPayments(id, client);
  const total = Number(header.total);
  const balance = Number((total - paidTotal).toFixed(2));

  return {
    ...header,
    items: items.map((i) => ({
      id: i.id,
      description: i.description,
      qty: i.qty,
      unitPrice: i.unitPrice,
      amount: i.amount,
    })),
    payments: payments.map((p) => ({
      id: p.id,
      method: p.method,
      amount: p.amount,
      paidAt: p.paidAt,
    })),
    paidTotal,
    balance: Math.max(0, balance),
  };
}
