import { and, count, eq, ne } from "drizzle-orm";
import type { DbClient } from "@/server/platform/db/client";
import { hkRoomTask } from "@/server/platform/db/schema/housekeeping";
import type { DbTransaction } from "@/shared/types";

export async function countTasksByShift(
  shiftId: string,
  client: DbTransaction | DbClient,
) {
  const [done] = await client
    .select({ value: count() })
    .from(hkRoomTask)
    .where(and(eq(hkRoomTask.shiftId, shiftId), eq(hkRoomTask.status, "done")));
  const [pending] = await client
    .select({ value: count() })
    .from(hkRoomTask)
    .where(and(eq(hkRoomTask.shiftId, shiftId), ne(hkRoomTask.status, "done")));

  return {
    completed: done?.value ?? 0,
    pending: pending?.value ?? 0,
  };
}
