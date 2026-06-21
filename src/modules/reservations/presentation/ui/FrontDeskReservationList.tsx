import { format } from "date-fns";
import { LogIn, LogOut, Users } from "lucide-react";
import { Badge, Button, cn } from "@/components/kit";
import { ReservationSourceBadge } from "@/modules/channels/presentation/ui/ReservationSourceBadge";
import type { ReservationDTO } from "../api/client";
import { ReservationStatusBadge } from "./ReservationStatusBadge";

type FrontDeskReservationListProps = {
  variant: "arrival" | "departure";
  isLoading: boolean;
  data: ReservationDTO[];
  canCheckIn?: boolean;
  canCheckOut?: boolean;
  onCheckIn?: (reservation: ReservationDTO) => Promise<void>;
  onCheckOut?: (reservation: ReservationDTO) => Promise<void>;
};

function formatDate(value: string) {
  try {
    return format(new Date(value), "dd/MM/yyyy");
  } catch {
    return value;
  }
}

export function FrontDeskReservationList({
  variant,
  isLoading,
  data,
  canCheckIn,
  canCheckOut,
  onCheckIn,
  onCheckOut,
}: FrontDeskReservationListProps) {
  if (isLoading) {
    return (
      <div className="px-4 py-10 text-center text-muted-foreground text-sm">
        ກໍາລັງໂຫຼດ...
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 px-6 py-12 text-center">
        <p className="font-medium">
          {variant === "arrival" ? "ບໍ່ມີແຂກມາຮອດວັນນີ້" : "ບໍ່ມີແຂກອອກວັນນີ້"}
        </p>
        <p className="mt-1 text-muted-foreground text-sm">
          ລາຍການຈະສະແດງເມື່ອມີການຈອງທີ່ຕົງກັບວັນນີ້
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {data.map((item) => (
        <div
          key={item.id}
          className={cn(
            "flex flex-wrap items-center justify-between gap-4 px-4 py-4 transition-colors hover:bg-muted/30",
            variant === "arrival" && "border-l-4 border-l-emerald-500/60",
            variant === "departure" && "border-l-4 border-l-amber-500/60",
          )}
        >
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold">{item.guestName}</p>
              <ReservationStatusBadge status={item.status} />
              <ReservationSourceBadge source={item.source} />
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground text-sm">
              <span>
                ຫ້ອງ{" "}
                <strong className="text-foreground">{item.roomNumber}</strong>
              </span>
              <span>
                {formatDate(item.checkInDate)} – {formatDate(item.checkOutDate)}
              </span>
              <span className="inline-flex items-center gap-1">
                <Users className="size-3.5" />
                {item.guestsCount} ຄົນ
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {variant === "arrival" &&
              canCheckIn &&
              item.status === "booked" && (
                <Button
                  size="sm"
                  onClick={() => onCheckIn?.(item)}
                  className="min-w-[120px]"
                >
                  <LogIn className="size-4" />
                  ເຊັກອິນ
                </Button>
              )}
            {variant === "departure" &&
              canCheckOut &&
              item.status === "checked_in" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onCheckOut?.(item)}
                  className="min-w-[120px]"
                >
                  <LogOut className="size-4" />
                  ເຊັກເອົາ
                </Button>
              )}
            {variant === "arrival" && item.status !== "booked" && (
              <Badge variant="secondary">ດຳເນີນການແລ້ວ</Badge>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
