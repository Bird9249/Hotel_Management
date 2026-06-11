import { useNavigate, useSearch } from "@tanstack/react-router";
import { Header } from "@/app/layout/Header";
import { Main } from "@/app/layout/Main";
import { toast } from "@/components/kit";
import { useActionPermission } from "@/modules/auth/presentation/model/useActionPermission";
import type { RoomStatus } from "@/modules/rooms/domain/contracts";
import type { OffsetPageQueryDTO } from "@/shared/contracts/base";
import {
  useDeleteRoom,
  useRoomsQuery,
  useSetRoomStatus,
} from "../api/queries";
import { RoomsFilter } from "../ui/RoomsFilter";
import { RoomsTable } from "../ui/RoomsTable";
import { RoomsToolbar } from "../ui/RoomsToolbar";

export function RoomsPage() {
  const nav = useNavigate({ from: "/app/rooms" });
  const search: OffsetPageQueryDTO = useSearch({ from: "/app/rooms" });

  const list = useRoomsQuery({
    offset: search.offset,
    limit: search.limit,
    sort: search.sort,
    filters: search.filters,
  });
  const deleteRoom = useDeleteRoom();
  const setRoomStatus = useSetRoomStatus();
  const canManage = useActionPermission(["rooms:create"]);
  const canChangeStatus = useActionPermission(["rooms:status"]);

  return (
    <>
      <Header />
      <Main>
        <RoomsToolbar
          canManage={!!canManage}
          onCreate={() => nav({ to: "/app/rooms/create" })}
        />

        <div className="flex flex-col rounded-xl border bg-card pt-2">
          <RoomsFilter />
          <RoomsTable
            canManage={!!canManage}
            canChangeStatus={!!canChangeStatus}
            isLoading={list.isLoading}
            data={list.data?.data ?? []}
            offset={search.offset ?? 0}
            limit={search.limit ?? 20}
            totalCount={list.data?.meta?.total ?? 0}
            sortBy={search.sort ? search.sort[0]?.field : undefined}
            sortOrder={search.sort ? search.sort[0]?.dir : undefined}
            onEdit={(room) =>
              nav({
                to: "/app/rooms/$id/edit",
                params: { id: room.id },
              })
            }
            onDelete={async (id) => {
              toast.promise(deleteRoom.run(id), {
                loading: "ກໍາລັງລຶບ...",
                success: "ລຶບຫ້ອງສໍາເລັດ",
                error: "ລຶບຫ້ອງລົ້ມເຫຼວ",
              });
            }}
            onStatusChange={async (id, status) => {
              await setRoomStatus.mutateAsync({ id, input: { status } });
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
      </Main>
    </>
  );
}
