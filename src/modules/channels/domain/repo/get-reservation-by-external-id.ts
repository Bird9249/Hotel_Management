import { and, eq } from "drizzle-orm";
import type { DbClient } from "@/server/platform/db/client";
import { reservation } from "@/server/platform/db/schema/reservations";
import type { DbTransaction } from "@/shared/types";

export async function getReservationByExternalId(
  params: { channelId: string; externalBookingId: string },
  client: DbTransaction | DbClient,
) {
  const [row] = await client
    .select()
    .from(reservation)
    .where(
      and(
        eq(reservation.channelId, params.channelId),
        eq(reservation.externalBookingId, params.externalBookingId),
      ),
    )
    .limit(1);
  return row ?? null;
}
