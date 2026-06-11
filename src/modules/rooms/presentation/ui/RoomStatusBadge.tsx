import { Badge, cn } from "@/components/kit";
import type { RoomStatus } from "@/modules/rooms/domain/contracts";
import { getRoomStatusLabel } from "./room-status";

const STATUS_STYLES: Record<RoomStatus, string> = {
  available: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  occupied: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  cleaning: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  maintenance: "bg-muted text-muted-foreground",
};

export function RoomStatusBadge({ status }: { status: string }) {
  const style =
    STATUS_STYLES[status as RoomStatus] ?? STATUS_STYLES.maintenance;
  return (
    <Badge variant="secondary" className={cn("font-medium", style)}>
      {getRoomStatusLabel(status)}
    </Badge>
  );
}
