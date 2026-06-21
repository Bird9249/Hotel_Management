import { and, eq } from "drizzle-orm";
import type { DbClient } from "@/server/platform/db/client";
import {
  channelRoomMapping,
  salesChannel,
} from "@/server/platform/db/schema/channels";
import { roomType } from "@/server/platform/db/schema/rooms";
import type { DbTransaction } from "@/shared/types";

export async function getMappingByExternalRoomType(
  params: { channelId: string; externalRoomTypeId: string },
  client: DbTransaction | DbClient,
) {
  const [row] = await client
    .select({
      id: channelRoomMapping.id,
      channelId: channelRoomMapping.channelId,
      channelCode: salesChannel.code,
      roomTypeId: channelRoomMapping.roomTypeId,
      roomTypeName: roomType.name,
      externalRoomTypeId: channelRoomMapping.externalRoomTypeId,
      allotment: channelRoomMapping.allotment,
    })
    .from(channelRoomMapping)
    .innerJoin(salesChannel, eq(channelRoomMapping.channelId, salesChannel.id))
    .innerJoin(roomType, eq(channelRoomMapping.roomTypeId, roomType.id))
    .where(
      and(
        eq(channelRoomMapping.channelId, params.channelId),
        eq(channelRoomMapping.externalRoomTypeId, params.externalRoomTypeId),
      ),
    )
    .limit(1);
  return row ?? null;
}
