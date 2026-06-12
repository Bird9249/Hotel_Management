import { format } from "date-fns";
import {
  createSortableColumn,
  DataTable,
  type TanstackReactTable,
} from "@/components/kit";
import type { ShiftsListResult } from "@/modules/billing/domain/types";
import { formatMoney } from "./invoice-status";
import { ShiftStatusBadge } from "./ShiftStatusBadge";
import { ShiftVarianceBadge } from "./ShiftVarianceBadge";

type ShiftRow = ShiftsListResult["data"][number];

type ShiftHistoryTableProps = {
  isLoading: boolean;
  data: ShiftRow[];
  offset: number;
  limit: number;
  totalCount: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onPaginationChange: (offset: number, limit: number) => void;
  onSortingChange: (id: string, desc: boolean) => void;
};

export function ShiftHistoryTable({
  isLoading,
  data,
  offset,
  limit,
  totalCount,
  sortBy,
  sortOrder,
  onPaginationChange,
  onSortingChange,
}: ShiftHistoryTableProps) {
  const columns: TanstackReactTable.ColumnDef<ShiftRow>[] = [
    createSortableColumn<ShiftRow>("openedAt", "ເປີດກະ", {
      size: 140,
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-sm">
          {format(new Date(row.original.openedAt), "dd/MM/yyyy HH:mm")}
        </span>
      ),
    }),
    {
      id: "openedByName",
      header: "ພະນັກງານ",
      cell: ({ row }) => row.original.openedByName,
      size: 140,
    },
    createSortableColumn<ShiftRow>("openingCash", "ເງິນຕັ້ງຕົ້ນ", {
      size: 120,
      cell: ({ row }) => (
        <span className="tabular-nums">
          {formatMoney(row.original.openingCash)} ₭
        </span>
      ),
    }),
    {
      id: "cashReceived",
      header: "ເງິນສົດ",
      cell: ({ row }) =>
        row.original.cashReceived != null
          ? `${formatMoney(row.original.cashReceived)} ₭`
          : "—",
      size: 110,
    },
    {
      id: "transferReceived",
      header: "ໂອນ",
      cell: ({ row }) =>
        row.original.transferReceived != null
          ? `${formatMoney(row.original.transferReceived)} ₭`
          : "—",
      size: 110,
    },
    {
      id: "status",
      header: "ສະຖານະ",
      cell: ({ row }) => <ShiftStatusBadge status={row.original.status} />,
      size: 90,
    },
    {
      id: "variance",
      header: "ຜົນຕ່າງ",
      cell: ({ row }) =>
        row.original.variance != null ? (
          <ShiftVarianceBadge variance={Number(row.original.variance)} />
        ) : (
          "—"
        ),
      size: 120,
    },
  ];

  return (
    <DataTable
      isLoading={isLoading}
      columns={columns}
      data={data}
      offset={offset}
      limit={limit}
      totalCount={totalCount}
      sortBy={sortBy}
      sortOrder={sortOrder}
      onPaginationChange={(pagination) =>
        onPaginationChange(pagination.offset, pagination.limit)
      }
      onSortingChange={(sorting) => {
        const first = sorting[0];
        if (!first?.id) return;
        onSortingChange(first.id, first.desc);
      }}
      noDataMessage="ຍັງບໍ່ມີປະຫວັດກະ"
    />
  );
}
