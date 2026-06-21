import { Badge } from "@/components/kit";
import { RESERVATION_SOURCE_LABELS } from "@/modules/reservations/presentation/ui/reservation-sources";

export function ReservationSourceBadge({ source }: { source?: string | null }) {
  const value = source || "front_desk";
  return (
    <Badge variant="outline" className="font-normal">
      {RESERVATION_SOURCE_LABELS[value] ?? value}
    </Badge>
  );
}
