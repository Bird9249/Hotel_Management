import { count, desc, eq } from "drizzle-orm";
import type { DbClient } from "@/server/platform/db/client";
import { user } from "@/server/platform/db/schema/auth";
import { hkShift } from "@/server/platform/db/schema/housekeeping";
import type {
  OffsetPageDTO,
  OffsetPageQueryDTO,
} from "@/shared/contracts/base";
import { buildOrderBy, buildWhere } from "@/shared/db/query";
import type { DbTransaction } from "@/shared/types";

export type HkShiftListRow = {
  id: string;
  status: string;
  openedByName: string;
  openedAt: Date;
  closedAt: Date | null;
  roomsCompleted: number | null;
  roomsPending: number | null;
  handoverNote: string | null;
};

export async function listHkShifts(
  query: OffsetPageQueryDTO,
  client: DbTransaction | DbClient,
): Promise<OffsetPageDTO<HkShiftListRow>> {
  const { limit, offset, sort, filters } = query;
  const columns = {
    id: hkShift.id,
    status: hkShift.status,
    openedByName: user.name,
    openedAt: hkShift.openedAt,
    closedAt: hkShift.closedAt,
    roomsCompleted: hkShift.roomsCompleted,
    roomsPending: hkShift.roomsPending,
  } as const;

  const whereExpr = buildWhere(
    {
      id: hkShift.id,
      status: hkShift.status,
    },
    filters ?? [],
  );
  const orderClauses = buildOrderBy(columns, sort);

  const base = client
    .select({
      id: hkShift.id,
      status: hkShift.status,
      openedByName: user.name,
      openedAt: hkShift.openedAt,
      closedAt: hkShift.closedAt,
      roomsCompleted: hkShift.roomsCompleted,
      roomsPending: hkShift.roomsPending,
      handoverNote: hkShift.handoverNote,
    })
    .from(hkShift)
    .innerJoin(user, eq(hkShift.openedByUserId, user.id));

  const filtered = whereExpr ? base.where(whereExpr) : base;
  const ordered =
    orderClauses && orderClauses.length > 0
      ? filtered.orderBy(...orderClauses)
      : filtered.orderBy(desc(hkShift.openedAt));
  const rows = (await ordered.limit(limit).offset(offset)) as HkShiftListRow[];

  const countBase = client
    .select({ value: count() })
    .from(hkShift)
    .innerJoin(user, eq(hkShift.openedByUserId, user.id));
  const countQ = whereExpr ? countBase.where(whereExpr) : countBase;
  const [totalRow] = (await countQ) as { value: number }[];
  const total = totalRow?.value ?? 0;

  return { data: rows, meta: { total, limit, offset } };
}
