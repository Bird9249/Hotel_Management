import { eq } from "drizzle-orm";
import type { DbClient } from "@/server/platform/db/client";
import { hkShift } from "@/server/platform/db/schema/housekeeping";
import type { DbTransaction } from "@/shared/types";

export async function closeHkShift(
  id: string,
  data: Partial<typeof hkShift.$inferInsert>,
  client: DbTransaction | DbClient,
) {
  const [row] = await client
    .update(hkShift)
    .set({ ...data, status: "closed" })
    .where(eq(hkShift.id, id))
    .returning();
  return row ?? null;
}
