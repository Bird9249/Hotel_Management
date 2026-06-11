import type { DbClient } from "@/server/platform/db/client";
import { invoiceItem } from "@/server/platform/db/schema/billing";
import type { DbTransaction } from "@/shared/types";

export async function insertInvoiceItems(
  items: (typeof invoiceItem.$inferInsert)[],
  client: DbTransaction | DbClient,
) {
  if (items.length === 0) return [];
  return client.insert(invoiceItem).values(items).returning();
}
