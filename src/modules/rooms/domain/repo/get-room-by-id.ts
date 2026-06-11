import type { DbClient } from "@/server/platform/db/client";
import { room, roomType } from "@/server/platform/db/schema/rooms";
import type { DbTransaction } from "@/shared/types";
import { eq } from "drizzle-orm";

export async function getRoomById(
  id: string,
  client: DbTransaction | DbClient,
) {
  const [row] = await client
    .select({
      id: room.id,
      roomNumber: room.roomNumber,
      floor: room.floor,
      status: room.status,
      roomTypeId: room.roomTypeId,
      roomTypeName: roomType.name,
    })
    .from(room)
    .leftJoin(roomType, eq(room.roomTypeId, roomType.id))
    .where(eq(room.id, id))
    .limit(1);
  return row ?? null;
}
