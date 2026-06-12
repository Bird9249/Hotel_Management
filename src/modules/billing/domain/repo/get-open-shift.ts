import { eq } from "drizzle-orm";
import type { DbClient } from "@/server/platform/db/client";
import { user } from "@/server/platform/db/schema/auth";
import { cashShift } from "@/server/platform/db/schema/billing";
import type { DbTransaction } from "@/shared/types";

export async function getOpenShift(client: DbTransaction | DbClient) {
  const [row] = await client
    .select({
      id: cashShift.id,
      status: cashShift.status,
      openedByUserId: cashShift.openedByUserId,
      openedByName: user.name,
      openedAt: cashShift.openedAt,
      openingCash: cashShift.openingCash,
      closedByUserId: cashShift.closedByUserId,
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
    .where(eq(cashShift.status, "open"))
    .limit(1);

  return row ?? null;
}
