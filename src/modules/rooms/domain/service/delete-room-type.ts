import type { DbTransaction } from "@/shared/types";
import { countRoomsByType } from "../repo/count-rooms-by-type";
import { deleteRoomType as deleteRoomTypeDb } from "../repo/delete-room-type";
import { getRoomTypeById } from "../repo/get-room-type-by-id";

export async function deleteRoomTypeService(
  client: DbTransaction,
  params: { id: string },
) {
  const before = await getRoomTypeById(params.id, client);
  if (!before) throw new Error("Room type not found");

  const roomCount = await countRoomsByType(params.id, client);
  if (roomCount > 0) throw new Error("ROOM_TYPE_IN_USE");

  await deleteRoomTypeDb(params.id, client);
  return { deleted: before };
}
