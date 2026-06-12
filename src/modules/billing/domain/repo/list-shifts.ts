import { count, desc, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import type { DbClient } from "@/server/platform/db/client";
import { user } from "@/server/platform/db/schema/auth";
import { cashShift } from "@/server/platform/db/schema/billing";
import type {
  OffsetPageDTO,
  OffsetPageQueryDTO,
} from "@/shared/contracts/base";
import { buildOrderBy, buildWhere } from "@/shared/db/query";
import type { DbTransaction } from "@/shared/types";

const closedByUser = alias(user, "closed_by_user");

export type ShiftListRow = {
  id: string;
  status: string;
  openedByName: string;
  openedAt: Date;
  openingCash: string;
  closedAt: Date | null;
  cashReceived: string | null;
  transferReceived: string | null;
  variance: string | null;
};

export async function listShifts(
  query: OffsetPageQueryDTO,
  client: DbTransaction | DbClient,
): Promise<OffsetPageDTO<ShiftListRow>> {
  const { limit, offset, sort, filters } = query;
  const columns = {
    id: cashShift.id,
    status: cashShift.status,
    openedByName: user.name,
    openedAt: cashShift.openedAt,
    openingCash: cashShift.openingCash,
    closedAt: cashShift.closedAt,
    cashReceived: cashShift.cashReceived,
    transferReceived: cashShift.transferReceived,
    variance: cashShift.variance,
  } as const;

  const whereExpr = buildWhere(
    {
      id: cashShift.id,
      status: cashShift.status,
      openingCash: cashShift.openingCash,
    },
    filters ?? [],
  );
  const orderClauses = buildOrderBy(columns, sort);

  const base = client
    .select({
      id: cashShift.id,
      status: cashShift.status,
      openedByName: user.name,
      openedAt: cashShift.openedAt,
      openingCash: cashShift.openingCash,
      closedAt: cashShift.closedAt,
      cashReceived: cashShift.cashReceived,
      transferReceived: cashShift.transferReceived,
      variance: cashShift.variance,
    })
    .from(cashShift)
    .innerJoin(user, eq(cashShift.openedByUserId, user.id))
    .leftJoin(closedByUser, eq(cashShift.closedByUserId, closedByUser.id));

  const filtered = whereExpr ? base.where(whereExpr) : base;
  const ordered =
    orderClauses && orderClauses.length > 0
      ? filtered.orderBy(...orderClauses)
      : filtered.orderBy(desc(cashShift.openedAt));
  const rows = (await ordered.limit(limit).offset(offset)) as ShiftListRow[];

  const countBase = client
    .select({ value: count() })
    .from(cashShift)
    .innerJoin(user, eq(cashShift.openedByUserId, user.id));
  const countQ = whereExpr ? countBase.where(whereExpr) : countBase;
  const [{ value: total }] = (await countQ) as { value: number }[];

  return { data: rows, meta: { total, limit, offset } };
}
