import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Separator,
} from "@/components/kit";
import type { HkTaskDTO } from "@/modules/housekeeping/domain/types";
import { BedDouble, CheckCircle2, Clock3, Play } from "lucide-react";

type HkTaskCardProps = {
  task: HkTaskDTO;
  disabled?: boolean;
  onStart: (task: HkTaskDTO) => void;
  onDone: (task: HkTaskDTO) => void;
};

const TASK_LABELS: Record<string, string> = {
  pending: "ລໍຖ້າ",
  in_progress: "ກຳລັງອານາໄມ",
  done: "ເສັດແລ້ວ",
};

export function HkTaskCard({
  task,
  disabled,
  onStart,
  onDone,
}: HkTaskCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <BedDouble />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-2xl">ຫ້ອງ {task.roomNumber}</CardTitle>
              <CardDescription>
                {task.roomTypeName ?? "ບໍ່ລະບຸປະເພດ"}
                {task.floor != null ? ` · ຊັ້ນ ${task.floor}` : ""}
              </CardDescription>
            </div>
          </div>
          <Badge variant={task.status === "done" ? "default" : "secondary"}>
            {TASK_LABELS[task.status] ?? task.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Separator />
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Clock3 />
          <span>
            {task.status === "pending" && "ກົດເລີ່ມເມື່ອເຂົ້າຫ້ອງ"}
            {task.status === "in_progress" && "ກຳລັງອານາໄມ — ກົດພ້ອມໃຊ້ເມື່ອເສັດ"}
            {task.status === "done" && "ຫ້ອງຖືກອັບເດດເປັນພ້ອມໃຊ້ແລ້ວ"}
          </span>
        </div>

        {task.status !== "done" && (
          <div className="grid gap-2">
            {task.status === "pending" && (
              <Button
                className="h-12 w-full text-base"
                disabled={disabled}
                onClick={() => onStart(task)}
                variant="outline"
              >
                <Play data-icon="inline-start" />
                ເລີ່ມອານາໄມ
              </Button>
            )}
            <Button
              className="h-12 w-full text-base"
              disabled={disabled}
              onClick={() => onDone(task)}
            >
              <CheckCircle2 data-icon="inline-start" />
              ພ້ອມໃຊ້
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
