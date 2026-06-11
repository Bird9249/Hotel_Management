import type { DbClient } from "@/server/platform/db/client";
import { payment } from "@/server/platform/db/schema/billing";
import type { DbTransaction } from "@/shared/types";

export async function addPayment(
  data: typeof payment.$inferInsert,
  client: DbTransaction | DbClient,
) {
  const [row] = await client.insert(payment).values(data).returning();
  return row ?? null;
}
