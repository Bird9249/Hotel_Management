import type { ReservationStatus } from "@/modules/reservations/domain/contracts";

export const RESERVATION_STATUS_OPTIONS: {
  value: ReservationStatus;
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
}[] = [
  { value: "booked", label: "ຈອງແລ້ວ", variant: "default" },
  { value: "checked_in", label: "ເຊັກອິນ", variant: "secondary" },
  { value: "checked_out", label: "ເຊັກເອົາ", variant: "outline" },
  { value: "cancelled", label: "ຍົກເລີກ", variant: "destructive" },
];

export function getReservationStatusMeta(status: string) {
  return (
    RESERVATION_STATUS_OPTIONS.find((o) => o.value === status) ?? {
      value: status as ReservationStatus,
      label: status,
      variant: "outline" as const,
    }
  );
}
