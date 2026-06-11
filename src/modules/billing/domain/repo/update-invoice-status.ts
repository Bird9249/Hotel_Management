import { eq } from "drizzle-orm";
import type { DbClient } from "@/server/platform/db/client";
import { invoice } from "@/server/platform/db/schema/billing";
import type { DbTransaction } from "@/shared/types";

export async function updateInvoiceStatus(
  id: string,
  status: string,
  client: DbTransaction | DbClient,
) {
  const [row] = await client
    .update(invoice)
    .set({ status })
    .where(eq(invoice.id, id))
    .returning();
  return row ?? null;
}
