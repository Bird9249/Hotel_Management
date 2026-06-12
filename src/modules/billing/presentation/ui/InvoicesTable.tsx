import { format } from "date-fns";
import { EyeIcon } from "lucide-react";
import {
  createSortableColumn,
  DataTable,
  type TanstackReactTable,
} from "@/components/kit";
import { RowActions } from "@/shared/ui/RowActions";
import type { InvoiceDTO } from "../api/client";
import { InvoiceStatusBadge } from "./InvoiceStatusBadge";
import { displayInvoiceNumber, formatMoney } from "./invoice-status";

type InvoicesTableProps = {
  isLoading: boolean;
  data: InvoiceDTO[];
  offset: number;
  limit: number;
  totalCount: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onView: (invoice: InvoiceDTO) => void;
  onPaginationChange: (offset: number, limit: number) => void;
  onSortingChange: (id: string, desc: boolean) => void;
};

export function InvoicesTable({
  isLoading,
  data,
  offset,
  limit,
  totalCount,
  sortBy,
  sortOrder,
  onView,
  onPaginationChange,
  onSortingChange,
}: InvoicesTableProps) {
  const columns: TanstackReactTable.ColumnDef<InvoiceDTO>[] = [
    {
      id: "id",
      header: "ເລກທີ",
      cell: ({ row }) => (
        <span className="font-mono text-xs">
          {displayInvoiceNumber(row.original.id)}
        </span>
      ),
      size: 100,
    },
    {
      id: "guestName",
      header: "ລູກຄ້າ",
      cell: ({ row }) => row.original.guestName,
      size: 140,
    },
    {
      id: "roomNumber",
      header: "ຫ້ອງ",
      cell: ({ row }) => row.original.roomNumber,
      size: 80,
    },
    createSortableColumn<InvoiceDTO>("total", "ຍອດລວມ", {
      size: 110,
      cell: ({ row }) => `${formatMoney(row.original.total)} ₭`,
    }),
    {
      id: "status",
      header: "ສະຖານະ",
      cell: ({ row }) => <InvoiceStatusBadge status={row.original.status} />,
      size: 120,
    },
    createSortableColumn<InvoiceDTO>("createdAt", "ວັນທີ", {
      size: 100,
      cell: ({ row }) => format(new Date(row.original.createdAt), "dd/MM/yyyy"),
    }),
    {
      id: "actions",
      cell: ({ row }) => (
        <RowActions
          actions={[
            {
              label: "ເບິ່ງ",
              icon: <EyeIcon className="h-4 w-4" />,
              onClick: () => onView(row.original),
            },
          ]}
        />
      ),
      size: 60,
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
      noDataMessage="ບໍ່ພົບໃບບິນ"
    />
  );
}
