import type { DbTransaction } from "@/shared/types";
import type { RoomUpdateInput } from "../contracts";
import { getRoomById } from "../repo/get-room-by-id";
import { getRoomTypeById } from "../repo/get-room-type-by-id";
import { updateRoom as updateRoomDb } from "../repo/update-room";

export async function updateRoomService(
  client: DbTransaction,
  params: { id: string; input: RoomUpdateInput },
) {
  const { id, input } = params;
  const before = await getRoomById(id, client);
  if (!before) throw new Error("Room not found");

  if (input.roomTypeId) {
    const roomType = await getRoomTypeById(input.roomTypeId, client);
    if (!roomType) throw new Error("Room type not found");
  }

  const data: Record<string, unknown> = {};
  if (input.roomNumber !== undefined) data.roomNumber = input.roomNumber;
  if (input.floor !== undefined) data.floor = input.floor;
  if (input.roomTypeId !== undefined) data.roomTypeId = input.roomTypeId;
  if (input.status !== undefined) data.status = input.status;

  const updated = await updateRoomDb(id, data, client);
  if (!updated) throw new Error("Failed to update room");
  return { updated, before };
}
