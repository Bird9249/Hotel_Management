import { eq } from "drizzle-orm";
import type { DbClient } from "@/server/platform/db/client";
import { reservation } from "@/server/platform/db/schema/reservations";
import type { DbTransaction } from "@/shared/types";

export async function updateReservation(
  id: string,
  data: Partial<typeof reservation.$inferInsert>,
  client: DbTransaction | DbClient,
) {
  const [row] = await client
    .update(reservation)
    .set(data)
    .where(eq(reservation.id, id))
    .returning();
  return row ?? null;
}
