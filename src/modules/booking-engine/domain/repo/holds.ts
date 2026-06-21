import { randomUUIDv7 } from "bun";
import { eq, lte, sql } from "drizzle-orm";
import type { DbClient } from "@/server/platform/db/client";
import { inventoryHold } from "@/server/platform/db/schema/channels";
import type { DbTransaction } from "@/shared/types";

export async function createBookingHold(
  data: {
    roomTypeId: string;
    checkInDate: string;
    checkOutDate: string;
    quantity?: number;
    source: string;
    holdMinutes: number;
  },
  client: DbTransaction | DbClient,
) {
  const [row] = await client
    .insert(inventoryHold)
    .values({
      id: randomUUIDv7(),
      roomTypeId: data.roomTypeId,
      checkInDate: data.checkInDate,
      checkOutDate: data.checkOutDate,
      quantity: data.quantity ?? 1,
      source: data.source,
      expiresAt: sql`now() + (${data.holdMinutes} * interval '1 minute')`,
    })
    .returning();
  return row ?? null;
}

export async function getBookingHoldById(
  id: string,
  client: DbTransaction | DbClient,
) {
  const [row] = await client
    .select()
    .from(inventoryHold)
    .where(eq(inventoryHold.id, id))
    .limit(1);
  return row ?? null;
}

export async function getBookingHoldStatus(
  id: string,
  client: DbTransaction | DbClient,
) {
  const [row] = await client
    .select({
      id: inventoryHold.id,
      roomTypeId: inventoryHold.roomTypeId,
      checkInDate: inventoryHold.checkInDate,
      checkOutDate: inventoryHold.checkOutDate,
      quantity: inventoryHold.quantity,
      source: inventoryHold.source,
      expiresAt: inventoryHold.expiresAt,
      createdAt: inventoryHold.createdAt,
      expired: sql<boolean>`${inventoryHold.expiresAt} <= now()`,
      expiresAtMs: sql<number>`floor(extract(epoch from ${inventoryHold.expiresAt}) * 1000)::bigint`,
    })
    .from(inventoryHold)
    .where(eq(inventoryHold.id, id))
    .limit(1);
  return row ?? null;
}

export async function isBookingHoldExpired(
  id: string,
  client: DbTransaction | DbClient,
) {
  const hold = await getBookingHoldStatus(id, client);
  return hold?.expired ?? true;
}

export async function releaseBookingHold(
  id: string,
  client: DbTransaction | DbClient,
) {
  const [row] = await client
    .delete(inventoryHold)
    .where(eq(inventoryHold.id, id))
    .returning();
  return row ?? null;
}

export async function purgeExpiredBookingHolds(
  client: DbTransaction | DbClient,
) {
  const rows = await client
    .delete(inventoryHold)
    .where(lte(inventoryHold.expiresAt, sql`now()`))
    .returning({ id: inventoryHold.id });
  return rows.length;
}
