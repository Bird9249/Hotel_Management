import { desc, sql } from "drizzle-orm";
import type { DbClient } from "@/server/platform/db/client";
import { invoice } from "@/server/platform/db/schema/billing";
import type { DbTransaction } from "@/shared/types";
import { formatInvoiceNumber } from "../lib/invoice-number";

function invoiceDatePrefix(date: Date) {
  const ymd = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("");
  return `INV-${ymd}`;
}

export async function nextInvoiceNumber(
  client: DbTransaction | DbClient,
  date = new Date(),
) {
  const prefix = invoiceDatePrefix(date);

  const [last] = await client
    .select({ id: invoice.id })
    .from(invoice)
    .where(sql`${invoice.id} LIKE ${`${prefix}-%`}`)
    .orderBy(desc(invoice.id))
    .limit(1);

  let sequence = 1;
  if (last) {
    const match = last.id.match(/-(\d{4})$/);
    if (match) sequence = Number(match[1]) + 1;
  }

  return formatInvoiceNumber(date, sequence);
}
