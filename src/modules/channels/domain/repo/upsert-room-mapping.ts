import { randomUUIDv7 } from "bun";
import { and, eq } from "drizzle-orm";
import type { DbClient } from "@/server/platform/db/client";
import { channelRoomMapping } from "@/server/platform/db/schema/channels";
import type { DbTransaction } from "@/shared/types";
import type { ChannelRoomMappingUpsertInput } from "../contracts";

export async function upsertRoomMapping(
  channelId: string,
  input: ChannelRoomMappingUpsertInput,
  client: DbTransaction | DbClient,
) {
  const data = {
    externalRoomTypeId: input.externalRoomTypeId,
    allotment: input.allotment ?? null,
  };

  const [existing] = await client
    .select({ id: channelRoomMapping.id })
    .from(channelRoomMapping)
    .where(
      and(
        eq(channelRoomMapping.channelId, channelId),
        eq(channelRoomMapping.roomTypeId, input.roomTypeId),
      ),
    )
    .limit(1);

  if (existing) {
    const [row] = await client
      .update(channelRoomMapping)
      .set(data)
      .where(eq(channelRoomMapping.id, existing.id))
      .returning();
    return row ?? null;
  }

  const [row] = await client
    .insert(channelRoomMapping)
    .values({
      id: randomUUIDv7(),
      channelId,
      roomTypeId: input.roomTypeId,
      ...data,
    })
    .returning();
  return row ?? null;
}
