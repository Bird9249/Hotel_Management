import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import {
  BedDouble,
  Bell,
  BrushCleaning,
  CheckCircle2,
  Clock3,
  Play,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { Header } from "@/app/layout/Header";
import { Main } from "@/app/layout/Main";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  cn,
  confirm,
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  Progress,
  Separator,
  Skeleton,
} from "@/components/kit";
import { useActionPermission } from "@/modules/auth/presentation/model/useActionPermission";
import type { HkTaskDTO } from "@/modules/housekeeping/domain/types";
import {
  useBrowserNotificationPermission,
  useHousekeepingEvents,
} from "@/modules/housekeeping/presentation/api/events";
import {
  useCloseHkShift,
  useCurrentHkShiftQuery,
  useHkTasksQuery,
  useUpdateHkTask,
} from "@/modules/housekeeping/presentation/api/queries";
import { CloseHkShiftDialog } from "@/modules/housekeeping/presentation/ui/CloseHkShiftDialog";
import { HkShiftBar } from "@/modules/housekeeping/presentation/ui/HkShiftBar";

type TaskStatus = "pending" | "in_progress" | "done";

const SKELETON_CARD_IDS = ["first", "second", "third"] as const;

const TASK_STATUS_META: Record<
  TaskStatus,
  {
    label: string;
    helper: string;
    badgeVariant: "default" | "secondary" | "outline";
  }
> = {
  pending: {
    label: "ລໍຖ້າ",
    helper: "ພ້ອມເລີ່ມອານາໄມ",
    badgeVariant: "outline",
  },
  in_progress: {
    label: "ກຳລັງອານາໄມ",
    helper: "ກຳລັງດຳເນີນງານ",
    badgeVariant: "secondary",
  },
  done: {
    label: "ສຳເລັດ",
    helper: "ຫ້ອງຖືກປ່ຽນເປັນພ້ອມໃຊ້",
    badgeVariant: "default",
  },
};

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Empty className="border-0">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CheckCircle2 />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

