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
import {
  useDailyCashQuery,
  useDailySalesQuery,
  useOccupancyQuery,
  useSalesByShiftQuery,
  useShiftReconciliationQuery,
} from "../api/queries";
import { DailyCashReport } from "../ui/DailyCashReport";
import {
  DateRangePicker,
  dateRangeToParams,
  defaultReportDateRange,
} from "../ui/DateRangePicker";
import { OccupancyChart } from "../ui/OccupancyChart";
import { SalesByShiftTable } from "../ui/SalesByShiftTable";
import { SalesChart } from "../ui/SalesChart";
import { ShiftReconciliationTable } from "../ui/ShiftReconciliationTable";
import { StatCard } from "../ui/StatCard";

function ReportLoadingSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <Skeleton className="h-[300px] w-full" />
      </CardContent>
    </Card>
  );
}

function ReportEmpty({ message }: { message: string }) {
  return (
    <Card>
      <CardContent className="p-8 text-center text-muted-foreground">
        {message}
      </CardContent>
    </Card>
  );
}

export function ReportsPage() {
  const [range, setRange] = useState(defaultReportDateRange);
  const params = useMemo(() => dateRangeToParams(range), [range]);
  const emptyParams = params ?? { from: "", to: "" };

  const sales = useDailySalesQuery(emptyParams);
  const occupancy = useOccupancyQuery(emptyParams);
  const shiftReconciliation = useShiftReconciliationQuery(emptyParams);
  const salesByShift = useSalesByShiftQuery(emptyParams);
  const dailyCash = useDailyCashQuery(emptyParams);

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

  const cashStats = useMemo(() => {
    const shifts = shiftReconciliation.data ?? [];
    const closedWithVariance = shifts.filter((s) => s.variance != null);
    const totalVariance = closedWithVariance.reduce(
      (sum, s) => sum + (s.variance ?? 0),
      0,
    );
    const shiftSalesTotal = (salesByShift.data ?? []).reduce(
      (sum, row) => sum + row.grandTotal,
      0,
    );
    return {
      shiftCount: shifts.length,
      totalVariance,
      shiftSalesTotal,
    };
  }, [shiftReconciliation.data, salesByShift.data]);

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
              ລາຍຮັບ, ການເຂົ້າພັກ ແລະ ກະເງິນສົດ.
            </p>
          </div>
          <DateRangePicker value={range} onChange={setRange} />
        </div>

        <Tabs defaultValue="sales" className="gap-4">
          <TabsList className="h-auto flex-wrap">
            <TabsTrigger value="sales">ລາຍຮັບ</TabsTrigger>
            <TabsTrigger value="occupancy">ອັດຕາເຂົ້າພັກ</TabsTrigger>
            <TabsTrigger value="shift-reconciliation">
              ລາຍງານກະເງິນສົດ
            </TabsTrigger>
            <TabsTrigger value="sales-by-shift">ຍອດຂາຍຕາມກະ</TabsTrigger>
            <TabsTrigger value="daily-cash">ຍອດເງິນສົດປະຈຳວັນ</TabsTrigger>
          </TabsList>

          <TabsContent value="sales" className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <StatCard
                label="ລາຍຮັບລວມໃນຊ່ວງ"
                value={`${formatMoney(salesTotal)} ₭`}
                hint={rangeLabel || undefined}
              />
            </div>
            {sales.isLoading ? (
              <ReportLoadingSkeleton />
            ) : sales.data && sales.data.length > 0 ? (
              <SalesChart
                data={sales.data}
                description={rangeLabel || undefined}
              />
            ) : (
              <ReportEmpty message="ບໍ່ມີຂໍ້ມູນການຊຳລະໃນຊ່ວງວັນທີນີ້" />
            )}
          </TabsContent>

          <TabsContent value="occupancy" className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <StatCard
                label="ອັດຕາເຂົ້າພັກເຊື່ອມ"
                value={`${avgOccupancy}%`}
                hint="ຄ່າສະເລ່ຍຕໍ່ວັນໃນຊ່ວງທີ່ເລືອກ"
              />
            </div>
            {occupancy.isLoading ? (
              <ReportLoadingSkeleton />
            ) : occupancy.data && occupancy.data.length > 0 ? (
              <OccupancyChart
                data={occupancy.data}
                description={rangeLabel || undefined}
              />
            ) : (
              <ReportEmpty message="ບໍ່ມີຂໍ້ມູນການເຂົ້າພັກໃນຊ່ວງວັນທີນີ້" />
            )}
          </TabsContent>

          <TabsContent value="shift-reconciliation" className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <StatCard
                label="ຈຳນວນກະໃນຊ່ວງ"
                value={String(cashStats.shiftCount)}
                hint={rangeLabel || undefined}
              />
              <StatCard
                label="ຜົນຕ່າງເງິນສົດລວມ"
                value={`${formatMoney(cashStats.totalVariance)} ₭`}
                hint="ຈາກກະທີ່ປິດແລ້ວ"
              />
            </div>
            {shiftReconciliation.isLoading ? (
              <ReportLoadingSkeleton />
            ) : shiftReconciliation.data &&
              shiftReconciliation.data.length > 0 ? (
              <ShiftReconciliationTable
                data={shiftReconciliation.data}
                description={rangeLabel || undefined}
              />
            ) : (
              <ReportEmpty message="ບໍ່ມີກະເງິນສົດໃນຊ່ວງວັນທີນີ້" />
            )}
          </TabsContent>

          <TabsContent value="sales-by-shift" className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <StatCard
                label="ຍອດຂາຍຕາມກະລວມ"
                value={`${formatMoney(cashStats.shiftSalesTotal)} ₭`}
                hint={rangeLabel || undefined}
              />
            </div>
            {salesByShift.isLoading ? (
              <ReportLoadingSkeleton />
            ) : salesByShift.data && salesByShift.data.length > 0 ? (
              <SalesByShiftTable
                data={salesByShift.data}
                description={rangeLabel || undefined}
              />
            ) : (
              <ReportEmpty message="ບໍ່ມີຍອດຂາຍຕາມກະໃນຊ່ວງວັນທີນີ້" />
            )}
          </TabsContent>

          <TabsContent value="daily-cash" className="flex flex-col gap-4">
            {dailyCash.isLoading ? (
              <ReportLoadingSkeleton />
            ) : dailyCash.data && dailyCash.data.length > 0 ? (
              <DailyCashReport
                data={dailyCash.data}
                description={rangeLabel || undefined}
              />
            ) : (
              <ReportEmpty message="ບໍ່ມີກະທີ່ປິດໃນຊ່ວງວັນທີນີ້" />
            )}
          </TabsContent>
        </Tabs>
      </Main>
    </>
  );
}
