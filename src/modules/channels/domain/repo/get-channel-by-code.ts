import { eq } from "drizzle-orm";
import type { DbClient } from "@/server/platform/db/client";
import { salesChannel } from "@/server/platform/db/schema/channels";
import type { DbTransaction } from "@/shared/types";

export async function getChannelByCode(
  code: string,
  client: DbTransaction | DbClient,
) {
  const [row] = await client
    .select()
    .from(salesChannel)
    .where(eq(salesChannel.code, code))
    .limit(1);
  return row ?? null;
}
