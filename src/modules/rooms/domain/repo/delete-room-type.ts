import type { DbClient } from "@/server/platform/db/client";
import { roomType } from "@/server/platform/db/schema/rooms";
import type { DbTransaction } from "@/shared/types";
import { eq } from "drizzle-orm";

export async function deleteRoomType(
  id: string,
  client: DbTransaction | DbClient,
): Promise<void> {
  await client.delete(roomType).where(eq(roomType.id, id));
}
