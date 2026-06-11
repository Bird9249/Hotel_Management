import { Badge } from "@/components/kit";
import { getInvoiceStatusMeta } from "./invoice-status";

export function InvoiceStatusBadge({ status }: { status: string }) {
  const meta = getInvoiceStatusMeta(status);
  return <Badge variant={meta.variant}>{meta.label}</Badge>;
}
