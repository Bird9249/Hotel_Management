import { useNavigate, useSearch } from "@tanstack/react-router";
import { Header } from "@/app/layout/Header";
import { Main } from "@/app/layout/Main";
import { toast } from "@/components/kit";
import { useActionPermission } from "@/modules/auth/presentation/model/useActionPermission";
import type { OffsetPageQueryDTO } from "@/shared/contracts/base";
import { useCancelReservation, useReservationsQuery } from "../api/queries";
import { ReservationsFilter } from "../ui/ReservationsFilter";
import { ReservationsTable } from "../ui/ReservationsTable";
import { ReservationsToolbar } from "../ui/ReservationsToolbar";

export function ReservationsPage() {
  const nav = useNavigate({ from: "/app/reservations" });
  const search: OffsetPageQueryDTO = useSearch({ from: "/app/reservations" });

  const list = useReservationsQuery({
    offset: search.offset,
    limit: search.limit,
    sort: search.sort,
    filters: search.filters,
  });
  const cancelReservation = useCancelReservation();
  const canManage = useActionPermission(["reservations:create"]);
  const canCancel = useActionPermission(["reservations:cancel"]);

  return (
    <>
      <Header />
      <Main>
        <ReservationsToolbar
          canManage={!!canManage}
          onCreate={() => nav({ to: "/app/reservations/create" })}
        />

        <div className="flex flex-col rounded-xl border bg-card pt-2">
          <ReservationsFilter />
          <ReservationsTable
            canManage={!!canManage}
            canCancel={!!canCancel}
            isLoading={list.isLoading}
            data={list.data?.data ?? []}
            offset={search.offset ?? 0}
            limit={search.limit ?? 20}
            totalCount={list.data?.meta?.total ?? 0}
            sortBy={search.sort ? search.sort[0]?.field : undefined}
            sortOrder={search.sort ? search.sort[0]?.dir : undefined}
            onEdit={(reservation) =>
              nav({
                to: "/app/reservations/$id/edit",
                params: { id: reservation.id },
              })
            }
            onCancel={async (id) => {
              toast.promise(cancelReservation.run(id), {
                loading: "ກໍາລັງຍົກເລີກ...",
                success: "ຍົກເລີກການຈອງສໍາເລັດ",
                error: "ຍົກເລີກການຈອງລົ້ມເຫຼວ",
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
