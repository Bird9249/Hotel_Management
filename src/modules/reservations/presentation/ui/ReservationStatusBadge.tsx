import { Badge } from "@/components/kit";
import { getReservationStatusMeta } from "./reservation-status";

export function ReservationStatusBadge({ status }: { status: string }) {
  const meta = getReservationStatusMeta(status);
  return <Badge variant={meta.variant}>{meta.label}</Badge>;
}
