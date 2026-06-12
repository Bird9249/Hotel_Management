import { eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import type { DbClient } from "@/server/platform/db/client";
import { user } from "@/server/platform/db/schema/auth";
import { cashShift } from "@/server/platform/db/schema/billing";
import type { DbTransaction } from "@/shared/types";

const closedByUser = alias(user, "closed_by_user");

export async function getShiftById(
  id: string,
  client: DbTransaction | DbClient,
) {
  const [row] = await client
    .select({
      id: cashShift.id,
      status: cashShift.status,
      openedByUserId: cashShift.openedByUserId,
      openedByName: user.name,
      openedAt: cashShift.openedAt,
      openingCash: cashShift.openingCash,
      closedByUserId: cashShift.closedByUserId,
      closedByName: closedByUser.name,
      closedAt: cashShift.closedAt,
      closingCashCounted: cashShift.closingCashCounted,
      cashReceived: cashShift.cashReceived,
      transferReceived: cashShift.transferReceived,
      cardReceived: cashShift.cardReceived,
      expectedCash: cashShift.expectedCash,
      variance: cashShift.variance,
      handoverNote: cashShift.handoverNote,
    })
    .from(cashShift)
    .innerJoin(user, eq(cashShift.openedByUserId, user.id))
    .leftJoin(closedByUser, eq(cashShift.closedByUserId, closedByUser.id))
    .where(eq(cashShift.id, id))
    .limit(1);

  return row ?? null;
}
