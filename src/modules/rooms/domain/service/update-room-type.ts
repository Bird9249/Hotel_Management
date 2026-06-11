import type { DbTransaction } from "@/shared/types";
import type { RoomTypeUpdateInput } from "../contracts";
import { getRoomTypeById } from "../repo/get-room-type-by-id";
import { updateRoomType as updateRoomTypeDb } from "../repo/update-room-type";

export async function updateRoomTypeService(
  client: DbTransaction,
  params: { id: string; input: RoomTypeUpdateInput },
) {
  const { id, input } = params;
  const before = await getRoomTypeById(id, client);
  if (!before) throw new Error("Room type not found");

  const data: Record<string, unknown> = {};
  if (input.name !== undefined) data.name = input.name;
  if (input.description !== undefined) data.description = input.description;
  if (input.basePrice !== undefined)
    data.basePrice = input.basePrice.toFixed(2);
  if (input.capacity !== undefined) data.capacity = input.capacity;

  const updated = await updateRoomTypeDb(id, data, client);
  if (!updated) throw new Error("Failed to update room type");
  return { updated, before };
}
