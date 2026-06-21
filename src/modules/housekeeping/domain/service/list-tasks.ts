import type { DbTransaction } from "@/shared/types";
import { getOpenShiftForUser } from "../repo/get-open-shift-for-user";
import { getHkShiftById } from "../repo/get-shift-by-id";
import { listHkTasks } from "../repo/list-tasks";
import { syncCleaningTasksForShift } from "./sync-cleaning-tasks";

export async function listHkTasksService(
  client: DbTransaction,
  params: { userId: string },
) {
  const shift = await getOpenShiftForUser(params.userId, client);
  if (!shift) return { shift: null, tasks: [] };

  await syncCleaningTasksForShift(client, { shiftId: shift.id });
  const detail = await getHkShiftById(shift.id, client);
  return {
    shift: detail,
    tasks: await listHkTasks({ shiftId: shift.id }, client),
  };
}
