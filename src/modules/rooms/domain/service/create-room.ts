import { randomUUIDv7 } from "bun";
import type { DbTransaction } from "@/shared/types";
import type { RoomCreateInput } from "../contracts";
import { createRoom as createRoomDb } from "../repo/create-room";
import { getRoomTypeById } from "../repo/get-room-type-by-id";

export async function createRoomService(
  client: DbTransaction,
  params: { input: RoomCreateInput },
) {
  const { input } = params;
  const roomType = await getRoomTypeById(input.roomTypeId, client);
  if (!roomType) throw new Error("Room type not found");

  const created = await createRoomDb(
    {
      id: randomUUIDv7(),
      roomNumber: input.roomNumber,
      floor: input.floor ?? null,
      roomTypeId: input.roomTypeId,
      status: input.status ?? "available",
    },
    client,
  );
  if (!created) throw new Error("Failed to create room");
  return { created };
}
