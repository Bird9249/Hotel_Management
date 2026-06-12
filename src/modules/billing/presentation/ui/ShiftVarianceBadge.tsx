import { Badge } from "@/components/kit";
import { formatMoney } from "./invoice-status";

export function ShiftVarianceBadge({ variance }: { variance: number }) {
  if (variance === 0) {
    return (
      <Badge variant="secondary" className="text-emerald-700">
        ກົງກັນ
      </Badge>
    );
  }

  const label =
    variance > 0
      ? `ເກີນ +${formatMoney(variance)} ₭`
      : `ຂາດ ${formatMoney(variance)} ₭`;

  return (
    <Badge variant="destructive" className="tabular-nums">
      {label}
    </Badge>
  );
}
