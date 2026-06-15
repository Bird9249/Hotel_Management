import { format, parseISO } from "date-fns";
import { PAYMENT_METHOD_OPTIONS } from "@/modules/billing/presentation/ui/invoice-status";
import type {
  DailyCashSummaryResult,
  DailySalesResult,
  OccupancyResult,
  SalesByShiftResult,
  ShiftReconciliationResult,
} from "@/modules/reports/domain/types";
import { buildCsv, downloadCsv } from "@/shared/lib/csv";
import type { DateRangeParams } from "../api/client";

function reportFilename(key: string, params: DateRangeParams): string {
  return `${key}_${params.from}_${params.to}.csv`;
}

function formatDay(day: string): string {
  return format(parseISO(day), "dd/MM/yyyy");
}

function formatDateTime(iso: string | null): string {
  if (!iso) return "";
  return format(new Date(iso), "dd/MM/yyyy HH:mm");
}

function shiftStatusLabel(status: string): string {
  return status === "open" ? "ເປີດ" : "ປິດ";
}

function exportReport<T>(
  rows: T[],
  columns: Parameters<typeof buildCsv<T>>[1],
  filenameKey: string,
  params: DateRangeParams,
): void {
  downloadCsv(buildCsv(rows, columns), reportFilename(filenameKey, params));
}

export function exportDailySalesCsv(
  data: DailySalesResult,
  params: DateRangeParams,
): void {
  exportReport(
    data,
    [
      { header: "ວັນທີ", value: (row) => formatDay(row.day) },
      ...PAYMENT_METHOD_OPTIONS.map((method) => ({
        header: method.label,
        value: (row: DailySalesResult[number]) =>
          row.totalsByMethod[method.value] ?? 0,
      })),
      { header: "ລວມ", value: (row) => row.grandTotal },
    ],
    "daily-sales",
    params,
  );
}

export function exportOccupancyCsv(
  data: OccupancyResult,
  params: DateRangeParams,
): void {
  exportReport(
    data,
    [
      { header: "ວັນທີ", value: (row) => formatDay(row.day) },
      { header: "ຫ້ອງທີ່ມີແຂກ", value: (row) => row.occupiedRooms },
      { header: "ຫ້ອງທັງໝົດ", value: (row) => row.totalRooms },
      {
        header: "ອັດຕາເຂົ້າພັກ (%)",
        value: (row) => Math.round(row.rate * 1000) / 10,
      },
    ],
    "occupancy",
    params,
  );
}

export function exportShiftReconciliationCsv(
  data: ShiftReconciliationResult,
  params: DateRangeParams,
): void {
  exportReport(
    data,
    [
      { header: "ເປີດກະ", value: (row) => formatDateTime(row.openedAt) },
      { header: "ປິດກະ", value: (row) => formatDateTime(row.closedAt) },
      { header: "ພະນັກງານ", value: (row) => row.openedByName },
      { header: "ຕັ້ງຕົ້ນ", value: (row) => row.openingCash },
      { header: "ເງິນສົດ", value: (row) => row.cashReceived ?? "" },
      { header: "ໂອນ", value: (row) => row.transferReceived ?? "" },
      { header: "ບັດ", value: (row) => row.cardReceived ?? "" },
      { header: "ຄາດຫວັງ", value: (row) => row.expectedCash ?? "" },
      { header: "ນັບໄດ້", value: (row) => row.closingCashCounted ?? "" },
      { header: "ຜົນຕ່າງ", value: (row) => row.variance ?? "" },
      { header: "ສະຖານະ", value: (row) => shiftStatusLabel(row.status) },
    ],
    "shift-reconciliation",
    params,
  );
}

export function exportSalesByShiftCsv(
  data: SalesByShiftResult,
  params: DateRangeParams,
): void {
  exportReport(
    data,
    [
      { header: "ເປີດກະ", value: (row) => formatDateTime(row.openedAt) },
      { header: "ປິດກະ", value: (row) => formatDateTime(row.closedAt) },
      { header: "ພະນັກງານ", value: (row) => row.openedByName },
      ...PAYMENT_METHOD_OPTIONS.map((method) => ({
        header: method.label,
        value: (row: SalesByShiftResult[number]) =>
          row.totalsByMethod[method.value] ?? 0,
      })),
      { header: "ລວມ", value: (row) => row.grandTotal },
      { header: "ສະຖານະ", value: (row) => shiftStatusLabel(row.status) },
    ],
    "sales-by-shift",
    params,
  );
}

export function exportDailyCashCsv(
  data: DailyCashSummaryResult,
  params: DateRangeParams,
): void {
  exportReport(
    data,
    [
      { header: "ວັນທີ", value: (row) => formatDay(row.day) },
      { header: "ຈຳນວນກະ", value: (row) => row.shiftCount },
      { header: "ເງິນຕັ້ງຕົ້ນ", value: (row) => row.openingCash },
      { header: "ຮັບເງິນສົດ", value: (row) => row.cashReceived },
      { header: "ຄາດຫວັງ", value: (row) => row.expectedCash },
      { header: "ນັບໄດ້", value: (row) => row.closingCashCounted },
      { header: "ຜົນຕ່າງລວມ", value: (row) => row.totalVariance },
    ],
    "daily-cash",
    params,
  );
}
