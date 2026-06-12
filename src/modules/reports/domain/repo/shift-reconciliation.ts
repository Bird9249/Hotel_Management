import { and, eq, gte, lt, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import type { DbClient } from "@/server/platform/db/client";
import { user } from "@/server/platform/db/schema/auth";
import { cashShift } from "@/server/platform/db/schema/billing";
import type { DbTransaction } from "@/shared/types";
import { toExclusiveEnd } from "../lib/date-range";

const closedByUser = alias(user, "closed_by_user");

export type ShiftReconciliationRow = {
  id: string;
  status: string;
  openedByName: string;
  closedByName: string | null;
  openedAt: Date;
  closedAt: Date | null;
  openingCash: string;
  cashReceived: string | null;
  transferReceived: string | null;
  cardReceived: string | null;
  expectedCash: string | null;
  closingCashCounted: string | null;
  variance: string | null;
  handoverNote: string | null;
};

export async function queryShiftReconciliation(
  from: string,
  inclusiveTo: string,
  client: DbTransaction | DbClient,
) {
  const exclusiveTo = toExclusiveEnd(inclusiveTo);

  const rows = await client
    .select({
      id: cashShift.id,
      status: cashShift.status,
      openedByName: user.name,
      closedByName: closedByUser.name,
      openedAt: cashShift.openedAt,
      closedAt: cashShift.closedAt,
      openingCash: cashShift.openingCash,
      cashReceived: cashShift.cashReceived,
      transferReceived: cashShift.transferReceived,
      cardReceived: cashShift.cardReceived,
      expectedCash: cashShift.expectedCash,
      closingCashCounted: cashShift.closingCashCounted,
      variance: cashShift.variance,
      handoverNote: cashShift.handoverNote,
    })
    .from(cashShift)
    .innerJoin(user, eq(cashShift.openedByUserId, user.id))
    .leftJoin(closedByUser, eq(cashShift.closedByUserId, closedByUser.id))
    .where(
      and(
        gte(cashShift.openedAt, sql`${from}::date`),
        lt(cashShift.openedAt, sql`${exclusiveTo}::date`),
      ),
    )
    .orderBy(sql`${cashShift.openedAt} desc`);

  return rows as ShiftReconciliationRow[];
}
