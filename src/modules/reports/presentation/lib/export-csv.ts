import { format, parseISO } from "date-fns";
import { PAYMENT_METHOD_OPTIONS } from "@/modules/billing/presentation/ui/invoice-status";
import type {
  BookingsBySourceResult,
  DailyCashSummaryResult,
  DailySalesResult,
  HkProductivityResult,
  OccupancyResult,
  RevenueBySourceResult,
  SalesByShiftResult,
  ShiftReconciliationResult,
} from "@/modules/reports/domain/types";
import { buildCsv, downloadCsv } from "@/shared/lib/csv";
import type { DateRangeParams } from "../api/client";
import { collectSourceKeys, getSourceLabel } from "./source-report";

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

function flattenSourceRows(
  data: BookingsBySourceResult | RevenueBySourceResult,
  channels: Array<{ id: string; name: string }>,
) {
  const sourceKeys = collectSourceKeys(data);
  const rows: Array<{ day: string; source: string; value: number }> = [];

  for (const row of data) {
    for (const key of sourceKeys) {
      const value = row.totalsBySource[key] ?? 0;
      if (value === 0) continue;
      rows.push({
        day: row.day,
        source: getSourceLabel(key, channels),
        value,
      });
    }
  }

  return rows;
}

export function exportBookingsBySourceCsv(
  data: BookingsBySourceResult,
  params: DateRangeParams,
  channels: Array<{ id: string; name: string }>,
): void {
  exportReport(
    flattenSourceRows(data, channels),
    [
      { header: "ວັນທີ", value: (row) => formatDay(row.day) },
      { header: "ຊ່ອງທາງ", value: (row) => row.source },
      { header: "ຈຳນວນຈອງ", value: (row) => row.value },
    ],
    "bookings-by-source",
    params,
  );
}

export function exportRevenueBySourceCsv(
  data: RevenueBySourceResult,
  params: DateRangeParams,
  channels: Array<{ id: string; name: string }>,
): void {
  exportReport(
    flattenSourceRows(data, channels),
    [
      { header: "ວັນທີ", value: (row) => formatDay(row.day) },
      { header: "ຊ່ອງທາງ", value: (row) => row.source },
      { header: "ລາຍຮັບ", value: (row) => row.value },
    ],
    "revenue-by-source",
    params,
  );
}

export function exportHkProductivityCsv(
  data: HkProductivityResult,
  params: DateRangeParams,
): void {
  if (data.mode === "daily") {
    exportReport(
      data.rows,
      [
        { header: "ວັນທີ", value: (row) => formatDay(row.day) },
        { header: "ຈຳນວນກະ", value: (row) => row.shiftsClosed },
        { header: "ຫ້ອງເສັດ", value: (row) => row.roomsCompleted },
        { header: "ຫ້ອງຄ້າງ", value: (row) => row.roomsPending },
        {
          header: "ເວລາສະເລ່ຍ (ນາທີ)",
          value: (row) => row.avgMinutesPerRoom ?? "",
        },
      ],
      "hk-productivity-daily",
      params,
    );
    return;
  }

  exportReport(
    data.rows,
    [
      { header: "ເປີດກະ", value: (row) => formatDateTime(row.openedAt) },
      { header: "ປິດກະ", value: (row) => formatDateTime(row.closedAt) },
      { header: "ພະນັກງານ", value: (row) => row.openedByName },
      { header: "ຫ້ອງເສັດ", value: (row) => row.roomsCompleted },
      { header: "ຫ້ອງຄ້າງ", value: (row) => row.roomsPending },
      {
        header: "ເວລາສະເລ່ຍ (ນາທີ)",
        value: (row) => row.avgMinutesPerRoom ?? "",
      },
    ],
    "hk-productivity-shift",
    params,
  );
}
