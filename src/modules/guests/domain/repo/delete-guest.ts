import { eq } from "drizzle-orm";
import type { DbClient } from "@/server/platform/db/client";
import { guest } from "@/server/platform/db/schema/hotel-guests";
import type { DbTransaction } from "@/shared/types";

export async function deleteGuest(
  id: string,
  client: DbTransaction | DbClient,
): Promise<void> {
  await client.delete(guest).where(eq(guest.id, id));
}
