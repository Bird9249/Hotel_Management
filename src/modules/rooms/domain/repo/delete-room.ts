import type { DbClient } from "@/server/platform/db/client";
import { room } from "@/server/platform/db/schema/rooms";
import type { DbTransaction } from "@/shared/types";
import { eq } from "drizzle-orm";

export async function deleteRoom(
  id: string,
  client: DbTransaction | DbClient,
): Promise<void> {
  await client.delete(room).where(eq(room.id, id));
}
