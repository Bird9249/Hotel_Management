import { format } from "date-fns";
import { ChartColumn } from "lucide-react";
import { useMemo, useState } from "react";
import { Header } from "@/app/layout/Header";
import { Main } from "@/app/layout/Main";
import {
  Button,
  Card,
  CardContent,
  Skeleton,
  Tabs,
  TabsContent,
} from "@/components/kit";
import { formatMoney } from "@/modules/billing/presentation/ui/invoice-status";
import { useChannelsQuery } from "@/modules/channels/presentation/api/queries";
import {
  useBookingsBySourceQuery,
  useDailyCashQuery,
  useDailySalesQuery,
  useHkProductivityQuery,
  useOccupancyQuery,
  useRevenueBySourceQuery,
  useSalesByShiftQuery,
  useShiftReconciliationQuery,
} from "../api/queries";
import {
  exportBookingsBySourceCsv,
  exportDailyCashCsv,
  exportDailySalesCsv,
  exportHkProductivityCsv,
  exportOccupancyCsv,
  exportRevenueBySourceCsv,
  exportSalesByShiftCsv,
  exportShiftReconciliationCsv,
} from "../lib/export-csv";
import { collectSourceKeys, sumBySourceKeys } from "../lib/source-report";
import { DailyCashReport } from "../ui/DailyCashReport";
import {
  DateRangePicker,
  dateRangeToParams,
  defaultReportDateRange,
} from "../ui/DateRangePicker";
import { ExportCsvButton } from "../ui/ExportCsvButton";
import { HkProductivityTable } from "../ui/HkProductivityTable";
import { OccupancyChart } from "../ui/OccupancyChart";
import { ReportTabsNav } from "../ui/ReportTabsNav";
import { SalesByShiftTable } from "../ui/SalesByShiftTable";
import { SalesChart } from "../ui/SalesChart";
import { ShiftReconciliationTable } from "../ui/ShiftReconciliationTable";
import {
  BookingsBySourceChart,
  RevenueBySourceChart,
} from "../ui/SourceCharts";
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
  const [hkMode, setHkMode] = useState<"daily" | "shift">("daily");
  const params = useMemo(() => dateRangeToParams(range), [range]);
  const emptyParams = params ?? { from: "", to: "" };
  const hkParams = useMemo(
    () =>
      params ? { ...params, mode: hkMode } : { from: "", to: "", mode: hkMode },
    [params, hkMode],
  );

  const channelsQuery = useChannelsQuery();
  const channels = channelsQuery.data ?? [];

  const sales = useDailySalesQuery(emptyParams);
  const occupancy = useOccupancyQuery(emptyParams);
  const shiftReconciliation = useShiftReconciliationQuery(emptyParams);
  const salesByShift = useSalesByShiftQuery(emptyParams);
  const dailyCash = useDailyCashQuery(emptyParams);
  const bookingsBySource = useBookingsBySourceQuery(emptyParams);
  const revenueBySource = useRevenueBySourceQuery(emptyParams);
  const hkProductivity = useHkProductivityQuery(hkParams);

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

  const bookingSourceStats = useMemo(() => {
    const rows = bookingsBySource.data ?? [];
    const sourceKeys = collectSourceKeys(rows);
    const totals = sumBySourceKeys(rows, sourceKeys);
    const directTotal = totals.direct_web ?? 0;
    const otaTotal = Object.entries(totals).reduce((sum, [key, count]) => {
      if (key === "front_desk" || key === "direct_web" || key === "other") {
        return sum;
      }
      return sum + count;
    }, 0);
    const grandTotal = rows.reduce((sum, row) => sum + row.grandTotal, 0);
    return { directTotal, otaTotal, grandTotal };
  }, [bookingsBySource.data]);

  const revenueSourceTotal = useMemo(
    () =>
      (revenueBySource.data ?? []).reduce(
        (sum, row) => sum + row.grandTotal,
        0,
      ),
    [revenueBySource.data],
  );

  const hkStats = useMemo(() => {
    const data = hkProductivity.data;
    if (!data) {
      return { roomsCompleted: 0, shiftsClosed: 0 };
    }
    if (data.mode === "daily") {
      return {
        roomsCompleted: data.rows.reduce(
          (sum, row) => sum + row.roomsCompleted,
          0,
        ),
        shiftsClosed: data.rows.reduce((sum, row) => sum + row.shiftsClosed, 0),
      };
    }
    return {
      roomsCompleted: data.rows.reduce(
        (sum, row) => sum + row.roomsCompleted,
        0,
      ),
      shiftsClosed: data.rows.length,
    };
  }, [hkProductivity.data]);

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
              ລາຍຮັບ, ການເຂົ້າພັກ, ຊ່ອງທາງຈອງ ແລະ ຜົນງານແມ່ບ້ານ.
            </p>
          </div>
          <DateRangePicker value={range} onChange={setRange} />
        </div>

        <Tabs defaultValue="sales" className="gap-4">
          <ReportTabsNav />

          <TabsContent value="sales" className="flex flex-col gap-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <StatCard
                  label="ລາຍຮັບລວມໃນຊ່ວງ"
                  value={`${formatMoney(salesTotal)} ₭`}
                  hint={rangeLabel || undefined}
                />
              </div>
              <ExportCsvButton
                disabled={
                  !params ||
                  sales.isLoading ||
                  !sales.data ||
                  sales.data.length === 0
                }
                onExport={() => {
                  if (params && sales.data)
                    exportDailySalesCsv(sales.data, params);
                }}
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
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <StatCard
                  label="ອັດຕາເຂົ້າພັກເຊື່ອມ"
                  value={`${avgOccupancy}%`}
                  hint="ຄ່າສະເລ່ຍຕໍ່ວັນໃນຊ່ວງທີ່ເລືອກ"
                />
              </div>
              <ExportCsvButton
                disabled={
                  !params ||
                  occupancy.isLoading ||
                  !occupancy.data ||
                  occupancy.data.length === 0
                }
                onExport={() => {
                  if (params && occupancy.data) {
                    exportOccupancyCsv(occupancy.data, params);
                  }
                }}
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

          <TabsContent
            value="shift-reconciliation"
            className="flex flex-col gap-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
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
              <ExportCsvButton
                disabled={
                  !params ||
                  shiftReconciliation.isLoading ||
                  !shiftReconciliation.data ||
                  shiftReconciliation.data.length === 0
                }
                onExport={() => {
                  if (params && shiftReconciliation.data) {
                    exportShiftReconciliationCsv(
                      shiftReconciliation.data,
                      params,
                    );
                  }
                }}
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
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <StatCard
                  label="ຍອດຂາຍຕາມກະລວມ"
                  value={`${formatMoney(cashStats.shiftSalesTotal)} ₭`}
                  hint={rangeLabel || undefined}
                />
              </div>
              <ExportCsvButton
                disabled={
                  !params ||
                  salesByShift.isLoading ||
                  !salesByShift.data ||
                  salesByShift.data.length === 0
                }
                onExport={() => {
                  if (params && salesByShift.data) {
                    exportSalesByShiftCsv(salesByShift.data, params);
                  }
                }}
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
            <div className="flex justify-end">
              <ExportCsvButton
                disabled={
                  !params ||
                  dailyCash.isLoading ||
                  !dailyCash.data ||
                  dailyCash.data.length === 0
                }
                onExport={() => {
                  if (params && dailyCash.data) {
                    exportDailyCashCsv(dailyCash.data, params);
                  }
                }}
              />
            </div>
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

          <TabsContent
            value="bookings-by-source"
            className="flex flex-col gap-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatCard
                  label="ການຈອງລວມ"
                  value={String(bookingSourceStats.grandTotal)}
                  hint={rangeLabel || undefined}
                />
                <StatCard
                  label="Direct / ເວັບ"
                  value={String(bookingSourceStats.directTotal)}
                  hint={
                    bookingSourceStats.grandTotal > 0
                      ? `${Math.round((bookingSourceStats.directTotal / bookingSourceStats.grandTotal) * 1000) / 10}%`
                      : undefined
                  }
                />
                <StatCard
                  label="OTA"
                  value={String(bookingSourceStats.otaTotal)}
                  hint={
                    bookingSourceStats.grandTotal > 0
                      ? `${Math.round((bookingSourceStats.otaTotal / bookingSourceStats.grandTotal) * 1000) / 10}%`
                      : undefined
                  }
                />
              </div>
              <ExportCsvButton
                disabled={
                  !params ||
                  bookingsBySource.isLoading ||
                  !bookingsBySource.data ||
                  bookingsBySource.data.length === 0
                }
                onExport={() => {
                  if (params && bookingsBySource.data) {
                    exportBookingsBySourceCsv(
                      bookingsBySource.data,
                      params,
                      channels,
                    );
                  }
                }}
              />
            </div>
            {bookingsBySource.isLoading ? (
              <ReportLoadingSkeleton />
            ) : bookingsBySource.data && bookingsBySource.data.length > 0 ? (
              <BookingsBySourceChart
                data={bookingsBySource.data}
                channels={channels}
                description={rangeLabel || undefined}
              />
            ) : (
              <ReportEmpty message="ບໍ່ມີການຈອງໃນຊ່ວງວັນທີນີ້" />
            )}
          </TabsContent>

          <TabsContent
            value="revenue-by-source"
            className="flex flex-col gap-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <StatCard
                  label="ລາຍຮັບຕາມຊ່ອງທາງລວມ"
                  value={`${formatMoney(revenueSourceTotal)} ₭`}
                  hint={rangeLabel || undefined}
                />
              </div>
              <ExportCsvButton
                disabled={
                  !params ||
                  revenueBySource.isLoading ||
                  !revenueBySource.data ||
                  revenueBySource.data.length === 0
                }
                onExport={() => {
                  if (params && revenueBySource.data) {
                    exportRevenueBySourceCsv(
                      revenueBySource.data,
                      params,
                      channels,
                    );
                  }
                }}
              />
            </div>
            {revenueBySource.isLoading ? (
              <ReportLoadingSkeleton />
            ) : revenueBySource.data && revenueBySource.data.length > 0 ? (
              <RevenueBySourceChart
                data={revenueBySource.data}
                channels={channels}
                description={rangeLabel || undefined}
              />
            ) : (
              <ReportEmpty message="ບໍ່ມີລາຍຮັບຕາມຊ່ອງທາງໃນຊ່ວງວັນທີນີ້" />
            )}
          </TabsContent>

          <TabsContent value="hk-productivity" className="flex flex-col gap-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <StatCard
                  label="ຫ້ອງເສັດລວມ"
                  value={String(hkStats.roomsCompleted)}
                  hint={rangeLabel || undefined}
                />
                <StatCard
                  label="ກະທີ່ປິດ"
                  value={String(hkStats.shiftsClosed)}
                  hint={hkMode === "daily" ? "ສະຫຼຸບຕາມວັນ" : "ລາຍການຕາມກະ"}
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={hkMode === "daily" ? "default" : "outline"}
                  onClick={() => setHkMode("daily")}
                >
                  ຕາມວັນ
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={hkMode === "shift" ? "default" : "outline"}
                  onClick={() => setHkMode("shift")}
                >
                  ຕາມກະ
                </Button>
                <ExportCsvButton
                  disabled={
                    !params ||
                    hkProductivity.isLoading ||
                    !hkProductivity.data ||
                    hkProductivity.data.rows.length === 0
                  }
                  onExport={() => {
                    if (params && hkProductivity.data) {
                      exportHkProductivityCsv(hkProductivity.data, params);
                    }
                  }}
                />
              </div>
            </div>
            {hkProductivity.isLoading ? (
              <ReportLoadingSkeleton />
            ) : hkProductivity.data && hkProductivity.data.rows.length > 0 ? (
              <HkProductivityTable
                data={hkProductivity.data}
                description={rangeLabel || undefined}
              />
            ) : (
              <ReportEmpty message="ບໍ່ມີຂໍ້ມູນກະແມ່ບ້ານໃນຊ່ວງວັນທີນີ້" />
            )}
          </TabsContent>
        </Tabs>
      </Main>
    </>
  );
}
