import { Banknote, LogOut, Play } from "lucide-react";
import { Button } from "@/components/kit";

type CashShiftToolbarProps = {
  hasOpenShift: boolean;
  isLoading?: boolean;
  onOpen?: () => void;
  onClose: () => void;
};

export function CashShiftToolbar({
  hasOpenShift,
  isLoading,
  onOpen,
  onClose,
}: CashShiftToolbarProps) {
  return (
    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
      <div>
        <h2 className="flex items-center gap-2 font-bold text-2xl tracking-tight">
          <Banknote className="size-7 text-primary" />
          ກະເງິນສົດ
        </h2>
        <p className="text-muted-foreground">ເປີດ–ປິດກະ ແລະ ສົ່ງມອບເງິນສົດປະຈຳວັນ.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {!hasOpenShift && onOpen && (
          <Button onClick={onOpen} disabled={isLoading}>
            <Play className="size-4" />
            ເປີດກະ
          </Button>
        )}
        {hasOpenShift && (
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            <LogOut className="size-4" />
            ປິດກະ
          </Button>
        )}
      </div>
    </div>
  );
}
