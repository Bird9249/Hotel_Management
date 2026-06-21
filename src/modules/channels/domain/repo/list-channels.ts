import { desc } from "drizzle-orm";
import type { DbClient } from "@/server/platform/db/client";
import { salesChannel } from "@/server/platform/db/schema/channels";
import type { DbTransaction } from "@/shared/types";

export async function listChannels(client: DbTransaction | DbClient) {
  return client
    .select({
      id: salesChannel.id,
      code: salesChannel.code,
      name: salesChannel.name,
      isActive: salesChannel.isActive,
      config: salesChannel.config,
      lastSyncAt: salesChannel.lastSyncAt,
      createdAt: salesChannel.createdAt,
    })
    .from(salesChannel)
    .orderBy(desc(salesChannel.createdAt));
}
