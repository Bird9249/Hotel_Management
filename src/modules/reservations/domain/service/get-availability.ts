import type { DbTransaction } from "@/shared/types";
import type { AvailabilityQueryDTO } from "../contracts";
import { listRoomAvailability } from "../repo/list-room-availability";

export async function getAvailabilityService(
  client: DbTransaction,
  params: { query: AvailabilityQueryDTO },
) {
  if (params.query.to <= params.query.from) {
    throw new Error("INVALID_DATE_RANGE");
  }
  const rooms = await listRoomAvailability(
    {
      from: params.query.from,
      to: params.query.to,
      roomTypeId: params.query.roomTypeId,
    },
    client,
  );
  return { from: params.query.from, to: params.query.to, rooms };
}
