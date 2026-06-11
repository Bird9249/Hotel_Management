import { useNavigate, useSearch } from "@tanstack/react-router";
import { Header } from "@/app/layout/Header";
import { Main } from "@/app/layout/Main";
import { toast } from "@/components/kit";
import { useActionPermission } from "@/modules/auth/presentation/model/useActionPermission";
import type { OffsetPageQueryDTO } from "@/shared/contracts/base";
import { useDeleteGuest, useGuestsQuery } from "../api/queries";
import { GuestsFilter } from "../ui/GuestsFilter";
import { GuestsTable } from "../ui/GuestsTable";
import { GuestsToolbar } from "../ui/GuestsToolbar";

export function GuestsPage() {
  const nav = useNavigate({ from: "/app/guests" });
  const search: OffsetPageQueryDTO = useSearch({ from: "/app/guests" });

  const list = useGuestsQuery({
    offset: search.offset,
    limit: search.limit,
    sort: search.sort,
    filters: search.filters,
  });
  const deleteGuest = useDeleteGuest();
  const canManage = useActionPermission(["guests:create"]);

  return (
    <>
      <Header />
      <Main>
        <GuestsToolbar
          canManage={!!canManage}
          onCreate={() => nav({ to: "/app/guests/create" })}
        />

        <div className="flex flex-col rounded-xl border bg-card pt-2">
          <GuestsFilter />
          <GuestsTable
            canManage={!!canManage}
            isLoading={list.isLoading}
            data={list.data?.data ?? []}
            offset={search.offset ?? 0}
            limit={search.limit ?? 20}
            totalCount={list.data?.meta?.total ?? 0}
            sortBy={search.sort ? search.sort[0]?.field : undefined}
            sortOrder={search.sort ? search.sort[0]?.dir : undefined}
            onEdit={(guest) =>
              nav({
                to: "/app/guests/$id/edit",
                params: { id: guest.id },
              })
            }
            onDelete={async (id) => {
              toast.promise(deleteGuest.run(id), {
                loading: "ກໍາລັງລຶບ...",
                success: "ລຶບລູກຄ້າສໍາເລັດ",
                error: "ລຶບລູກຄ້າລົ້ມເຫຼວ",
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
      </Main>
    </>
  );
}
