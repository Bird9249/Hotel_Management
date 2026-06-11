import type { DbClient } from "@/server/platform/db/client";
import { reservation } from "@/server/platform/db/schema/reservations";
import type { DbTransaction } from "@/shared/types";

export async function createReservation(
  data: typeof reservation.$inferInsert,
  client: DbTransaction | DbClient,
) {
  const [row] = await client.insert(reservation).values(data).returning();
  return row ?? null;
}
