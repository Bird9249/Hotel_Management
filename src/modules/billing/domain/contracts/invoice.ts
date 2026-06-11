import { z } from "zod";

export const PaymentMethodSchema = z.enum([
  "cash",
  "bank_transfer",
  "credit_card",
]);

export const InvoiceItemInputSchema = z.object({
  description: z.string().min(1),
  qty: z.number().positive().default(1),
  unitPrice: z.number().nonnegative(),
});

export const CreateInvoiceSchema = z.object({
  reservationId: z.string().min(1),
  taxRate: z.number().min(0).max(100).default(10),
  extraItems: z.array(InvoiceItemInputSchema).default([]),
});

export const AddPaymentSchema = z.object({
  method: PaymentMethodSchema,
  amount: z.number().positive(),
});

export const InvoiceIdParamSchema = z.object({ id: z.string().min(1) });

export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;
export type InvoiceItemInput = z.infer<typeof InvoiceItemInputSchema>;
export type CreateInvoiceInput = z.infer<typeof CreateInvoiceSchema>;
export type AddPaymentInput = z.infer<typeof AddPaymentSchema>;