export function HousekeepingPage() {
  const [closeDialog, setCloseDialog] = useState(false);
  const notification = useBrowserNotificationPermission({ autoRequest: true });
  useHousekeepingEvents(true, {
    notifyCleaning: true,
    osNotifyCleaning: notification.isGranted,
  });
  const shift = useCurrentHkShiftQuery();
  const tasks = useHkTasksQuery();
  const updateTask = useUpdateHkTask();
  const closeShift = useCloseHkShift();
  const canManageTasks = useActionPermission(["housekeeping:task"]);

  const taskItems: HkTaskDTO[] = tasks.data?.tasks ?? [];
  const hasOpenShift = !!shift.data;
  const total = hasOpenShift ? taskItems.length : 0;
  const pendingCount = hasOpenShift
    ? taskItems.filter((task) => task.status === "pending").length
    : 0;
  const inProgressCount = hasOpenShift
    ? taskItems.filter((task) => task.status === "in_progress").length
    : 0;
  const doneCount = hasOpenShift
    ? taskItems.filter((task) => task.status === "done").length
    : 0;
  const completionPercent =
    hasOpenShift && total > 0 ? Math.round((doneCount / total) * 100) : 0;

  const markTask = async (
    id: string,
    status: "in_progress" | "done",
    roomNumber: string,
  ) => {
    if (status === "done") {
      const ok = await confirm({
        title: "ຫ້ອງພ້ອມໃຊ້",
        description: `ຢືນຢັນວ່າຫ້ອງ ${roomNumber} ອານາໄມແລ້ວແລ້ວ?`,
        actionText: "ພ້ອມໃຊ້",
      });
      if (!ok) return;
    }
    await updateTask.mutateAsync({ id, input: { status } });
  };

  return (
    <>
      <Header />
      <Main>
        <Card className="mb-4 overflow-hidden">
          <CardHeader className="border-b bg-muted/30">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <BrushCleaning />
                </div>
                <div>
                  <CardTitle className="text-2xl">ຄິວອານາໄມ</CardTitle>
                  <CardDescription>
                    ຈັດການວຽກແມ່ບ້ານປະຈຳກະ — {format(new Date(), "dd/MM/yyyy")}
                  </CardDescription>
                </div>
              </div>
              <Badge variant={hasOpenShift ? "default" : "secondary"}>
                {hasOpenShift ? "ກະກຳລັງເປີດ" : "ຍັງບໍ່ໄດ້ເປີດກະ"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-[1fr_260px]">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">ຄວາມຄືບໜ້າຂອງກະ</p>
                  <p className="text-muted-foreground text-sm">
                    {hasOpenShift
                      ? `ສຳເລັດ ${doneCount} ຈາກ ${total} ວຽກ`
                      : "ເປີດກະກ່ອນເພື່ອເບິ່ງ task queue ແລະເລີ່ມອານາໄມ"}
                  </p>
                </div>
                <p className="font-semibold text-2xl tabular-nums">
                  {completionPercent}%
                </p>
              </div>
              <Progress value={completionPercent} />
            </div>
            <div className="grid grid-cols-3 gap-2 md:grid-cols-1">
              <div className="rounded-lg border bg-card p-3">
                <p className="text-muted-foreground text-xs">ລໍຖ້າ</p>
                <p className="font-bold text-xl tabular-nums">{pendingCount}</p>
              </div>
              <div className="rounded-lg border bg-card p-3">
                <p className="text-muted-foreground text-xs">ກຳລັງອານາໄມ</p>
                <p className="font-bold text-xl tabular-nums">
                  {inProgressCount}
                </p>
              </div>
              <div className="rounded-lg border bg-card p-3">
                <p className="text-muted-foreground text-xs">ສຳເລັດ</p>
                <p className="font-bold text-xl tabular-nums">{doneCount}</p>
              </div>
            </div>
          </CardContent>
          <CardContent className="flex flex-wrap gap-2 border-t pt-4">
            {notification.canRequest && (
              <Button
                className="w-full sm:w-auto"
                onClick={notification.requestPermission}
                variant="outline"
              >
                <Bell className="size-4" />
                ເປີດແຈ້ງເຕືອນ
              </Button>
            )}
            <Button asChild className="w-full sm:w-auto" variant="outline">
              <Link to="/m/housekeeping">ເປີດໃນໂທລະສັບ</Link>
            </Button>
          </CardContent>
        </Card>

        <HkShiftBar onClose={() => setCloseDialog(true)} />

        {hasOpenShift && (
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle>ລາຍການຫ້ອງ</CardTitle>
                  <CardDescription>ວຽກອານາໄມທີ່ຜູກກັບກະປັດຈຸບັນ</CardDescription>
                </div>
                <Badge variant="outline">{total} ລາຍການ</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {hasOpenShift ? (
                tasks.isLoading ? (
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {SKELETON_CARD_IDS.map((id) => (
                      <Card key={`task-skeleton-${id}`}>
                        <CardContent className="flex flex-col gap-3">
                          <Skeleton className="h-5 w-24" />
                          <Skeleton className="h-4 w-36" />
                          <Skeleton className="h-9 w-full" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : taskItems.length === 0 ? (
                  <EmptyState
                    title="ບໍ່ມີວຽກອານາໄມ"
                    description="ທຸກຫ້ອງພ້ອມໃຫ້ບໍລິການແລ້ວ"
                  />
                ) : (
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {taskItems.map((task) => (
                      <Card
                        key={task.id}
                        className={cn(
                          "transition-colors",
                          task.status === "in_progress" && "border-primary/40",
                          task.status === "done" && "bg-muted/30",
                        )}
                      >
                        <CardContent className="flex h-full flex-col gap-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                              <BedDouble />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-lg">
                                ຫ້ອງ {task.roomNumber}
                              </p>
                              <p className="text-muted-foreground text-sm">
                                {task.roomTypeName ?? "ບໍ່ລະບຸປະເພດ"}
                                {task.floor != null
                                  ? ` · ຊັ້ນ ${task.floor}`
                                  : ""}
                              </p>
                            </div>
                            <Badge
                              variant={
                                TASK_STATUS_META[task.status as TaskStatus]
                                  .badgeVariant
                              }
                            >
                              {
                                TASK_STATUS_META[task.status as TaskStatus]
                                  .label
                              }
                            </Badge>
                          </div>

                          <Separator />

                          <div className="flex flex-1 items-center gap-2 text-muted-foreground text-sm">
                            {task.status === "done" ? <Sparkles /> : <Clock3 />}
                            <span>
                              {
                                TASK_STATUS_META[task.status as TaskStatus]
                                  .helper
                              }
                            </span>
                          </div>

                          {canManageTasks && task.status !== "done" && (
                            <div className="flex flex-wrap gap-2">
                              {task.status === "pending" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    markTask(
                                      task.id,
                                      "in_progress",
                                      task.roomNumber,
                                    )
                                  }
                                  disabled={updateTask.isPending}
                                >
                                  <Play data-icon="inline-start" />
                                  ເລີ່ມອານາໄມ
                                </Button>
                              )}
                              <Button
                                size="sm"
                                onClick={() =>
                                  markTask(task.id, "done", task.roomNumber)
                                }
                                disabled={updateTask.isPending}
                              >
                                <CheckCircle2 data-icon="inline-start" />
                                ອານາໄມແລ້ວ
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )
              ) : null}
            </CardContent>
          </Card>
        )}

        {shift.data && (
          <CloseHkShiftDialog
            open={closeDialog}
            onOpenChange={setCloseDialog}
            shiftData={shift.data}
            submitting={closeShift.isPending}
            onSubmit={async (values) => {
              try {
                await closeShift.mutateAsync({
                  id: shift.data.id,
                  input: values,
                });
                setCloseDialog(false);
              } catch {
                // fetcher handles error toast
              }
            }}
          />
        )}
      </Main>
    </>
  );
}
