import { eq } from "drizzle-orm";
import { room } from "@/server/platform/db/schema/rooms";
import type { DbTransaction } from "@/shared/types";
import { getHkTaskByShiftAndRoom } from "../repo/list-tasks";
import { upsertHkTask } from "../repo/upsert-task";

export async function syncCleaningTasksForShift(
  client: DbTransaction,
  params: { shiftId: string },
) {
  const cleaningRooms = await client
    .select({ id: room.id })
    .from(room)
    .where(eq(room.status, "cleaning"));

  for (const item of cleaningRooms) {
    const existing = await getHkTaskByShiftAndRoom(
      { shiftId: params.shiftId, roomId: item.id },
      client,
    );
    if (existing) continue;

    await upsertHkTask(
      {
        shiftId: params.shiftId,
        roomId: item.id,
        status: "pending",
        startedAt: null,
        completedAt: null,
        completedByUserId: null,
      },
      client,
    );
  }

  return { synced: cleaningRooms.length };
}
