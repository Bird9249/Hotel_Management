import type { DbTransaction } from "@/shared/types";
import { deleteRoom as deleteRoomDb } from "../repo/delete-room";
import { getRoomById } from "../repo/get-room-by-id";

export async function deleteRoomService(
  client: DbTransaction,
  params: { id: string },
) {
  const before = await getRoomById(params.id, client);
  if (!before) throw new Error("Room not found");
  await deleteRoomDb(params.id, client);
  return { deleted: before };
}
