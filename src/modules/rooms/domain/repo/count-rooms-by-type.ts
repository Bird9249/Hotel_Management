import type { DbClient } from "@/server/platform/db/client";
import { room } from "@/server/platform/db/schema/rooms";
import type { DbTransaction } from "@/shared/types";
import { count, eq } from "drizzle-orm";

export async function countRoomsByType(
  roomTypeId: string,
  client: DbTransaction | DbClient,
): Promise<number> {
  const [{ value }] = await client
    .select({ value: count() })
    .from(room)
    .where(eq(room.roomTypeId, roomTypeId));
  return value;
}
