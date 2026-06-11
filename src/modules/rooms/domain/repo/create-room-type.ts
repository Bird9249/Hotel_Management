import type { DbClient } from "@/server/platform/db/client";
import { roomType } from "@/server/platform/db/schema/rooms";
import type { DbTransaction } from "@/shared/types";

export async function createRoomType(
  data: typeof roomType.$inferInsert,
  client: DbTransaction | DbClient,
) {
  const [row] = await client.insert(roomType).values(data).returning();
  return row ?? null;
}
