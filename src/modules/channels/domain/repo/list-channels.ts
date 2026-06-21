import { desc, notInArray } from "drizzle-orm";
import type { DbClient } from "@/server/platform/db/client";
import { salesChannel } from "@/server/platform/db/schema/channels";
import type { DbTransaction } from "@/shared/types";
import { NON_OTA_SALES_CHANNEL_CODES } from "../constants";

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
    .where(notInArray(salesChannel.code, [...NON_OTA_SALES_CHANNEL_CODES]))
    .orderBy(desc(salesChannel.createdAt));
}
