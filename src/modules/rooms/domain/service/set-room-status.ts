import type { DbTransaction } from "@/shared/types";
import type { RoomStatusUpdateInput } from "../contracts";
import { getRoomById } from "../repo/get-room-by-id";
import { updateRoomStatus } from "../repo/update-room-status";

export async function setRoomStatusService(
  client: DbTransaction,
  params: { id: string; input: RoomStatusUpdateInput },
) {
  const before = await getRoomById(params.id, client);
  if (!before) throw new Error("Room not found");

  const updated = await updateRoomStatus(
    params.id,
    params.input.status,
    client,
  );
  if (!updated) throw new Error("Failed to update room status");
  return { updated, before };
}
