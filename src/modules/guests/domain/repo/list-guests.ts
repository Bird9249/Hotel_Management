import { count } from "drizzle-orm";
import type { DbClient } from "@/server/platform/db/client";
import { guest } from "@/server/platform/db/schema/hotel-guests";
import type {
  OffsetPageDTO,
  OffsetPageQueryDTO,
} from "@/shared/contracts/base";
import { buildOrderBy, buildWhere } from "@/shared/db/query";
import type { DbTransaction } from "@/shared/types";

type GuestRow = typeof guest.$inferSelect;

export async function listGuests(
  query: OffsetPageQueryDTO,
  client: DbTransaction | DbClient,
): Promise<OffsetPageDTO<GuestRow>> {
  const { limit, offset, sort, filters } = query;
  const columns = {
    id: guest.id,
    fullName: guest.fullName,
    phone: guest.phone,
    idDocument: guest.idDocument,
    nationality: guest.nationality,
  } as const;

  const whereExpr = buildWhere(columns, filters ?? []);
  const orderClauses = buildOrderBy(columns, sort);

  const base = client.select().from(guest);
  const filtered = whereExpr ? base.where(whereExpr) : base;
  const ordered =
    orderClauses && orderClauses.length > 0
      ? filtered.orderBy(...orderClauses)
      : filtered;
  const rows = (await ordered.limit(limit).offset(offset)) as GuestRow[];
  const countBase = client.select({ value: count() }).from(guest);
  const countQ = whereExpr ? countBase.where(whereExpr) : countBase;
  const [{ value: total }] = (await countQ) as { value: number }[];
  return { data: rows, meta: { total, limit, offset } };
}
