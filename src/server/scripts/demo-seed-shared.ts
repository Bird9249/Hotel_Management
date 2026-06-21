import { inArray, like, or } from "drizzle-orm";
import type { DbClient } from "@/server/platform/db/client";
import { invoice } from "@/server/platform/db/schema/billing";
import {
  channelRoomMapping,
  inventoryHold,
} from "@/server/platform/db/schema/channels";
import { guest } from "@/server/platform/db/schema/hotel-guests";
import { hkRoomTask, hkShift } from "@/server/platform/db/schema/housekeeping";
import { reservation } from "@/server/platform/db/schema/reservations";
import { room, roomType } from "@/server/platform/db/schema/rooms";
import type { DbTransaction } from "@/shared/types";

export const DEMO_PREFIX = "demo-";

const demoReservationFilter = or(
  like(reservation.id, `${DEMO_PREFIX}%`),
  like(reservation.guestId, `${DEMO_PREFIX}%`),
  like(reservation.roomId, `${DEMO_PREFIX}%`),
);

async function demoReservationIds(client: DbTransaction | DbClient) {
  const rows = await client
    .select({ id: reservation.id })
    .from(reservation)
    .where(demoReservationFilter);
  return rows.map((row) => row.id);
}

export async function clearDemoBillingData(client: DbTransaction | DbClient) {
  const ids = await demoReservationIds(client);
  if (ids.length === 0) return;
  await client.delete(invoice).where(inArray(invoice.reservationId, ids));
}

export async function clearDemoSeedData(client: DbTransaction | DbClient) {
  await clearDemoBillingData(client);
  await client.delete(hkRoomTask).where(like(hkRoomTask.id, `${DEMO_PREFIX}%`));
  await client.delete(hkShift).where(like(hkShift.id, `${DEMO_PREFIX}%`));
  await client
    .delete(channelRoomMapping)
    .where(like(channelRoomMapping.roomTypeId, `${DEMO_PREFIX}%`));
  await client
    .delete(inventoryHold)
    .where(like(inventoryHold.roomTypeId, `${DEMO_PREFIX}%`));
  await client.delete(reservation).where(demoReservationFilter);
  await client.delete(guest).where(like(guest.id, `${DEMO_PREFIX}%`));
  await client.delete(room).where(like(room.id, `${DEMO_PREFIX}%`));
  await client.delete(roomType).where(like(roomType.id, `${DEMO_PREFIX}%`));
}
