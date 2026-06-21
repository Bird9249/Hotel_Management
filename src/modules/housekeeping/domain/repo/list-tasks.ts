import { and, eq } from "drizzle-orm";
import type { DbClient } from "@/server/platform/db/client";
import { hkRoomTask } from "@/server/platform/db/schema/housekeeping";
import { room, roomType } from "@/server/platform/db/schema/rooms";
import type { DbTransaction } from "@/shared/types";

export type HkTaskRow = {
  id: string;
  shiftId: string | null;
  roomId: string;
  roomNumber: string;
  roomTypeName: string | null;
  floor: number | null;
  status: string;
  startedAt: Date | null;
  completedAt: Date | null;
  completedByUserId: string | null;
};

export async function listHkTasks(
  params: { shiftId: string },
  client: DbTransaction | DbClient,
): Promise<HkTaskRow[]> {
  return client
    .select({
      id: hkRoomTask.id,
      shiftId: hkRoomTask.shiftId,
      roomId: hkRoomTask.roomId,
      roomNumber: room.roomNumber,
      roomTypeName: roomType.name,
      floor: room.floor,
      status: hkRoomTask.status,
      startedAt: hkRoomTask.startedAt,
      completedAt: hkRoomTask.completedAt,
      completedByUserId: hkRoomTask.completedByUserId,
    })
    .from(hkRoomTask)
    .innerJoin(room, eq(hkRoomTask.roomId, room.id))
    .leftJoin(roomType, eq(room.roomTypeId, roomType.id))
    .where(eq(hkRoomTask.shiftId, params.shiftId))
    .orderBy(room.roomNumber);
}

export async function getHkTaskById(
  id: string,
  client: DbTransaction | DbClient,
) {
  const [row] = await client
    .select()
    .from(hkRoomTask)
    .where(eq(hkRoomTask.id, id))
    .limit(1);
  return row ?? null;
}

export async function getHkTaskByShiftAndRoom(
  params: { shiftId: string; roomId: string },
  client: DbTransaction | DbClient,
) {
  const [row] = await client
    .select()
    .from(hkRoomTask)
    .where(
      and(
        eq(hkRoomTask.shiftId, params.shiftId),
        eq(hkRoomTask.roomId, params.roomId),
      ),
    )
    .limit(1);
  return row ?? null;
}
