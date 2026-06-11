import { eq } from "drizzle-orm";
import type { DbClient } from "@/server/platform/db/client";
import { invoice } from "@/server/platform/db/schema/billing";
import type { DbTransaction } from "@/shared/types";

export async function getInvoiceByReservationId(
  reservationId: string,
  client: DbTransaction | DbClient,
) {
  const [row] = await client
    .select()
    .from(invoice)
    .where(eq(invoice.reservationId, reservationId))
    .limit(1);
  return row ?? null;
}
