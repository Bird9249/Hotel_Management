import { eq } from "drizzle-orm";
import type { DbClient } from "@/server/platform/db/client";
import { cashShift } from "@/server/platform/db/schema/billing";
import type { DbTransaction } from "@/shared/types";

export type CloseShiftData = {
  closedByUserId: string;
  closedAt: Date;
  closingCashCounted: string;
  cashReceived: string;
  transferReceived: string;
  cardReceived: string;
  expectedCash: string;
  variance: string;
  handoverNote?: string | null;
};

export async function closeShift(
  id: string,
  data: CloseShiftData,
  client: DbTransaction | DbClient,
) {
  const [row] = await client
    .update(cashShift)
    .set({
      status: "closed",
      closedByUserId: data.closedByUserId,
      closedAt: data.closedAt,
      closingCashCounted: data.closingCashCounted,
      cashReceived: data.cashReceived,
      transferReceived: data.transferReceived,
      cardReceived: data.cardReceived,
      expectedCash: data.expectedCash,
      variance: data.variance,
      handoverNote: data.handoverNote ?? null,
    })
    .where(eq(cashShift.id, id))
    .returning();

  return row ?? null;
}
