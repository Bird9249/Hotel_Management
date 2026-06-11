export const INVOICE_STATUS_OPTIONS = [
  { value: "unpaid", label: "ຍັງບໍ່ຈ່າຍ", variant: "destructive" as const },
  {
    value: "partially_paid",
    label: "ຈ່າຍບາງສ່ວນ",
    variant: "secondary" as const,
  },
  { value: "paid", label: "ຈ່າຍຄົບ", variant: "default" as const },
];

export const PAYMENT_METHOD_OPTIONS = [
  { value: "cash", label: "ເງິນສົດ" },
  { value: "bank_transfer", label: "ໂອນເງິນ" },
  { value: "credit_card", label: "ບັດເຄຣດິດ" },
] as const;

export {
  displayInvoiceNumber,
  isFormattedInvoiceNumber,
} from "@/modules/billing/domain/lib/invoice-number";

export function formatMoney(value: string | number) {
  return Number(value).toLocaleString("lo-LA", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function getInvoiceStatusMeta(status: string) {
  return (
    INVOICE_STATUS_OPTIONS.find((o) => o.value === status) ?? {
      value: status,
      label: status,
      variant: "outline" as const,
    }
  );
}

export function getPaymentMethodLabel(method: string) {
  return (
    PAYMENT_METHOD_OPTIONS.find((o) => o.value === method)?.label ?? method
  );
}
