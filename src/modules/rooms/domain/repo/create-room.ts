import type { DbClient } from "@/server/platform/db/client";
import { room } from "@/server/platform/db/schema/rooms";
import type { DbTransaction } from "@/shared/types";

export async function createRoom(
  data: typeof room.$inferInsert,
  client: DbTransaction | DbClient,
) {
  const [row] = await client.insert(room).values(data).returning();
  return row ?? null;
}
