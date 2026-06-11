import type { DbClient } from "@/server/platform/db/client";
import { invoice } from "@/server/platform/db/schema/billing";
import type { DbTransaction } from "@/shared/types";

export async function createInvoice(
  data: typeof invoice.$inferInsert,
  client: DbTransaction | DbClient,
) {
  const [row] = await client.insert(invoice).values(data).returning();
  return row ?? null;
}
