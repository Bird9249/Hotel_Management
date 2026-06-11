import { cn } from "@/components/kit";
import type { RoomStatus } from "@/modules/rooms/domain/contracts";
import {
  ROOM_STATUS_CARD_STYLES,
  ROOM_STATUS_DESCRIPTIONS,
  ROOM_STATUS_ICONS,
  ROOM_STATUS_LABELS,
  ROOM_STATUS_OPTIONS,
} from "./room-status";

type RoomStatusPickerProps = {
  value: RoomStatus;
  onChange: (status: RoomStatus) => void;
};

export function RoomStatusPicker({ value, onChange }: RoomStatusPickerProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {ROOM_STATUS_OPTIONS.map((opt) => {
        const Icon = ROOM_STATUS_ICONS[opt.value];
        const styles = ROOM_STATUS_CARD_STYLES[opt.value];
        const selected = value === opt.value;

        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex items-start gap-3 rounded-lg border p-3 text-left transition-all",
              "hover:border-primary/40 hover:bg-muted/50",
              selected
                ? cn("border-primary/50 ring-2", styles.ring)
                : "border-border",
            )}
          >
            <div
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-md",
                styles.bg,
              )}
            >
              <Icon className={cn("size-4", styles.icon)} />
            </div>
            <div className="min-w-0 space-y-0.5">
              <p className="font-medium text-sm leading-none">
                {ROOM_STATUS_LABELS[opt.value]}
              </p>
              <p className="text-muted-foreground text-xs leading-snug">
                {ROOM_STATUS_DESCRIPTIONS[opt.value]}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
