import type { LucideIcon } from "lucide-react";
import { Brush, CheckCircle2, UserRound, Wrench } from "lucide-react";
import type { RoomStatus } from "@/modules/rooms/domain/contracts";

export const ROOM_STATUS_LABELS: Record<RoomStatus, string> = {
  available: "ວ່າງ",
  occupied: "ມີແຂກພັກ",
  cleaning: "ກຳລັງທຳຄວາມສະອາດ",
  maintenance: "ປິດປັບປຸງ",
};

export const ROOM_STATUS_DESCRIPTIONS: Record<RoomStatus, string> = {
  available: "ພ້ອມຮັບແຂກເຂົ້າພັກ",
  occupied: "ມີແຂກພັກຢູ່ໃນຫ້ອງ",
  cleaning: "ກຳລັງດຳເນີນການທຳຄວາມສະອາດ",
  maintenance: "ປິດໃຊ້ງານຊົ່ວຄາວ",
};

export const ROOM_STATUS_ICONS: Record<RoomStatus, LucideIcon> = {
  available: CheckCircle2,
  occupied: UserRound,
  cleaning: Brush,
  maintenance: Wrench,
};

export const ROOM_STATUS_CARD_STYLES: Record<
  RoomStatus,
  { ring: string; bg: string; icon: string }
> = {
  available: {
    ring: "ring-emerald-500/60",
    bg: "bg-emerald-500/10",
    icon: "text-emerald-600 dark:text-emerald-400",
  },
  occupied: {
    ring: "ring-blue-500/60",
    bg: "bg-blue-500/10",
    icon: "text-blue-600 dark:text-blue-400",
  },
  cleaning: {
    ring: "ring-amber-500/60",
    bg: "bg-amber-500/10",
    icon: "text-amber-600 dark:text-amber-400",
  },
  maintenance: {
    ring: "ring-muted-foreground/40",
    bg: "bg-muted",
    icon: "text-muted-foreground",
  },
};

export const ROOM_STATUS_OPTIONS: Array<{ value: RoomStatus; label: string }> =
  (
    Object.entries(ROOM_STATUS_LABELS) as Array<[RoomStatus, string]>
  ).map(([value, label]) => ({ value, label }));

export function getRoomStatusLabel(status: string): string {
  return ROOM_STATUS_LABELS[status as RoomStatus] ?? status;
}
