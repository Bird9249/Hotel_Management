import { count, eq } from "drizzle-orm";
import type { DbClient } from "@/server/platform/db/client";
import { invoice } from "@/server/platform/db/schema/billing";
import { guest } from "@/server/platform/db/schema/hotel-guests";
import { reservation } from "@/server/platform/db/schema/reservations";
import { room } from "@/server/platform/db/schema/rooms";
import type {
  OffsetPageDTO,
  OffsetPageQueryDTO,
} from "@/shared/contracts/base";
import { buildOrderBy, buildWhere } from "@/shared/db/query";
import type { DbTransaction } from "@/shared/types";

export type InvoiceListRow = {
  id: string;
  reservationId: string;
  guestName: string;
  roomNumber: string;
  total: string;
  status: string;
  createdAt: Date;
};

export async function listInvoices(
  query: OffsetPageQueryDTO,
  client: DbTransaction | DbClient,
): Promise<OffsetPageDTO<InvoiceListRow>> {
  const { limit, offset, sort, filters } = query;
  const columns = {
    id: invoice.id,
    reservationId: invoice.reservationId,
    guestName: guest.fullName,
    roomNumber: room.roomNumber,
    total: invoice.total,
    status: invoice.status,
    createdAt: invoice.createdAt,
  } as const;

  const whereExpr = buildWhere(
    {
      id: invoice.id,
      reservationId: invoice.reservationId,
      total: invoice.total,
      status: invoice.status,
    },
    filters ?? [],
  );
  const orderClauses = buildOrderBy(columns, sort);

  const base = client
    .select({
      id: invoice.id,
      reservationId: invoice.reservationId,
      guestName: guest.fullName,
      roomNumber: room.roomNumber,
      total: invoice.total,
      status: invoice.status,
      createdAt: invoice.createdAt,
    })
    .from(invoice)
    .innerJoin(reservation, eq(invoice.reservationId, reservation.id))
    .innerJoin(guest, eq(reservation.guestId, guest.id))
    .innerJoin(room, eq(reservation.roomId, room.id));

  const filtered = whereExpr ? base.where(whereExpr) : base;
  const ordered =
    orderClauses && orderClauses.length > 0
      ? filtered.orderBy(...orderClauses)
      : filtered;
  const rows = (await ordered.limit(limit).offset(offset)) as InvoiceListRow[];

  const countBase = client
    .select({ value: count() })
    .from(invoice)
    .innerJoin(reservation, eq(invoice.reservationId, reservation.id))
    .innerJoin(guest, eq(reservation.guestId, guest.id))
    .innerJoin(room, eq(reservation.roomId, room.id));
  const countQ = whereExpr ? countBase.where(whereExpr) : countBase;
  const [{ value: total }] = (await countQ) as { value: number }[];

  return { data: rows, meta: { total, limit, offset } };
}
