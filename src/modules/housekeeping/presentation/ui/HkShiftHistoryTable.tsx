import { format } from "date-fns";
import {
  Badge,
  createSortableColumn,
  DataTable,
  type TanstackReactTable,
} from "@/components/kit";
import type { HkShiftsListResult } from "@/modules/housekeeping/domain/types";

type HkShiftRow = HkShiftsListResult["data"][number];

type HkShiftHistoryTableProps = {
  isLoading: boolean;
  data: HkShiftRow[];
  offset: number;
  limit: number;
  totalCount: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onPaginationChange: (offset: number, limit: number) => void;
  onSortingChange: (id: string, desc: boolean) => void;
};

function HkShiftStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={status === "open" ? "default" : "secondary"}>
      {status === "open" ? "ເປີດ" : "ປິດແລ້ວ"}
    </Badge>
  );
}

export function HkShiftHistoryTable({
  isLoading,
  data,
  offset,
  limit,
  totalCount,
  sortBy,
  sortOrder,
  onPaginationChange,
  onSortingChange,
}: HkShiftHistoryTableProps) {
  const columns: TanstackReactTable.ColumnDef<HkShiftRow>[] = [
    createSortableColumn<HkShiftRow>("openedAt", "ເປີດກະ", {
      size: 150,
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-sm">
          {format(new Date(row.original.openedAt), "dd/MM/yyyy HH:mm")}
        </span>
      ),
    }),
    {
      id: "openedByName",
      header: "ແມ່ບ້ານ",
      cell: ({ row }) => row.original.openedByName,
      size: 140,
    },
    {
      id: "roomsCompleted",
      header: "ສຳເລັດ",
      cell: ({ row }) => row.original.roomsCompleted ?? "—",
      size: 90,
    },
    {
      id: "roomsPending",
      header: "ຄ້າງ",
      cell: ({ row }) => row.original.roomsPending ?? "—",
      size: 90,
    },
    {
      id: "status",
      header: "ສະຖານະ",
      cell: ({ row }) => <HkShiftStatusBadge status={row.original.status} />,
      size: 100,
    },
    {
      id: "handoverNote",
      header: "ຫມາຍເຫດ",
      cell: ({ row }) => row.original.handoverNote ?? "—",
      size: 220,
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
      noDataMessage="ຍັງບໍ່ມີປະຫວັດກະແມ່ບ້ານ"
    />
  );
}
