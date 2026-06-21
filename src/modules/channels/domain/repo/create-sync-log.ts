import { randomUUIDv7 } from "bun";
import type { DbClient } from "@/server/platform/db/client";
import { channelSyncLog } from "@/server/platform/db/schema/channels";
import type { DbTransaction } from "@/shared/types";

export async function createSyncLog(
  data: {
    channelId: string;
    direction: "push" | "pull";
    operation: "availability" | "reservation" | "rate";
    status: "success" | "failed" | "partial";
    requestSummary?: Record<string, unknown> | null;
    errorMessage?: string | null;
  },
  client: DbTransaction | DbClient,
) {
  const [row] = await client
    .insert(channelSyncLog)
    .values({
      id: randomUUIDv7(),
      channelId: data.channelId,
      direction: data.direction,
      operation: data.operation,
      status: data.status,
      requestSummary: data.requestSummary ?? null,
      errorMessage: data.errorMessage ?? null,
    })
    .returning();
  return row ?? null;
}
