import { getRoomTypeById } from "@/modules/rooms/domain/repo/get-room-type-by-id";
import type { DbTransaction } from "@/shared/types";
import type { ChannelRoomMappingUpsertInput } from "../contracts";
import { getChannelById } from "../repo/get-channel-by-id";
import { upsertRoomMapping as upsertRoomMappingDb } from "../repo/upsert-room-mapping";

export async function upsertRoomMappingService(
  client: DbTransaction,
  params: { channelId: string; input: ChannelRoomMappingUpsertInput },
) {
  const channel = await getChannelById(params.channelId, client);
  if (!channel) throw new Error("CHANNEL_NOT_FOUND");

  const roomType = await getRoomTypeById(params.input.roomTypeId, client);
  if (!roomType) throw new Error("ROOM_TYPE_NOT_FOUND");

  const mapping = await upsertRoomMappingDb(
    params.channelId,
    params.input,
    client,
  );
  if (!mapping) throw new Error("Failed to upsert room mapping");

  return { mapping };
}
