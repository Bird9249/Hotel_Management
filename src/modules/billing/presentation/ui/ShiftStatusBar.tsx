import { format } from "date-fns";
import { Banknote, LogOut, Play } from "lucide-react";
import { Button } from "@/components/kit";
import { useActionPermission } from "@/modules/auth/presentation/model/useActionPermission";
import { CloseShiftDialog } from "./CloseShiftDialog";
import { formatMoney } from "./invoice-status";
import { OpenShiftDialog } from "./OpenShiftDialog";
import { useCashShiftActions } from "./useCashShiftActions";

/** แถบกะแบบกะทัดรัด — ใช้ฝังใน Front Desk / ໃບບິນ */
export function ShiftStatusBar() {
  const canShift = useActionPermission(["billing:shift"]);
  const {
    shift,
    openShift,
    closeShift,
    openDialog,
    setOpenDialog,
    closeDialog,
    setCloseDialog,
    handleOpen,
    handleClose,
  } = useCashShiftActions(!!canShift);

  if (!canShift) return null;

  const data = shift.data;

  if (shift.isLoading) {
    return (
      <div className="mb-4 rounded-lg border bg-muted/40 px-4 py-3 text-muted-foreground text-sm">
        ກໍາລັງໂຫຼດສະຖານະກະເງິນສົດ...
      </div>
    );
  }

  if (!data) {
    return (
      <>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <Banknote className="size-4 text-amber-700" />
            <span>ຍັງບໍ່ໄດ້ເປີດກະເງິນສົດ — ກະລຸນາເປີດກະກ່ອນຮັບເງິນສົດ</span>
          </div>
          <Button size="sm" onClick={() => setOpenDialog(true)}>
            <Play className="size-4" />
            ເປີດກະ
          </Button>
        </div>
        <OpenShiftDialog
          open={openDialog}
          onOpenChange={setOpenDialog}
          submitting={openShift.isPending}
          onSubmit={async (vals) => {
            try {
              await handleOpen(vals);
            } catch {
              // fetcher handles error toast
            }
          }}
        />
      </>
    );
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card px-4 py-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <div className="flex items-center gap-1.5 font-medium text-emerald-700">
            <Banknote className="size-4" />
            ກະເງິນສົດເປີດ
          </div>
          <span>
            <span className="text-muted-foreground">ພະນັກງານ:</span>{" "}
            {data.shift.openedByName}
          </span>
          <span>
            <span className="text-muted-foreground">ເວລາ:</span>{" "}
            {format(new Date(data.shift.openedAt), "dd/MM/yyyy HH:mm")}
          </span>
          <span>
            <span className="text-muted-foreground">ຮັບເງິນສົດ:</span>{" "}
            <strong className="tabular-nums">
              {formatMoney(data.totals.cash)} ₭
            </strong>
          </span>
          <span>
            <span className="text-muted-foreground">ຄາດຫວັງໃນລິ້ນຊັກ:</span>{" "}
            <strong className="text-primary tabular-nums">
              {formatMoney(data.expectedCash)} ₭
            </strong>
          </span>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setCloseDialog(true)}
        >
          <LogOut className="size-4" />
          ປິດກະ
        </Button>
      </div>

      <CloseShiftDialog
        open={closeDialog}
        onOpenChange={setCloseDialog}
        shiftData={data}
        submitting={closeShift.isPending}
        onSubmit={async (vals) => {
          try {
            await handleClose(data, vals);
          } catch {
            // fetcher handles error toast
          }
        }}
      />
    </>
  );
}
