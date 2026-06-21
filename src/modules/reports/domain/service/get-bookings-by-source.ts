import type { DbClient } from "@/server/platform/db/client";
import type { DbTransaction } from "@/shared/types";
import { pivotBySource } from "../lib/pivot-by-source";
import { queryBookingsBySource } from "../repo/bookings-by-source";

export async function getBookingsBySource(
  from: string,
  to: string,
  client: DbTransaction | DbClient,
) {
  const rows = await queryBookingsBySource(from, to, client);
  return pivotBySource(rows);
}
