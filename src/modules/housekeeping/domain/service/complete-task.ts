import { updateRoomStatus } from "@/modules/rooms/domain/repo/update-room-status";
import type { DbTransaction } from "@/shared/types";
import type { HkTaskUpdateInput } from "../contracts";
import { publishHousekeepingEvent } from "../events/housekeeping-events";
import { getHkTaskById } from "../repo/list-tasks";
import { updateHkTask } from "../repo/upsert-task";

export async function updateHkTaskService(
  client: DbTransaction,
  params: { id: string; input: HkTaskUpdateInput; userId: string },
) {
  const before = await getHkTaskById(params.id, client);
  if (!before) throw new Error("TASK_NOT_FOUND");

  const now = new Date();
  const data =
    params.input.status === "done"
      ? {
          status: "done",
          completedAt: now,
          completedByUserId: params.userId,
        }
      : params.input.status === "in_progress"
        ? { status: "in_progress", startedAt: before.startedAt ?? now }
        : { status: "pending", startedAt: null, completedAt: null };

  const updated = await updateHkTask(params.id, data, client);
  if (!updated) throw new Error("Failed to update housekeeping task");

  if (params.input.status === "done") {
    await updateRoomStatus(before.roomId, "available", client);
    publishHousekeepingEvent({
      type: "room_status_changed",
      roomId: before.roomId,
      status: "available",
      taskId: params.id,
      occurredAt: new Date().toISOString(),
    });
  }

  return { updated, before };
}
