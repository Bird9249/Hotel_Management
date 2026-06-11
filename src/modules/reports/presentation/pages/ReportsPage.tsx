import { format } from "date-fns";
import { ChartColumn } from "lucide-react";
import { useMemo, useState } from "react";
import { Header } from "@/app/layout/Header";
import { Main } from "@/app/layout/Main";
import {
  Card,
  CardContent,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/kit";
import { formatMoney } from "@/modules/billing/presentation/ui/invoice-status";
import { useDailySalesQuery, useOccupancyQuery } from "../api/queries";
import {
  DateRangePicker,
  dateRangeToParams,
  defaultReportDateRange,
} from "../ui/DateRangePicker";
import { OccupancyChart } from "../ui/OccupancyChart";
import { SalesChart } from "../ui/SalesChart";
import { StatCard } from "../ui/StatCard";

export function ReportsPage() {
  const [range, setRange] = useState(defaultReportDateRange);
  const params = useMemo(() => dateRangeToParams(range), [range]);

  const sales = useDailySalesQuery(params ?? { from: "", to: "" });
  const occupancy = useOccupancyQuery(params ?? { from: "", to: "" });

  const salesTotal = useMemo(
    () => (sales.data ?? []).reduce((sum, row) => sum + row.grandTotal, 0),
    [sales.data],
  );

  const avgOccupancy = useMemo(() => {
    const rows = occupancy.data ?? [];
    if (rows.length === 0) return 0;
    const sum = rows.reduce((acc, row) => acc + row.rate, 0);
    return Math.round((sum / rows.length) * 1000) / 10;
  }, [occupancy.data]);

  const rangeLabel =
    range.from && range.to
      ? `${format(range.from, "dd/MM/yyyy")} – ${format(range.to, "dd/MM/yyyy")}`
      : "";

  return (
    <>
      <Header />
      <Main>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 font-bold text-2xl tracking-tight">
              <ChartColumn className="size-7 text-primary" />
              ລາຍງານ
            </h2>
            <p className="text-muted-foreground">
              ລາຍຮັບປະຈຳວັນ ແລະ ອັດຕາການເຂົ້າພັກ.
            </p>
          </div>
          <DateRangePicker value={range} onChange={setRange} />
        </div>

        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StatCard
            label="ລາຍຮັບລວມໃນຊ່ວງ"
            value={`${formatMoney(salesTotal)} ₭`}
            hint={rangeLabel || undefined}
          />
          <StatCard
            label="ອັດຕາເຂົ້າພັກເຊື່ອມ"
            value={`${avgOccupancy}%`}
            hint="ຄ່າສະເລ່ຍຕໍ່ວັນໃນຊ່ວງທີ່ເລືອກ"
          />
        </div>

        <Tabs defaultValue="sales" className="gap-4">
          <TabsList>
            <TabsTrigger value="sales">ລາຍຮັບ</TabsTrigger>
            <TabsTrigger value="occupancy">ອັດຕາເຂົ້າພັກ</TabsTrigger>
          </TabsList>

          <TabsContent value="sales">
            {sales.isLoading ? (
              <Card>
                <CardContent className="p-6">
                  <Skeleton className="h-[300px] w-full" />
                </CardContent>
              </Card>
            ) : sales.data && sales.data.length > 0 ? (
              <SalesChart
                data={sales.data}
                description={rangeLabel || undefined}
              />
            ) : (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  ບໍ່ມີຂໍ້ມູນການຊຳລະໃນຊ່ວງວັນທີນີ້
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="occupancy">
            {occupancy.isLoading ? (
              <Card>
                <CardContent className="p-6">
                  <Skeleton className="h-[300px] w-full" />
                </CardContent>
              </Card>
            ) : occupancy.data && occupancy.data.length > 0 ? (
              <OccupancyChart
                data={occupancy.data}
                description={rangeLabel || undefined}
              />
            ) : (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  ບໍ່ມີຂໍ້ມູນການເຂົ້າພັກໃນຊ່ວງວັນທີນີ້
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </Main>
    </>
  );
}
