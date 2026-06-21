import { eq } from "drizzle-orm";
import type { DbClient } from "@/server/platform/db/client";
import { channelSyncLog } from "@/server/platform/db/schema/channels";
import type { DbTransaction } from "@/shared/types";

export async function getSyncLogById(
  id: string,
  client: DbTransaction | DbClient,
) {
  const [row] = await client
    .select()
    .from(channelSyncLog)
    .where(eq(channelSyncLog.id, id))
    .limit(1);
  return row ?? null;
}

export async function updateSyncLog(
  id: string,
  data: Partial<typeof channelSyncLog.$inferInsert>,
  client: DbTransaction | DbClient,
) {
  const [row] = await client
    .update(channelSyncLog)
    .set(data)
    .where(eq(channelSyncLog.id, id))
    .returning();
  return row ?? null;
}
