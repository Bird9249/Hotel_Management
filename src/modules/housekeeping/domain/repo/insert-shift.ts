import type { DbClient } from "@/server/platform/db/client";
import { hkShift } from "@/server/platform/db/schema/housekeeping";
import type { DbTransaction } from "@/shared/types";

export async function insertHkShift(
  data: typeof hkShift.$inferInsert,
  client: DbTransaction | DbClient,
) {
  const [row] = await client.insert(hkShift).values(data).returning();
  return row ?? null;
}
