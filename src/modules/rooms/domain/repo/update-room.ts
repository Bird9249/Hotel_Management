import type { DbClient } from "@/server/platform/db/client";
import { room } from "@/server/platform/db/schema/rooms";
import type { DbTransaction } from "@/shared/types";
import { eq } from "drizzle-orm";

type RoomRow = typeof room.$inferSelect;

export async function updateRoom(
  id: string,
  data: Partial<typeof room.$inferInsert>,
  client: DbTransaction | DbClient,
): Promise<RoomRow | null> {
  const [row] = await client
    .update(room)
    .set(data)
    .where(eq(room.id, id))
    .returning();
  return row ?? null;
}
