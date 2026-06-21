import { getRoomTypeAvailabilityService } from "@/modules/channels/domain/service/get-room-type-availability";
import type { DbClient } from "@/server/platform/db/client";
import type { DbTransaction } from "@/shared/types";
import type { PublicAvailabilityQuery } from "../contracts";
import { releaseExpiredBookingHoldsService } from "./release-expired-holds";

export async function searchPublicAvailabilityService(
  client: DbTransaction | DbClient,
  params: { query: PublicAvailabilityQuery },
) {
  await releaseExpiredBookingHoldsService(client);

  const result = await getRoomTypeAvailabilityService(client, {
    query: {
      from: params.query.from,
      to: params.query.to,
    },
  });

  return {
    from: params.query.from,
    to: params.query.to,
    guests: params.query.guests,
    roomTypes: result.roomTypes.filter(
      (item) => item.capacity >= params.query.guests,
    ),
  };
}
