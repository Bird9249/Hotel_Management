import type { DbClient } from "@/server/platform/db/client";
import { cashShift } from "@/server/platform/db/schema/billing";
import type { DbTransaction } from "@/shared/types";

export async function insertShift(
  data: typeof cashShift.$inferInsert,
  client: DbTransaction | DbClient,
) {
  const [row] = await client.insert(cashShift).values(data).returning();
  return row ?? null;
}
