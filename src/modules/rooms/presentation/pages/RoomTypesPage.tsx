import { useNavigate, useSearch } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { Header } from "@/app/layout/Header";
import { Main } from "@/app/layout/Main";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  toast,
} from "@/components/kit";
import { useActionPermission } from "@/modules/auth/presentation/model/useActionPermission";
import type { OffsetPageQueryDTO } from "@/shared/contracts/base";
import { DialogScrollBody } from "@/shared/ui/DialogScrollBody";
import type { RoomTypeDTO } from "../api/client";
import {
  useCreateRoomType,
  useDeleteRoomType,
  useRoomTypesQuery,
  useUpdateRoomType,
} from "../api/queries";
import { RoomTypeForm } from "../ui/RoomTypeForm";
import { RoomTypesFilter } from "../ui/RoomTypesFilter";
import { RoomTypesTable } from "../ui/RoomTypesTable";

export function RoomTypesPage() {
  const nav = useNavigate({ from: "/app/room-types" });
  const search: OffsetPageQueryDTO = useSearch({ from: "/app/room-types" });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<RoomTypeDTO | null>(null);

  const list = useRoomTypesQuery({
    offset: search.offset,
    limit: search.limit,
    sort: search.sort,
    filters: search.filters,
  });
  const createRoomType = useCreateRoomType();
  const updateRoomType = useUpdateRoomType(editing?.id ?? "");
  const deleteRoomType = useDeleteRoomType();
  const canManage = useActionPermission(["rooms:create"]);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (roomType: RoomTypeDTO) => {
    setEditing(roomType);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditing(null);
  };

  return (
    <>
      <Header />
      <Main>
        <div className="mb-2 flex flex-wrap items-center justify-between space-y-2">
          <div>
            <h2 className="font-bold text-2xl tracking-tight">ປະເພດຫ້ອງ</h2>
            <p className="text-muted-foreground">
              ກຳນົດປະເພດຫ້ອງ, ລາຄາ, ແລະຄວາມຈຸ.
            </p>
          </div>
          {canManage && (
            <Button onClick={openCreate}>
              <PlusIcon className="h-4 w-4" />
              ເພີ່ມປະເພດຫ້ອງ
            </Button>
          )}
        </div>

        <div className="flex flex-col rounded-xl border bg-card">
          <RoomTypesFilter />
          <RoomTypesTable
            canManage={!!canManage}
            isLoading={list.isLoading}
            data={list.data?.data ?? []}
            offset={search.offset ?? 0}
            limit={search.limit ?? 20}
            totalCount={list.data?.meta?.total ?? 0}
            sortBy={search.sort ? search.sort[0]?.field : undefined}
            sortOrder={search.sort ? search.sort[0]?.dir : undefined}
            onEdit={openEdit}
            onDelete={async (id) => {
              toast.promise(deleteRoomType.run(id), {
                loading: "ກໍາລັງລຶບ...",
                success: "ລຶບປະເພດຫ້ອງສໍາເລັດ",
                error: "ລຶບປະເພດຫ້ອງລົ້ມເຫຼວ",
              });
            }}
            onPaginationChange={(offset, limit) =>
              nav({ search: { ...search, offset, limit } })
            }
            onSortingChange={(id, desc) =>
              nav({
                search: {
                  ...search,
                  sort: [{ field: id, dir: desc ? "desc" : "asc" }],
                },
              })
            }
          />
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="grid max-h-[min(90vh,720px)] grid-rows-[auto_minmax(0,1fr)] gap-0 overflow-hidden p-0 sm:max-w-lg">
            <DialogHeader className="border-b px-6 py-4">
              <DialogTitle>
                {editing ? "ແກ້ໄຂປະເພດຫ້ອງ" : "ເພີ່ມປະເພດຫ້ອງ"}
              </DialogTitle>
            </DialogHeader>
            <DialogScrollBody>
              <RoomTypeForm
                key={editing?.id ?? "create"}
                initialValues={
                  editing
                    ? {
                        name: editing.name,
                        description: editing.description ?? "",
                        basePrice: Number(editing.basePrice),
                        capacity: editing.capacity,
                      }
                    : undefined
                }
                submitting={
                  editing ? updateRoomType.isPending : createRoomType.isPending
                }
                onSubmit={async (vals) => {
                  if (editing) {
                    await updateRoomType.mutateAsync(vals);
                  } else {
                    await createRoomType.mutateAsync(vals);
                  }
                  closeDialog();
                }}
              />
            </DialogScrollBody>
          </DialogContent>
        </Dialog>
      </Main>
    </>
  );
}
