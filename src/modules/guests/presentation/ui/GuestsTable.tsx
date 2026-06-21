import { EditIcon, TrashIcon } from "lucide-react";
import {
  confirm,
  createSortableColumn,
  DataTable,
  type TanstackReactTable,
} from "@/components/kit";
import { RowActions } from "@/shared/ui/RowActions";
import type { GuestDTO } from "../api/client";

type GuestsTableProps = {
  canManage: boolean;
  isLoading: boolean;
  data: GuestDTO[];
  offset: number;
  limit: number;
  totalCount: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onEdit: (guest: GuestDTO) => void;
  onDelete: (id: string) => Promise<void>;
  onPaginationChange: (offset: number, limit: number) => void;
  onSortingChange: (id: string, desc: boolean) => void;
};

export function GuestsTable({
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
}: GuestsTableProps) {
  const columns: TanstackReactTable.ColumnDef<GuestDTO>[] = [
    createSortableColumn<GuestDTO>("fullName", "ຊື່", { size: 180 }),
    createSortableColumn<GuestDTO>("phone", "ເບີໂທ", { size: 120 }),
    createSortableColumn<GuestDTO>("idDocument", "ເອກະສານ", { size: 140 }),
    createSortableColumn<GuestDTO>("nationality", "ສັນຊາດ", { size: 100 }),
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
                title: "ລຶບລູກຄ້າ",
                description: "ທ່ານແນ່ໃຈບໍ່ວ່າຈະລຶບລູກຄ້ານີ້?",
                actionText: "ລຶບ",
                cancelText: "ຍົກເລີກ",
              });
              if (ok) await onDelete(id);
            },
          },
        ];
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
      onSortingChange={(sorting) => {
        if (!sorting[0]) return;
        onSortingChange(sorting[0].id, sorting[0].desc);
      }}
    />
  );
}
