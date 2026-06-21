import { formatDistanceToNow } from "date-fns";
import { CheckCircle2, DoorOpen, Play } from "lucide-react";
import { Badge, Button, Card, CardContent, Skeleton } from "@/components/kit";
import { useActionPermission } from "@/modules/auth/presentation/model/useActionPermission";
import { useCurrentHkShiftQuery, useOpenHkShift } from "../api/queries";

type HkShiftBarProps = {
  onClose: () => void;
};

export function HkShiftBar({ onClose }: HkShiftBarProps) {
  const shift = useCurrentHkShiftQuery();
  const openShift = useOpenHkShift();
  const canManageShift = useActionPermission(["housekeeping:shift"]);

  if (shift.isLoading) {
    return (
      <Card className="mb-4">
        <CardContent className="flex items-center gap-3 p-4">
          <Skeleton className="size-9 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-64" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!shift.data) {
    return (
      <Card className="mb-4 border-amber-500/30 bg-amber-500/5">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="flex items-center gap-3">
            <DoorOpen className="text-amber-600" />
            <div>
              <p className="font-semibold">ຍັງບໍ່ໄດ້ເປີດກະແມ່ບ້ານ</p>
              <p className="text-muted-foreground text-sm">
                ຫ້ອງທີ່ຍັງ cleaning ແມ່ນ backlog ຈາກກະກ່ອນ — ເປີດກະໃໝ່ແລ້ວລະບົບຈະດຶງເຂົ້າ
                task queue ອັດຕະໂນມັດ
              </p>
            </div>
          </div>
          {canManageShift && (
            <Button
              onClick={() => openShift.mutate()}
              disabled={openShift.isPending}
            >
              <Play data-icon="inline-start" />
              ເປີດກະ
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-4 border-emerald-500/30 bg-emerald-500/5">
      <CardContent className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="text-emerald-600" />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold">ກະແມ່ບ້ານກຳລັງເປີດ</p>
              <Badge variant="secondary">ຜູ້ເປີດ: {shift.data.openedByName}</Badge>
            </div>
            <p className="text-muted-foreground text-sm">
              ເປີດແລ້ວ{" "}
              {formatDistanceToNow(new Date(shift.data.openedAt), {
                addSuffix: true,
              })}{" "}
              · ສຳເລັດ {shift.data.totals.completed} · ຄ້າງ{" "}
              {shift.data.totals.pending}
            </p>
          </div>
        </div>
        {canManageShift && (
          <Button variant="outline" onClick={onClose}>
            ປິດກະ / ສົ່ງມອບ
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
