import type { DbClient } from "@/server/platform/db/client";
import { roomType } from "@/server/platform/db/schema/rooms";
import type { DbTransaction } from "@/shared/types";
import { eq } from "drizzle-orm";

type RoomTypeRow = typeof roomType.$inferSelect;

export async function updateRoomType(
  id: string,
  data: Partial<typeof roomType.$inferInsert>,
  client: DbTransaction | DbClient,
): Promise<RoomTypeRow | null> {
  const [row] = await client
    .update(roomType)
    .set(data)
    .where(eq(roomType.id, id))
    .returning();
  return row ?? null;
}
