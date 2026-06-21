import { Bell, BrushCleaning, CheckCircle2, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Button,
  Card,
  CardContent,
  confirm,
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  Skeleton,
} from "@/components/kit";
import { useActionPermission } from "@/modules/auth/presentation/model/useActionPermission";
import type { HkTaskDTO } from "@/modules/housekeeping/domain/types";
import {
  useBrowserNotificationPermission,
  useHousekeepingEvents,
} from "../../api/events";
import {
  useCloseHkShift,
  useCurrentHkShiftQuery,
  useHkTasksQuery,
  useOpenHkShift,
  useUpdateHkTask,
} from "../../api/queries";
import { HkShiftBarMobile } from "../ui/HkShiftBarMobile";
import { HkTaskCard } from "../ui/HkTaskCard";
import { type HkMobileTaskFilter, HkTaskTabs } from "../ui/HkTaskTabs";

const MOBILE_REFETCH_INTERVAL_MS = 10_000;
const SKELETON_CARD_IDS = ["first", "second", "third"] as const;

function EmptyMobileState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Empty className="border-0 py-10">
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

export function HkMobilePage() {
  const [filter, setFilter] = useState<HkMobileTaskFilter>("pending");
  const canManageShift = useActionPermission(["housekeeping:shift"]);
  const canManageTasks = useActionPermission(["housekeeping:task"]);
  const notification = useBrowserNotificationPermission({ autoRequest: true });
  useHousekeepingEvents(true, {
    notifyCleaning: true,
    osNotifyCleaning: notification.isGranted,
  });

  const shift = useCurrentHkShiftQuery(true, MOBILE_REFETCH_INTERVAL_MS);
  const tasks = useHkTasksQuery(true, MOBILE_REFETCH_INTERVAL_MS);
  const openShift = useOpenHkShift();
  const closeShift = useCloseHkShift();
  const updateTask = useUpdateHkTask();

  const taskItems: HkTaskDTO[] = tasks.data?.tasks ?? [];
  const counts = useMemo(
    () => ({
      pending: taskItems.filter((task) => task.status === "pending").length,
      in_progress: taskItems.filter((task) => task.status === "in_progress")
        .length,
      done: taskItems.filter((task) => task.status === "done").length,
    }),
    [taskItems],
  );
  const filteredTasks = taskItems.filter((task) => task.status === filter);

  const refresh = () => {
    shift.refetch();
    tasks.refetch();
  };

  const startTask = async (task: HkTaskDTO) => {
    await updateTask.mutateAsync({
      id: task.id,
      input: { status: "in_progress" },
    });
    setFilter("in_progress");
  };

  const completeTask = async (task: HkTaskDTO) => {
    const ok = await confirm({
      title: "ຫ້ອງພ້ອມໃຊ້",
      description: `ຢືນຢັນວ່າຫ້ອງ ${task.roomNumber} ອານາໄມແລ້ວ?`,
      actionText: "ພ້ອມໃຊ້",
    });
    if (!ok) return;
    await updateTask.mutateAsync({ id: task.id, input: { status: "done" } });
    setFilter("done");
  };

  const closeCurrentShift = async () => {
    if (!shift.data) return;
    const ok = await confirm({
      title: "ປິດກະແມ່ບ້ານ",
      description: "ຢືນຢັນປິດກະ ແລະ ບັນທຶກສະຫຼຸບວຽກປັດຈຸບັນ?",
      actionText: "ປິດກະ",
    });
    if (!ok) return;
    await closeShift.mutateAsync({ id: shift.data.id, input: {} });
    setFilter("pending");
  };

  return (
    <main className="flex flex-col gap-4 px-4 py-4 pb-28">
      <section className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <BrushCleaning className="text-primary" />
            <h1 className="font-bold text-2xl">ວຽກແມ່ບ້ານ</h1>
          </div>
          <p className="text-muted-foreground text-sm">ອັບເດດຫ້ອງພັກຈາກມືຖືໄດ້ທັນທີ</p>
        </div>
        <div className="flex gap-2">
          {notification.canRequest && (
            <Button
              className="size-11"
              onClick={notification.requestPermission}
              size="icon"
              variant="outline"
            >
              <Bell />
            </Button>
          )}
          <Button
            className="size-11"
            onClick={refresh}
            size="icon"
            variant="outline"
          >
            <RefreshCw />
          </Button>
        </div>
      </section>

      <HkShiftBarMobile
        canManageShift={canManageShift}
        isClosing={closeShift.isPending}
        isLoading={shift.isLoading}
        isOpening={openShift.isPending}
        onClose={closeCurrentShift}
        onOpen={() => openShift.mutate()}
        shift={shift.data}
      />

      {!shift.data ? (
        <EmptyMobileState
          title="ເປີດກະກ່ອນເລີ່ມວຽກ"
          description="ຫ້ອງ cleaning ຈະຖືກດຶງເຂົ້າ task queue ຫຼັງເປີດກະ"
        />
      ) : (
        <section className="flex flex-col gap-4">
          <HkTaskTabs
            counts={counts}
            onValueChange={setFilter}
            value={filter}
          />

          {tasks.isLoading ? (
            <div className="grid gap-3">
              {SKELETON_CARD_IDS.map((id) => (
                <Card key={`mobile-hk-task-skeleton-${id}`}>
                  <CardContent className="flex flex-col gap-3">
                    <Skeleton className="h-7 w-28" />
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-12 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredTasks.length === 0 ? (
            <EmptyMobileState
              title="ບໍ່ມີວຽກໃນແຖບນີ້"
              description="ລອງເລືອກແຖບອື່ນ ຫຼື ລໍຖ້າຫ້ອງ cleaning ໃໝ່"
            />
          ) : (
            <div className="grid gap-3">
              {filteredTasks.map((task) => (
                <HkTaskCard
                  disabled={!canManageTasks || updateTask.isPending}
                  key={task.id}
                  onDone={completeTask}
                  onStart={startTask}
                  task={task}
                />
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
}
