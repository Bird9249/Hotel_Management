import { Banknote, Play } from "lucide-react";
import type { ReactNode } from "react";
import { Button, Card, CardContent, Skeleton } from "@/components/kit";
import { useActionPermission } from "@/modules/auth/presentation/model/useActionPermission";
import { useCurrentShiftQuery } from "../api/queries";
import { OpenShiftDialog } from "./OpenShiftDialog";
import { useCashShiftActions } from "./useCashShiftActions";

type OpenShiftGateProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function OpenShiftGate({
  title,
  description,
  children,
}: OpenShiftGateProps) {
  const shift = useCurrentShiftQuery();
  const canOpenShift = useActionPermission(["billing:shift"]);
  const { openShift, openDialog, setOpenDialog, handleOpen } =
    useCashShiftActions(!!canOpenShift);

  if (shift.isLoading) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center px-6 py-14">
          <Skeleton className="mb-3 size-10 rounded-full" />
          <Skeleton className="h-5 w-48" />
          <Skeleton className="mt-2 h-4 w-64" />
        </CardContent>
      </Card>
    );
  }

  if (!shift.data) {
    return (
      <>
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center px-6 py-14 text-center">
            <Banknote className="mb-3 size-10 text-amber-600" />
            <p className="font-semibold text-lg">{title}</p>
            <p className="mt-2 max-w-md text-muted-foreground text-sm">
              {description}
            </p>
            <p className="mt-4 max-w-md text-muted-foreground text-sm">
              ກະລຸນາເປີດກະເງິນສົດ ແລະ ບັນທຶກເງິນຕັ້ງຕົ້ນໃນລິ້ນຊັກກ່ອນເຂົ້າໃຊ້ງານໜ້ານີ້
            </p>
            {canOpenShift ? (
              <Button className="mt-6" onClick={() => setOpenDialog(true)}>
                <Play className="size-4" />
                ເປີດກະເງິນສົດ
              </Button>
            ) : (
              <p className="mt-6 text-muted-foreground text-sm">
                ຕິດຕໍ່ຜູ້ມີສິດເປີດກະເພື່ອເລີ່ມການດຳເນີນງານ
              </p>
            )}
          </CardContent>
        </Card>

        {canOpenShift && (
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
        )}
      </>
    );
  }

  return children;
}
