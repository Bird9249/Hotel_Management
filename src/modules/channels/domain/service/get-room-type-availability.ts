import type { DbClient } from "@/server/platform/db/client";
import type { DbTransaction } from "@/shared/types";
import type { RoomTypeAvailabilityQueryDTO } from "../contracts";
import { listRoomTypeAvailability } from "../repo/list-room-type-availability";

export async function getRoomTypeAvailabilityService(
  client: DbTransaction | DbClient,
  params: { query: RoomTypeAvailabilityQueryDTO },
) {
  const { from, to, roomTypeId } = params.query;
  if (to <= from) throw new Error("INVALID_DATE_RANGE");
  return {
    roomTypes: await listRoomTypeAvailability({ from, to, roomTypeId }, client),
  };
}
