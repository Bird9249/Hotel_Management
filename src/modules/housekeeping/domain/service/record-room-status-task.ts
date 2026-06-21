import type { DbTransaction } from "@/shared/types";
import { getOpenShiftForUser } from "../repo/get-open-shift-for-user";
import { upsertHkTask } from "../repo/upsert-task";

export async function recordRoomStatusTaskService(
  client: DbTransaction,
  params: {
    roomId: string;
    status: string;
    userId?: string;
  },
) {
  if (!params.userId) return null;

  const shift = await getOpenShiftForUser(params.userId, client);
  if (!shift) return null;

  if (params.status === "available") {
    return upsertHkTask(
      {
        shiftId: shift.id,
        roomId: params.roomId,
        status: "done",
        startedAt: new Date(),
        completedAt: new Date(),
        completedByUserId: params.userId,
      },
      client,
    );
  }

  if (params.status === "cleaning") {
    return upsertHkTask(
      {
        shiftId: shift.id,
        roomId: params.roomId,
        status: "pending",
        startedAt: null,
        completedAt: null,
        completedByUserId: null,
      },
      client,
    );
  }

  return null;
}
