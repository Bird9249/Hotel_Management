import { Badge } from "@/components/kit";

const SOURCE_LABELS: Record<string, string> = {
  front_desk: "Front Desk",
  direct_web: "Direct",
  agoda: "Agoda",
  booking_com: "Booking.com",
  expedia: "Expedia",
  other: "Other",
};

export function ReservationSourceBadge({ source }: { source?: string | null }) {
  const value = source || "front_desk";
  return (
    <Badge variant="outline" className="font-normal">
      {SOURCE_LABELS[value] ?? value}
    </Badge>
  );
}
