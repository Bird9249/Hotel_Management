import { schema } from "@/server/platform/db/client";
import { nowISO } from "@/shared/lib/date-time";
import type { DbTransaction } from "@/shared/types";
import { eq } from "drizzle-orm";

/** @param expires - ISO 8601 datetime string (รับจาก API เป็น string ตลอดสาย) */
export async function banUser(
  id: string,
  reason: string,
  expires: string | null,
  client: DbTransaction,
): Promise<void> {
  const now = nowISO();
  await client
    .update(schema.user)
    .set({
      banned: true,
      banReason: reason ?? null,
      banExpires: expires,
      updatedAt: now,
    })
    .where(eq(schema.user.id, id));
}
