import type { DbClient } from "@/server/platform/db/client";
import type { DbTransaction } from "@/shared/types";
import { getBookingByCode } from "../repo/get-booking-by-code";

export async function getPublicBookingService(
  client: DbTransaction | DbClient,
  params: { code: string },
) {
  const booking = await getBookingByCode(params.code, client);
  if (!booking) throw new Error("BOOKING_NOT_FOUND");
  return { booking };
}
