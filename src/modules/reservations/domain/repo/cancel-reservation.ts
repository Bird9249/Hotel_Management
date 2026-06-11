import { eq } from "drizzle-orm";
import type { DbClient } from "@/server/platform/db/client";
import { reservation } from "@/server/platform/db/schema/reservations";
import type { DbTransaction } from "@/shared/types";

export async function cancelReservation(
  id: string,
  client: DbTransaction | DbClient,
) {
  const [row] = await client
    .update(reservation)
    .set({ status: "cancelled" })
    .where(eq(reservation.id, id))
    .returning();
  return row ?? null;
}
