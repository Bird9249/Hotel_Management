import { and, desc, eq, sql } from "drizzle-orm";
import type { DbClient } from "@/server/platform/db/client";
import { channelSyncLog } from "@/server/platform/db/schema/channels";
import type { DbTransaction } from "@/shared/types";

export async function listSyncLogs(
  params: {
    channelId: string;
    limit: number;
    offset: number;
    status?: "success" | "failed" | "partial";
  },
  client: DbTransaction | DbClient,
) {
  const where = and(
    eq(channelSyncLog.channelId, params.channelId),
    params.status ? eq(channelSyncLog.status, params.status) : undefined,
  );

  const rows = await client
    .select()
    .from(channelSyncLog)
    .where(where)
    .orderBy(desc(channelSyncLog.createdAt))
    .limit(params.limit)
    .offset(params.offset);

  const [totalRow] = await client
    .select({ value: sql<number>`count(*)::int` })
    .from(channelSyncLog)
    .where(where);

  return {
    data: rows,
    total: totalRow?.value ?? 0,
  };
}
