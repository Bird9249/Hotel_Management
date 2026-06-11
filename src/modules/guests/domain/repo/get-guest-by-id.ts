import { eq } from "drizzle-orm";
import type { DbClient } from "@/server/platform/db/client";
import { guest } from "@/server/platform/db/schema/hotel-guests";
import type { DbTransaction } from "@/shared/types";

export async function getGuestById(
  id: string,
  client: DbTransaction | DbClient,
) {
  const [row] = await client
    .select()
    .from(guest)
    .where(eq(guest.id, id))
    .limit(1);
  return row ?? null;
}
