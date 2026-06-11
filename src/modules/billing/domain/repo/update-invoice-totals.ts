import { eq } from "drizzle-orm";
import type { DbClient } from "@/server/platform/db/client";
import { invoice } from "@/server/platform/db/schema/billing";
import type { DbTransaction } from "@/shared/types";

export async function updateInvoiceTotals(
  id: string,
  data: {
    subtotal: string;
    taxRate: string;
    taxAmount: string;
    total: string;
    status?: string;
  },
  client: DbTransaction | DbClient,
) {
  const [row] = await client
    .update(invoice)
    .set(data)
    .where(eq(invoice.id, id))
    .returning();
  return row ?? null;
}
