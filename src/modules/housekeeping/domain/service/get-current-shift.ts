import type { DbTransaction } from "@/shared/types";
import { countTasksByShift } from "../repo/count-tasks-by-shift";
import { getOpenShiftForUser } from "../repo/get-open-shift-for-user";
import { getHkShiftById } from "../repo/get-shift-by-id";
import { syncCleaningTasksForShift } from "./sync-cleaning-tasks";

export async function getCurrentHkShiftService(
  client: DbTransaction,
  params: { userId: string },
) {
  const shift = await getOpenShiftForUser(params.userId, client);
  if (!shift) return null;

  await syncCleaningTasksForShift(client, { shiftId: shift.id });
  const detail = await getHkShiftById(shift.id, client);
  if (!detail) return null;
  const totals = await countTasksByShift(shift.id, client);
  return { ...detail, totals };
}
