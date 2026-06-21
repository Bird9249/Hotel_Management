import { eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import type { DbClient } from "@/server/platform/db/client";
import { user } from "@/server/platform/db/schema/auth";
import { hkShift } from "@/server/platform/db/schema/housekeeping";
import type { DbTransaction } from "@/shared/types";

const closedByUser = alias(user, "hk_closed_by_user");

export async function getHkShiftById(
  id: string,
  client: DbTransaction | DbClient,
) {
  const [row] = await client
    .select({
      id: hkShift.id,
      status: hkShift.status,
      openedByUserId: hkShift.openedByUserId,
      openedByName: user.name,
      openedAt: hkShift.openedAt,
      closedByUserId: hkShift.closedByUserId,
      closedByName: closedByUser.name,
      closedAt: hkShift.closedAt,
      roomsCompleted: hkShift.roomsCompleted,
      roomsPending: hkShift.roomsPending,
      handoverNote: hkShift.handoverNote,
    })
    .from(hkShift)
    .innerJoin(user, eq(hkShift.openedByUserId, user.id))
    .leftJoin(closedByUser, eq(hkShift.closedByUserId, closedByUser.id))
    .where(eq(hkShift.id, id))
    .limit(1);
  return row ?? null;
}
