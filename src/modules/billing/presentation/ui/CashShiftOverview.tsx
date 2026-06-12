import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/kit";
import type { CurrentShiftResult } from "@/modules/billing/domain/types";
import { formatMoney } from "./invoice-status";

type CashShiftOverviewProps = {
  data: NonNullable<CurrentShiftResult>;
};

export function CashShiftOverview({ data }: CashShiftOverviewProps) {
  const cards = [
    {
      key: "opening",
      label: "ເງິນຕັ້ງຕົ້ນ",
      value: `${formatMoney(data.shift.openingCash)} ₭`,
      hint: `ເປີດໂດຍ ${data.shift.openedByName}`,
    },
    {
      key: "cash",
      label: "ຮັບເງິນສົດ",
      value: `${formatMoney(data.totals.cash)} ₭`,
      hint: "ສະສົມໃນກະນີ້",
    },
    {
      key: "transfer",
      label: "ໂອນເງິນ",
      value: `${formatMoney(data.totals.transfer)} ₭`,
      hint: "ສະສົມໃນກະນີ້",
    },
    {
      key: "expected",
      label: "ເງິນສົດຄາດຫວັງໃນລິ້ນຊັກ",
      value: `${formatMoney(data.expectedCash)} ₭`,
      hint: format(new Date(data.shift.openedAt), "dd/MM/yyyy HH:mm"),
    },
  ];

  return (
    <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card
          key={card.key}
          className={
            card.key === "expected"
              ? "border-primary/30 ring-1 ring-primary/10"
              : undefined
          }
        >
          <CardHeader>
            <CardDescription>{card.label}</CardDescription>
            <CardTitle className="font-semibold text-2xl tabular-nums">
              {card.value}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">{card.hint}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
