import { randomUUIDv7 } from "bun";
import type { DbTransaction } from "@/shared/types";
import { getOpenShiftForUser } from "../repo/get-open-shift-for-user";
import { getHkShiftById } from "../repo/get-shift-by-id";
import { insertHkShift } from "../repo/insert-shift";
import { syncCleaningTasksForShift } from "./sync-cleaning-tasks";

export async function openHkShiftService(
  client: DbTransaction,
  params: { userId: string },
) {
  const existing = await getOpenShiftForUser(params.userId, client);
  if (existing) throw new Error("SHIFT_ALREADY_OPEN");

  const created = await insertHkShift(
    {
      id: randomUUIDv7(),
      status: "open",
      openedByUserId: params.userId,
    },
    client,
  );
  if (!created) throw new Error("Failed to open housekeeping shift");

  await syncCleaningTasksForShift(client, { shiftId: created.id });

  const detail = await getHkShiftById(created.id, client);
  if (!detail) throw new Error("SHIFT_NOT_FOUND");
  return detail;
}
