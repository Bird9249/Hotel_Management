import { useNavigate, useSearch } from "@tanstack/react-router";
import { History } from "lucide-react";
import { Header } from "@/app/layout/Header";
import { Main } from "@/app/layout/Main";
import type { OffsetPageQueryDTO } from "@/shared/contracts/base";
import { useHkShiftsQuery } from "../api/queries";
import { HkShiftHistoryTable } from "../ui/HkShiftHistoryTable";

export function HkShiftsPage() {
  const nav = useNavigate({ from: "/app/hk-shifts" });
  const search: OffsetPageQueryDTO = useSearch({ from: "/app/hk-shifts" });
  const list = useHkShiftsQuery({
    offset: search.offset,
    limit: search.limit,
    sort: search.sort ?? [{ field: "openedAt", dir: "desc" }],
    filters: search.filters,
  });

  return (
    <>
      <Header />
      <Main>
        <div className="mb-4">
          <h2 className="flex items-center gap-2 font-bold text-2xl tracking-tight">
            <History className="text-primary" />
            ປະຫວັດກະແມ່ບ້ານ
          </h2>
          <p className="text-muted-foreground">
            ກວດສອບກະທີ່ເປີດ–ປິດແລ້ວ ພ້ອມຈຳນວນຫ້ອງສຳເລັດ ແລະ ຫ້ອງຄ້າງ
          </p>
        </div>

        <div className="flex flex-col rounded-xl border bg-card">
          <div className="border-b px-4 py-3">
            <h3 className="font-semibold">ລາຍການກະ</h3>
            <p className="text-muted-foreground text-sm">
              ສະແດງທຸກກະແມ່ບ້ານສຳລັບ supervisor/admin
            </p>
          </div>
          <HkShiftHistoryTable
            isLoading={list.isLoading}
            data={list.data?.data ?? []}
            offset={search.offset ?? 0}
            limit={search.limit ?? 20}
            totalCount={list.data?.meta?.total ?? 0}
            sortBy={search.sort ? search.sort[0]?.field : undefined}
            sortOrder={search.sort ? search.sort[0]?.dir : undefined}
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
