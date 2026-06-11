import { EditIcon, TrashIcon } from "lucide-react";
import {
  confirm,
  createSortableColumn,
  DataTable,
  type TanstackReactTable,
} from "@/components/kit";
import { RowActions } from "@/shared/ui/RowActions";
import type { RoomTypeDTO } from "../api/client";

type RoomTypesTableProps = {
  canManage: boolean;
  isLoading: boolean;
  data: RoomTypeDTO[];
  offset: number;
  limit: number;
  totalCount: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onEdit: (roomType: RoomTypeDTO) => void;
  onDelete: (id: string) => Promise<void>;
  onPaginationChange: (offset: number, limit: number) => void;
  onSortingChange: (id: string, desc: boolean) => void;
};

export function RoomTypesTable({
  canManage,
  isLoading,
  data,
  offset,
  limit,
  totalCount,
  sortBy,
  sortOrder,
  onEdit,
  onDelete,
  onPaginationChange,
  onSortingChange,
}: RoomTypesTableProps) {
  const columns: TanstackReactTable.ColumnDef<RoomTypeDTO>[] = [
    createSortableColumn<RoomTypeDTO>("name", "ຊື່", { size: 120 }),
    {
      id: "basePrice",
      header: "ລາຄາ/ຄືນ",
      cell: ({ row }) =>
        Number(row.original.basePrice).toLocaleString("lo-LA"),
      size: 100,
    },
    createSortableColumn<RoomTypeDTO>("capacity", "ຄວາມຈຸ", { size: 80 }),
    {
      id: "description",
      header: "ຄໍາອະທິບາຍ",
      cell: ({ row }) => (
        <span className="max-w-[240px] truncate text-sm">
          {row.original.description || "-"}
        </span>
      ),
      size: 200,
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
                title: "ລຶບປະເພດຫ້ອງ",
                description: "ທ່ານແນ່ໃຈບໍ່ວ່າຈະລຶບປະເພດຫ້ອງນີ້?",
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
    <DataTable<RoomTypeDTO, unknown>
      noDataMessage="ບໍ່ພົບປະເພດຫ້ອງ"
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
