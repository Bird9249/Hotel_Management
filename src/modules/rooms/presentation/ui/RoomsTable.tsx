import { EditIcon, TrashIcon } from "lucide-react";
import {
  confirm,
  createSortableColumn,
  DataTable,
  type TanstackReactTable,
} from "@/components/kit";
import type { RoomStatus } from "@/modules/rooms/domain/contracts";
import { RowActions } from "@/shared/ui/RowActions";
import { SimpleSelect } from "@/shared/ui/SimpleSelect";
import type { RoomDTO } from "../api/client";
import { RoomStatusBadge } from "./RoomStatusBadge";
import { ROOM_STATUS_OPTIONS } from "./room-status";

type RoomsTableProps = {
  canManage: boolean;
  canChangeStatus: boolean;
  isLoading: boolean;
  data: RoomDTO[];
  offset: number;
  limit: number;
  totalCount: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onEdit: (room: RoomDTO) => void;
  onDelete: (id: string) => Promise<void>;
  onStatusChange: (id: string, status: RoomStatus) => Promise<void>;
  onPaginationChange: (offset: number, limit: number) => void;
  onSortingChange: (id: string, desc: boolean) => void;
};

export function RoomsTable({
  canManage,
  canChangeStatus,
  isLoading,
  data,
  offset,
  limit,
  totalCount,
  sortBy,
  sortOrder,
  onEdit,
  onDelete,
  onStatusChange,
  onPaginationChange,
  onSortingChange,
}: RoomsTableProps) {
  const columns: TanstackReactTable.ColumnDef<RoomDTO>[] = [
    createSortableColumn<RoomDTO>("roomNumber", "ເລກຫ້ອງ", { size: 100 }),
    {
      id: "roomTypeName",
      header: "ປະເພດຫ້ອງ",
      cell: ({ row }) => row.original.roomTypeName ?? "-",
      size: 120,
    },
    createSortableColumn<RoomDTO>("floor", "ຊັ້ນ", { size: 80 }),
    {
      id: "status",
      header: "ສະຖານະ",
      cell: ({ row }) => {
        const id = row.original.id;
        if (canChangeStatus) {
          return (
            <SimpleSelect
              value={row.original.status}
              onValueChange={async (val) => {
                await onStatusChange(id, val as RoomStatus);
              }}
              options={ROOM_STATUS_OPTIONS.map((opt) => ({
                value: opt.value,
                label: opt.label,
              }))}
              className="h-8 w-full min-w-[140px]"
            />
          );
        }
        return <RoomStatusBadge status={row.original.status} />;
      },
      size: 160,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const id = row.original.id;
        if (!canManage) return null;
        const actions = [
          {
            label: "ແກ້ໄຂ",
            icon: <EditIcon className="h-4 w-4" />,
            onClick: () => onEdit(row.original),
          },
          {
            label: "ລຶບ",
            variant: "destructive" as const,
            icon: <TrashIcon className="h-4 w-4" />,
            onClick: async () => {
              const ok = await confirm({
                title: "ລຶບຫ້ອງ",
                description: "ທ່ານແນ່ໃຈບໍ່ວ່າຈະລຶບຫ້ອງນີ້?",
                actionText: "ລຶບ",
                ActionProps: { variant: "destructive" },
              });
              if (ok) await onDelete(id);
            },
          },
        ];
        return <RowActions actions={actions} maxInline={2} />;
      },
      size: 100,
    },
  ];

  return (
    <DataTable<RoomDTO, unknown>
      noDataMessage="ບໍ່ພົບຫ້ອງ"
      isLoading={isLoading}
      columns={columns}
      data={data}
      offset={offset}
      limit={limit}
      totalCount={totalCount}
      onPaginationChange={(pagination) =>
        onPaginationChange(pagination.offset, pagination.limit)
      }
      sortBy={sortBy}
      sortOrder={sortOrder}
      onSortingChange={(sorting) => {
        if (sorting[0]?.id === "") return;
        onSortingChange(sorting[0]?.id as string, !!sorting[0]?.desc);
      }}
    />
  );
}
