import { LogIn, LogOut, Percent, Wallet } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
} from "@/components/kit";
import { usePermissions } from "@/modules/auth/presentation/model/usePermissions";
import { formatMoney } from "@/modules/billing/presentation/ui/invoice-status";
import { useReportSummaryQuery } from "@/modules/reports/presentation/api/queries";

export function StatCards() {
  const { has } = usePermissions();
  const canReadReports = has("reports:read");
  const summary = useReportSummaryQuery(canReadReports);

  if (!canReadReports) return null;

  if (summary.isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {["revenue", "occupancy", "arrivals", "departures"].map((key) => (
          <Card key={key}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-2 h-8 w-32" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  const data = summary.data;
  const occupancyPct = data ? Math.round(data.occupancy.rate * 1000) / 10 : 0;

  const cards = [
    {
      key: "revenue",
      label: "ລາຍຮັບມື້ນີ້",
      value: `${formatMoney(data?.revenue ?? 0)} ₭`,
      hint: "ຈາກການຊຳລະທັງໝົດ",
      icon: Wallet,
    },
    {
      key: "occupancy",
      label: "ອັດຕາເຂົ້າພັກມື້ນີ້",
      value: `${occupancyPct}%`,
      hint: data
        ? `${data.occupancy.occupiedRooms}/${data.occupancy.totalRooms} ຫ້ອງ`
        : "",
      icon: Percent,
    },
    {
      key: "arrivals",
      label: "ເຂົ້າພັກມື້ນີ້",
      value: String(data?.arrivals ?? 0),
      hint: "ການຈອງລໍຖ້າ check-in",
      icon: LogIn,
    },
    {
      key: "departures",
      label: "ອອກມື້ນີ້",
      value: String(data?.departures ?? 0),
      hint: "ລໍຖ້າ check-out",
      icon: LogOut,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((stat) => (
        <Card key={stat.key}>
          <CardHeader>
            <CardDescription className="flex items-center gap-1.5">
              <stat.icon className="size-3.5" />
              {stat.label}
            </CardDescription>
            <CardTitle className="font-semibold text-2xl tabular-nums">
              {stat.value}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">{stat.hint}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
