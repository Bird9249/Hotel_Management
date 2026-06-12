import { useNavigate, useSearch } from "@tanstack/react-router";
import { ReceiptText } from "lucide-react";
import { Header } from "@/app/layout/Header";
import { Main } from "@/app/layout/Main";
import type { OffsetPageQueryDTO } from "@/shared/contracts/base";
import { useInvoicesQuery } from "../api/queries";
import { InvoicesFilter } from "../ui/InvoicesFilter";
import { InvoicesTable } from "../ui/InvoicesTable";
import { ShiftStatusBar } from "../ui/ShiftStatusBar";

export function InvoicesPage() {
  const nav = useNavigate({ from: "/app/invoices" });
  const search: OffsetPageQueryDTO = useSearch({ from: "/app/invoices" });

  const list = useInvoicesQuery({
    offset: search.offset,
    limit: search.limit,
    sort: search.sort,
    filters: search.filters,
  });

  return (
    <>
      <Header />
      <Main>
        <div className="mb-2">
          <h2 className="flex items-center gap-2 font-bold text-2xl tracking-tight">
            <ReceiptText className="size-7 text-primary" />
            ໃບບິນ
          </h2>
          <p className="text-muted-foreground">ຈັດການໃບບິນ ແລະ ການຊຳລະເງິນ.</p>
        </div>

        <ShiftStatusBar />

        <div className="flex flex-col rounded-xl border bg-card">
          <InvoicesFilter />
          <InvoicesTable
            isLoading={list.isLoading}
            data={list.data?.data ?? []}
            offset={search.offset ?? 0}
            limit={search.limit ?? 20}
            totalCount={list.data?.meta?.total ?? 0}
            sortBy={search.sort ? search.sort[0]?.field : undefined}
            sortOrder={search.sort ? search.sort[0]?.dir : undefined}
            onView={(invoice) =>
              nav({
                to: "/app/invoices/$id",
                params: { id: invoice.id },
              })
            }
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
