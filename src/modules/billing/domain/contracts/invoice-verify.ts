import { z } from "zod";

export const InvoiceVerifyQuerySchema = z.object({
  t: z.string().min(8, "token required"),
});

export type InvoiceVerifyQuery = z.infer<typeof InvoiceVerifyQuerySchema>;

export type InvoiceVerifyPublicDTO = {
  verified: true;
  invoiceNumber: string;
  status: string;
  issuedAt: string;
  checkInDate: string;
  checkOutDate: string;
  guestName: string;
  roomNumber: string;
  roomTypeName: string | null;
  subtotal: string;
  taxRate: string;
  taxAmount: string;
  total: string;
  paidTotal: number;
  balance: number;
  items: {
    description: string;
    qty: string;
    amount: string;
  }[];
  payments: {
    method: string;
    amount: string;
    paidAt: string;
  }[];
  hotel: {
    name: string;
    nameEn: string | null;
    address: string | null;
    phone: string | null;
    taxId: string | null;
    logoKey: string | null;
  };
};
