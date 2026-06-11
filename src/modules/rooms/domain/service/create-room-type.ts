import { randomUUIDv7 } from "bun";
import type { DbTransaction } from "@/shared/types";
import type { RoomTypeCreateInput } from "../contracts";
import { createRoomType as createRoomTypeDb } from "../repo/create-room-type";

export async function createRoomTypeService(
  client: DbTransaction,
  params: { input: RoomTypeCreateInput },
) {
  const { input } = params;
  const created = await createRoomTypeDb(
    {
      id: randomUUIDv7(),
      name: input.name,
      description: input.description ?? null,
      basePrice: input.basePrice.toFixed(2),
      capacity: input.capacity ?? 2,
    },
    client,
  );
  if (!created) throw new Error("Failed to create room type");
  return { created };
}
