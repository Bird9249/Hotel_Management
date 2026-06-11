import type { DbClient } from "@/server/platform/db/client";
import { room, roomType } from "@/server/platform/db/schema/rooms";
import type {
  OffsetPageDTO,
  OffsetPageQueryDTO,
} from "@/shared/contracts/base";
import { buildOrderBy, buildWhere } from "@/shared/db/query";
import type { DbTransaction } from "@/shared/types";
import { count, eq } from "drizzle-orm";

export type RoomListRow = {
  id: string;
  roomNumber: string;
  floor: number | null;
  status: string;
  roomTypeId: string;
  roomTypeName: string | null;
};

export async function listRooms(
  query: OffsetPageQueryDTO,
  client: DbTransaction | DbClient,
): Promise<OffsetPageDTO<RoomListRow>> {
  const { limit, offset, sort, filters } = query;
  const columns = {
    id: room.id,
    roomNumber: room.roomNumber,
    floor: room.floor,
    status: room.status,
    roomTypeId: room.roomTypeId,
    roomTypeName: roomType.name,
  } as const;

  const whereExpr = buildWhere(
    {
      id: room.id,
      roomNumber: room.roomNumber,
      floor: room.floor,
      status: room.status,
      roomTypeId: room.roomTypeId,
    },
    filters ?? [],
  );
  const orderClauses = buildOrderBy(columns, sort);

  const base = client
    .select({
      id: room.id,
      roomNumber: room.roomNumber,
      floor: room.floor,
      status: room.status,
      roomTypeId: room.roomTypeId,
      roomTypeName: roomType.name,
    })
    .from(room)
    .leftJoin(roomType, eq(room.roomTypeId, roomType.id));

  const filtered = whereExpr ? base.where(whereExpr) : base;
  const ordered =
    orderClauses && orderClauses.length > 0
      ? filtered.orderBy(...orderClauses)
      : filtered;
  const rows = (await ordered.limit(limit).offset(offset)) as RoomListRow[];

  const countBase = client.select({ value: count() }).from(room);
  const countQ = whereExpr ? countBase.where(whereExpr) : countBase;
  const [{ value: total }] = (await countQ) as { value: number }[];

  return { data: rows, meta: { total, limit, offset } };
}
