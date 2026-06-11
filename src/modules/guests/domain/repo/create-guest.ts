import type { DbClient } from "@/server/platform/db/client";
import { guest } from "@/server/platform/db/schema/hotel-guests";
import type { DbTransaction } from "@/shared/types";

export async function createGuest(
  data: typeof guest.$inferInsert,
  client: DbTransaction | DbClient,
) {
  const [row] = await client.insert(guest).values(data).returning();
  return row ?? null;
}
