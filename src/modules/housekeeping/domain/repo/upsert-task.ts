import { randomUUIDv7 } from "bun";
import { eq } from "drizzle-orm";
import type { DbClient } from "@/server/platform/db/client";
import { hkRoomTask } from "@/server/platform/db/schema/housekeeping";
import type { DbTransaction } from "@/shared/types";
import { getHkTaskByShiftAndRoom } from "./list-tasks";

export async function upsertHkTask(
  params: {
    shiftId: string;
    roomId: string;
    status: string;
    startedAt?: Date | null;
    completedAt?: Date | null;
    completedByUserId?: string | null;
  },
  client: DbTransaction | DbClient,
) {
  const existing = await getHkTaskByShiftAndRoom(
    { shiftId: params.shiftId, roomId: params.roomId },
    client,
  );

  const data = {
    status: params.status,
    startedAt: params.startedAt,
    completedAt: params.completedAt,
    completedByUserId: params.completedByUserId,
  };

  if (existing) {
    const [row] = await client
      .update(hkRoomTask)
      .set(data)
      .where(eq(hkRoomTask.id, existing.id))
      .returning();
    return row ?? null;
  }

  const [row] = await client
    .insert(hkRoomTask)
    .values({
      id: randomUUIDv7(),
      shiftId: params.shiftId,
      roomId: params.roomId,
      ...data,
    })
    .returning();
  return row ?? null;
}

export async function updateHkTask(
  id: string,
  data: Partial<typeof hkRoomTask.$inferInsert>,
  client: DbTransaction | DbClient,
) {
  const [row] = await client
    .update(hkRoomTask)
    .set(data)
    .where(eq(hkRoomTask.id, id))
    .returning();
  return row ?? null;
}
