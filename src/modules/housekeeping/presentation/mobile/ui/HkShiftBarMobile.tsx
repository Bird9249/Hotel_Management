import { CheckCircle2, DoorOpen, Play } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
} from "@/components/kit";
import type { CurrentHkShiftResult } from "@/modules/housekeeping/domain/types";

type HkShiftBarMobileProps = {
  shift: CurrentHkShiftResult | null | undefined;
  isLoading?: boolean;
  canManageShift: boolean;
  isOpening?: boolean;
  isClosing?: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export function HkShiftBarMobile({
  shift,
  isLoading,
  canManageShift,
  isOpening,
  isClosing,
  onOpen,
  onClose,
}: HkShiftBarMobileProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-48" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!shift) {
    return (
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardHeader>
          <div className="flex items-start gap-3">
            <DoorOpen className="mt-1 text-amber-600" />
            <div>
              <CardTitle>ຍັງບໍ່ໄດ້ເປີດກະ</CardTitle>
              <CardDescription>ເປີດກະເພື່ອຮັບຫ້ອງ cleaning ເຂົ້າຄິວວຽກ</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {canManageShift && (
            <Button
              className="h-12 w-full text-base"
              disabled={isOpening}
              onClick={onOpen}
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
    <Card className="border-emerald-500/30 bg-emerald-500/5">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-1 text-emerald-600" />
            <div>
              <CardTitle>ກະກຳລັງເປີດ</CardTitle>
              <CardDescription>ຜູ້ເປີດ: {shift.openedByName}</CardDescription>
            </div>
          </div>
          <Badge variant="secondary">Open</Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border bg-background/70 p-3">
            <p className="text-muted-foreground text-xs">ສຳເລັດ</p>
            <p className="font-bold text-2xl tabular-nums">
              {shift.totals.completed}
            </p>
          </div>
          <div className="rounded-lg border bg-background/70 p-3">
            <p className="text-muted-foreground text-xs">ຄ້າງ</p>
            <p className="font-bold text-2xl tabular-nums">
              {shift.totals.pending}
            </p>
          </div>
        </div>
        {canManageShift && (
          <Button
            className="h-12 w-full"
            disabled={isClosing}
            onClick={onClose}
            variant="outline"
          >
            ປິດກະ / ສົ່ງມອບ
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
