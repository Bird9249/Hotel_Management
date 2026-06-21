import { eq } from "drizzle-orm";
import type { DbClient } from "@/server/platform/db/client";
import { salesChannel } from "@/server/platform/db/schema/channels";
import type { DbTransaction } from "@/shared/types";

export async function updateChannel(
  id: string,
  data: Partial<typeof salesChannel.$inferInsert>,
  client: DbTransaction | DbClient,
) {
  const [row] = await client
    .update(salesChannel)
    .set(data)
    .where(eq(salesChannel.id, id))
    .returning();
  return row ?? null;
}
