import { useNavigate, useSearch } from "@tanstack/react-router";
import { usePermissions } from "@/modules/auth/presentation/model/usePermissions";
import type { OffsetPageQueryDTO } from "@/shared/contracts/base";
import { useShiftsQuery } from "../api/queries";
import { CashShiftOverview } from "./CashShiftOverview";
import { CashShiftToolbar } from "./CashShiftToolbar";
import { CloseShiftDialog } from "./CloseShiftDialog";
import { ShiftHistoryTable } from "./ShiftHistoryTable";
import { useCashShiftActions } from "./useCashShiftActions";

export function CashShiftPageContent() {
  const nav = useNavigate({ from: "/app/cash-shifts" });
  const search: OffsetPageQueryDTO = useSearch({ from: "/app/cash-shifts" });
  const { has } = usePermissions();
  const canViewHistory = has("users:read");

  const { shift, closeShift, closeDialog, setCloseDialog, handleClose } =
    useCashShiftActions(true);

  const list = useShiftsQuery(
    {
      offset: search.offset,
      limit: search.limit,
      sort: search.sort ?? [{ field: "openedAt", dir: "desc" }],
      filters: search.filters,
    },
    canViewHistory,
  );

  const current = shift.data;
  if (!current) return null;

  return (
    <>
      <CashShiftToolbar hasOpenShift onClose={() => setCloseDialog(true)} />

      <CashShiftOverview data={current} />

      {canViewHistory && (
        <div className="flex flex-col rounded-xl border bg-card">
          <div className="border-b px-4 py-3">
            <h3 className="font-semibold">ປະຫວັດກະ</h3>
            <p className="text-muted-foreground text-sm">
              ລາຍການກະເງິນສົດທີ່ປິດແລ້ວ ແລະ ກຳລັງເປີດ
            </p>
          </div>
          <ShiftHistoryTable
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
      )}

      <CloseShiftDialog
        open={closeDialog}
        onOpenChange={setCloseDialog}
        shiftData={current}
        submitting={closeShift.isPending}
        onSubmit={async (vals) => {
          try {
            await handleClose(current, vals);
          } catch {
            // fetcher handles error toast
          }
        }}
      />
    </>
  );
}
