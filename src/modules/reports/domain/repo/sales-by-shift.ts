import { and, eq, gte, lt, sql } from "drizzle-orm";
import type { DbClient } from "@/server/platform/db/client";
import { user } from "@/server/platform/db/schema/auth";
import { cashShift, payment } from "@/server/platform/db/schema/billing";
import type { DbTransaction } from "@/shared/types";
import { toExclusiveEnd } from "../lib/date-range";

export type SalesByShiftRow = {
  shiftId: string;
  status: string;
  openedByName: string;
  openedAt: Date;
  closedAt: Date | null;
  method: string | null;
  total: string | null;
};

export async function querySalesByShift(
  from: string,
  inclusiveTo: string,
  client: DbTransaction | DbClient,
) {
  const exclusiveTo = toExclusiveEnd(inclusiveTo);

  const rows = await client
    .select({
      shiftId: cashShift.id,
      status: cashShift.status,
      openedByName: user.name,
      openedAt: cashShift.openedAt,
      closedAt: cashShift.closedAt,
      method: payment.method,
      total: sql<string>`sum(${payment.amount})`.as("total"),
    })
    .from(cashShift)
    .innerJoin(user, eq(cashShift.openedByUserId, user.id))
    .leftJoin(payment, eq(payment.shiftId, cashShift.id))
    .where(
      and(
        gte(cashShift.openedAt, sql`${from}::date`),
        lt(cashShift.openedAt, sql`${exclusiveTo}::date`),
      ),
    )
    .groupBy(
      cashShift.id,
      cashShift.status,
      user.name,
      cashShift.openedAt,
      cashShift.closedAt,
      payment.method,
    )
    .orderBy(sql`${cashShift.openedAt} desc`);

  return rows as SalesByShiftRow[];
}
