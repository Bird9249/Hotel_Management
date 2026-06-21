import type { DbTransaction } from "@/shared/types";
import type { CloseHkShiftInput } from "../contracts";
import { closeHkShift } from "../repo/close-shift";
import { countTasksByShift } from "../repo/count-tasks-by-shift";
import { getHkShiftById } from "../repo/get-shift-by-id";
import { syncCleaningTasksForShift } from "./sync-cleaning-tasks";

export async function closeHkShiftService(
  client: DbTransaction,
  params: {
    shiftId: string;
    input: CloseHkShiftInput;
    userId: string;
    canCloseAnyShift: boolean;
  },
) {
  const shift = await getHkShiftById(params.shiftId, client);
  if (!shift) throw new Error("SHIFT_NOT_FOUND");
  if (shift.status !== "open") throw new Error("SHIFT_NOT_OPEN");
  if (!params.canCloseAnyShift && shift.openedByUserId !== params.userId) {
    throw new Error("SHIFT_NOT_OWNER");
  }

  await syncCleaningTasksForShift(client, { shiftId: shift.id });
  const totals = await countTasksByShift(shift.id, client);
  const updated = await closeHkShift(
    shift.id,
    {
      closedByUserId: params.userId,
      closedAt: new Date(),
      roomsCompleted: totals.completed,
      roomsPending: totals.pending,
      handoverNote: params.input.handoverNote,
    },
    client,
  );
  if (!updated) throw new Error("Failed to close housekeeping shift");

  const detail = await getHkShiftById(updated.id, client);
  if (!detail) throw new Error("SHIFT_NOT_FOUND");
  return detail;
}
