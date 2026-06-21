import type { DbTransaction } from "@/shared/types";
import { getBookingHoldById, releaseBookingHold } from "../repo/holds";
import { releaseExpiredBookingHoldsService } from "./release-expired-holds";

export async function cancelBookingHoldService(
  client: DbTransaction,
  params: { holdId: string },
) {
  await releaseExpiredBookingHoldsService(client, { force: true });

  const hold = await getBookingHoldById(params.holdId, client);
  if (!hold) return { released: false };

  await releaseBookingHold(hold.id, client);
  return { released: true };
}
