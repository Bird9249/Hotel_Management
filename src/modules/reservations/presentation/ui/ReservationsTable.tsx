import { format } from "date-fns";
import { BanIcon, EditIcon } from "lucide-react";
import {
  confirm,
  createSortableColumn,
  DataTable,
  type TanstackReactTable,
} from "@/components/kit";
import { ReservationSourceBadge } from "@/modules/channels/presentation/ui/ReservationSourceBadge";
import { RowActions } from "@/shared/ui/RowActions";
import type { ReservationDTO } from "../api/client";
import { ReservationStatusBadge } from "./ReservationStatusBadge";

type ReservationsTableProps = {
  canManage: boolean;
  canCancel: boolean;
  isLoading: boolean;
  data: ReservationDTO[];
  offset: number;
  limit: number;
  totalCount: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onEdit: (reservation: ReservationDTO) => void;
  onCancel: (id: string) => Promise<void>;
  onPaginationChange: (offset: number, limit: number) => void;
  onSortingChange: (id: string, desc: boolean) => void;
};

function formatDate(value: string) {
  try {
    return format(new Date(value), "dd/MM/yyyy");
  } catch {
    return value;
  }
}

export function ReservationsTable({
  canManage,
  canCancel,
  isLoading,
  data,
  offset,
  limit,
  totalCount,
  sortBy,
  sortOrder,
  onEdit,
  onCancel,
  onPaginationChange,
  onSortingChange,
}: ReservationsTableProps) {
  const columns: TanstackReactTable.ColumnDef<ReservationDTO>[] = [
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
    createSortableColumn<ReservationDTO>("checkInDate", "ເຂົ້າ", {
      size: 100,
      cell: ({ row }) => formatDate(row.original.checkInDate),
    }),
    createSortableColumn<ReservationDTO>("checkOutDate", "ອອກ", {
      size: 100,
      cell: ({ row }) => formatDate(row.original.checkOutDate),
    }),
    createSortableColumn<ReservationDTO>("guestsCount", "ຈຳນວນ", { size: 70 }),
    {
      id: "status",
      header: "ສະຖານະ",
      cell: ({ row }) => (
        <ReservationStatusBadge status={row.original.status} />
      ),
      size: 110,
    },
    {
      id: "source",
      header: "ຊ່ອງທາງ",
      cell: ({ row }) => (
        <ReservationSourceBadge source={row.original.source} />
      ),
      size: 110,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const id = row.original.id;
        const status = row.original.status;
        const actions = [];

        if (canManage && status !== "cancelled" && status !== "checked_out") {
          actions.push({
            label: "ແກ້ໄຂ",
            icon: <EditIcon className="h-4 w-4" />,
            onClick: () => onEdit(row.original),
          });
        }

        if (canCancel && status !== "cancelled" && status !== "checked_out") {
          actions.push({
            label: "ຍົກເລີກ",
            variant: "destructive" as const,
            icon: <BanIcon className="h-4 w-4" />,
            onClick: async () => {
              const ok = await confirm({
                title: "ຍົກເລີກການຈອງ",
                description: "ທ່ານແນ່ໃຈບໍ່ວ່າຈະຍົກເລີກການຈອງນີ້?",
                actionText: "ຍົກເລີກ",
                cancelText: "ປິດ",
              });
              if (ok) await onCancel(id);
            },
          });
        }

        if (!actions.length) return null;
        return <RowActions actions={actions} />;
      },
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
      onPaginationChange={onPaginationChange}
      onSortingChange={onSortingChange}
    />
  );
}
