import type { DbClient } from "@/server/platform/db/client";
import { roomType } from "@/server/platform/db/schema/rooms";
import type { DbTransaction } from "@/shared/types";
import { eq } from "drizzle-orm";

export async function getRoomTypeById(
  id: string,
  client: DbTransaction | DbClient,
) {
  const [row] = await client
    .select()
    .from(roomType)
    .where(eq(roomType.id, id))
    .limit(1);
  return row ?? null;
}
