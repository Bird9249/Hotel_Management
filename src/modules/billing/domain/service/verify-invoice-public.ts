import { getHotelBrandingService } from "@/modules/settings/domain/service/get-hotel-branding";
import type { DbClient } from "@/server/platform/db/client";
import type { DbTransaction } from "@/shared/types";
import type { InvoiceVerifyPublicDTO } from "../contracts/invoice-verify";
import { getInvoiceById } from "../repo/get-invoice-by-id";

export async function verifyInvoicePublicService(
  client: DbTransaction | DbClient,
  invoiceId: string,
): Promise<InvoiceVerifyPublicDTO | null> {
  const invoice = await getInvoiceById(invoiceId, client);
  if (!invoice) return null;

  const hotel = await getHotelBrandingService(client);

  return {
    verified: true,
    invoiceNumber: invoice.id,
    status: invoice.status,
    issuedAt: invoice.createdAt.toISOString(),
    checkInDate: invoice.checkInDate,
    checkOutDate: invoice.checkOutDate,
    guestName: invoice.guestName,
    roomNumber: invoice.roomNumber,
    roomTypeName: invoice.roomTypeName,
    subtotal: invoice.subtotal,
    taxRate: invoice.taxRate,
    taxAmount: invoice.taxAmount,
    total: invoice.total,
    paidTotal: invoice.paidTotal,
    balance: invoice.balance,
    items: invoice.items.map((item) => ({
      description: item.description,
      qty: item.qty,
      amount: item.amount,
    })),
    payments: invoice.payments.map((payment) => ({
      method: payment.method,
      amount: payment.amount,
      paidAt: payment.paidAt.toISOString(),
    })),
    hotel: {
      name: hotel.name,
      nameEn: hotel.nameEn,
      address: hotel.address,
      phone: hotel.phone,
      taxId: hotel.taxId,
      logoKey: hotel.logoKey,
    },
  };
}
