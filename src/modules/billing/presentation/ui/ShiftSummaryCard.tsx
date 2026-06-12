import { Card, CardContent } from "@/components/kit";
import type { CurrentShiftResult } from "@/modules/billing/domain/types";
import { Banknote, CreditCard, Landmark, Wallet } from "lucide-react";
import { formatMoney } from "./invoice-status";

type ShiftSummaryCardProps = {
  data: NonNullable<CurrentShiftResult>;
};

const breakdownItems = [
  {
    key: "opening",
    label: "ເງິນຕັ້ງຕົ້ນ",
    getValue: (data: NonNullable<CurrentShiftResult>) => data.shift.openingCash,
    icon: Wallet,
  },
  {
    key: "cash",
    label: "ຮັບເງິນສົດ",
    getValue: (data: NonNullable<CurrentShiftResult>) => data.totals.cash,
    icon: Banknote,
  },
  {
    key: "transfer",
    label: "ໂອນເງິນ",
    getValue: (data: NonNullable<CurrentShiftResult>) => data.totals.transfer,
    icon: Landmark,
  },
  {
    key: "card",
    label: "ບັດເຄຣດິດ",
    getValue: (data: NonNullable<CurrentShiftResult>) => data.totals.card,
    icon: CreditCard,
  },
] as const;

export function ShiftSummaryCard({ data }: ShiftSummaryCardProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {breakdownItems.map((item) => (
          <Card key={item.key} className="overflow-hidden p-0">
            <CardContent className="flex h-full min-h-[5.5rem] flex-col justify-between p-4">
              <div className="flex items-center gap-2">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <item.icon className="size-4 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-xs leading-snug">
                  {item.label}
                </p>
              </div>
              <p className="mt-2 font-semibold text-lg tabular-nums">
                {formatMoney(item.getValue(data))} ₭
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-primary/30 bg-primary/5 ring-1 ring-primary/10">
        <CardContent className="flex items-center justify-between gap-4 p-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Wallet className="size-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-sm">ເງິນສົດຄາດຫວັງໃນລິ້ນຊັກ</p>
              <p className="text-muted-foreground text-xs">ເງິນຕັ້ງຕົ້ນ + ຮັບເງິນສົດ</p>
            </div>
          </div>
          <p className="shrink-0 font-bold text-2xl text-primary tabular-nums">
            {formatMoney(data.expectedCash)} ₭
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
