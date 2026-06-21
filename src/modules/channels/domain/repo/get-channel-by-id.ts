import { eq } from "drizzle-orm";
import type { DbClient } from "@/server/platform/db/client";
import { salesChannel } from "@/server/platform/db/schema/channels";
import type { DbTransaction } from "@/shared/types";

export async function getChannelById(
  id: string,
  client: DbTransaction | DbClient,
) {
  const [row] = await client
    .select()
    .from(salesChannel)
    .where(eq(salesChannel.id, id))
    .limit(1);
  return row ?? null;
}
