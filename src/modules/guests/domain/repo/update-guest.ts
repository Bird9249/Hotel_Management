import { eq } from "drizzle-orm";
import type { DbClient } from "@/server/platform/db/client";
import { guest } from "@/server/platform/db/schema/hotel-guests";
import type { DbTransaction } from "@/shared/types";

type GuestRow = typeof guest.$inferSelect;

export async function updateGuest(
  id: string,
  data: Partial<typeof guest.$inferInsert>,
  client: DbTransaction | DbClient,
): Promise<GuestRow | null> {
  const [row] = await client
    .update(guest)
    .set(data)
    .where(eq(guest.id, id))
    .returning();
  return row ?? null;
}
