import { and, desc, eq } from "drizzle-orm";
import type { DbClient } from "@/server/platform/db/client";
import { hkShift } from "@/server/platform/db/schema/housekeeping";
import type { DbTransaction } from "@/shared/types";

export async function getOpenShiftForUser(
  userId: string,
  client: DbTransaction | DbClient,
) {
  const [row] = await client
    .select()
    .from(hkShift)
    .where(and(eq(hkShift.status, "open"), eq(hkShift.openedByUserId, userId)))
    .orderBy(desc(hkShift.openedAt))
    .limit(1);
  return row ?? null;
}
