import { schema } from "@/server/platform/db/client";
import { nowISO } from "@/shared/lib/date-time";
import type { DbTransaction } from "@/shared/types";
import { eq } from "drizzle-orm";

export async function unbanUser(
  id: string,
  client: DbTransaction,
): Promise<void> {
  const now = nowISO();
  await client
    .update(schema.user)
    .set({ banned: false, banReason: null, banExpires: null, updatedAt: now })
    .where(eq(schema.user.id, id));
}
