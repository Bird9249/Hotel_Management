import { eq } from "drizzle-orm";
import type { DbClient } from "@/server/platform/db/client";
import { inventoryHold } from "@/server/platform/db/schema/channels";
import type { DbTransaction } from "@/shared/types";

export async function releaseHold(
  id: string,
  client: DbTransaction | DbClient,
) {
  const [row] = await client
    .delete(inventoryHold)
    .where(eq(inventoryHold.id, id))
    .returning();
  return row ?? null;
}
