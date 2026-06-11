import type { DbClient } from "@/server/platform/db/client";
import { roomType } from "@/server/platform/db/schema/rooms";
import type {
  OffsetPageDTO,
  OffsetPageQueryDTO,
} from "@/shared/contracts/base";
import { buildOrderBy, buildWhere } from "@/shared/db/query";
import type { DbTransaction } from "@/shared/types";
import { count } from "drizzle-orm";

type RoomTypeRow = typeof roomType.$inferSelect;

export async function listRoomTypes(
  query: OffsetPageQueryDTO,
  client: DbTransaction | DbClient,
): Promise<OffsetPageDTO<RoomTypeRow>> {
  const { limit, offset, sort, filters } = query;
  const columns = {
    id: roomType.id,
    name: roomType.name,
    description: roomType.description,
    basePrice: roomType.basePrice,
    capacity: roomType.capacity,
  } as const;

  const whereExpr = buildWhere(columns, filters ?? []);
  const orderClauses = buildOrderBy(columns, sort);

  const base = client.select().from(roomType);
  const filtered = whereExpr ? base.where(whereExpr) : base;
  const ordered =
    orderClauses && orderClauses.length > 0
      ? filtered.orderBy(...orderClauses)
      : filtered;
  const rows = (await ordered.limit(limit).offset(offset)) as RoomTypeRow[];
  const countBase = client.select({ value: count() }).from(roomType);
  const countQ = whereExpr ? countBase.where(whereExpr) : countBase;
  const [{ value: total }] = (await countQ) as { value: number }[];
  return { data: rows, meta: { total, limit, offset } };
}
