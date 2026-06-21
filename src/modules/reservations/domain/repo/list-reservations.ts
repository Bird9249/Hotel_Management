import { count, eq } from "drizzle-orm";
import type { DbClient } from "@/server/platform/db/client";
import { guest } from "@/server/platform/db/schema/hotel-guests";
import { reservation } from "@/server/platform/db/schema/reservations";
import { room } from "@/server/platform/db/schema/rooms";
import type {
  OffsetPageDTO,
  OffsetPageQueryDTO,
} from "@/shared/contracts/base";
import { buildOrderBy, buildWhere } from "@/shared/db/query";
import type { DbTransaction } from "@/shared/types";

export type ReservationListRow = {
  id: string;
  guestId: string;
  guestName: string;
  roomId: string;
  roomNumber: string;
  checkInDate: string;
  checkOutDate: string;
  guestsCount: number;
  status: string;
  source: string;
  createdAt: Date;
};

export async function listReservations(
  query: OffsetPageQueryDTO,
  client: DbTransaction | DbClient,
): Promise<OffsetPageDTO<ReservationListRow>> {
  const { limit, offset, sort, filters } = query;
  const columns = {
    id: reservation.id,
    guestId: reservation.guestId,
    guestName: guest.fullName,
    roomId: reservation.roomId,
    roomNumber: room.roomNumber,
    checkInDate: reservation.checkInDate,
    checkOutDate: reservation.checkOutDate,
    guestsCount: reservation.guestsCount,
    status: reservation.status,
    source: reservation.source,
    createdAt: reservation.createdAt,
  } as const;

  const whereExpr = buildWhere(
    {
      id: reservation.id,
      guestId: reservation.guestId,
      roomId: reservation.roomId,
      checkInDate: reservation.checkInDate,
      checkOutDate: reservation.checkOutDate,
      guestsCount: reservation.guestsCount,
      status: reservation.status,
      source: reservation.source,
    },
    filters ?? [],
  );
  const orderClauses = buildOrderBy(columns, sort);

  const base = client
    .select({
      id: reservation.id,
      guestId: reservation.guestId,
      guestName: guest.fullName,
      roomId: reservation.roomId,
      roomNumber: room.roomNumber,
      checkInDate: reservation.checkInDate,
      checkOutDate: reservation.checkOutDate,
      guestsCount: reservation.guestsCount,
      status: reservation.status,
      source: reservation.source,
      createdAt: reservation.createdAt,
    })
    .from(reservation)
    .innerJoin(guest, eq(reservation.guestId, guest.id))
    .innerJoin(room, eq(reservation.roomId, room.id));

  const filtered = whereExpr ? base.where(whereExpr) : base;
  const ordered =
    orderClauses && orderClauses.length > 0
      ? filtered.orderBy(...orderClauses)
      : filtered;
  const rows = (await ordered
    .limit(limit)
    .offset(offset)) as ReservationListRow[];

  const countBase = client
    .select({ value: count() })
    .from(reservation)
    .innerJoin(guest, eq(reservation.guestId, guest.id))
    .innerJoin(room, eq(reservation.roomId, room.id));
  const countQ = whereExpr ? countBase.where(whereExpr) : countBase;
  const [{ value: total }] = (await countQ) as { value: number }[];

  return { data: rows, meta: { total, limit, offset } };
}
