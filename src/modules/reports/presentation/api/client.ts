import type {
  DailyCashSummaryResult,
  DailySalesResult,
  OccupancyResult,
  ReportSummaryResult,
  SalesByShiftResult,
  ShiftReconciliationResult,
} from "@/modules/reports/domain/types";
import { config } from "@/shared/lib/config";
import { fetcher } from "@/shared/lib/fetcher";

const hotelBase = `${config.apiUrl}/hotel`;

export type DateRangeParams = {
  from: string;
  to: string;
};

function withDateRange(url: URL, query: DateRangeParams) {
  url.searchParams.set("from", query.from);
  url.searchParams.set("to", query.to);
}

export const reportsApi = {
  async dailySales(query: DateRangeParams) {
    const url = new URL(`${hotelBase}/reports/daily-sales`);
    withDateRange(url, query);
    return fetcher.get<DailySalesResult>(url.toString());
  },
  async occupancy(query: DateRangeParams) {
    const url = new URL(`${hotelBase}/reports/occupancy`);
    withDateRange(url, query);
    return fetcher.get<OccupancyResult>(url.toString());
  },
  async summary() {
    return fetcher.get<ReportSummaryResult>(`${hotelBase}/reports/summary`);
  },
  async shiftReconciliation(query: DateRangeParams) {
    const url = new URL(`${hotelBase}/reports/shift-reconciliation`);
    withDateRange(url, query);
    return fetcher.get<ShiftReconciliationResult>(url.toString());
  },
  async salesByShift(query: DateRangeParams) {
    const url = new URL(`${hotelBase}/reports/sales-by-shift`);
    withDateRange(url, query);
    return fetcher.get<SalesByShiftResult>(url.toString());
  },
  async dailyCash(query: DateRangeParams) {
    const url = new URL(`${hotelBase}/reports/daily-cash`);
    withDateRange(url, query);
    return fetcher.get<DailyCashSummaryResult>(url.toString());
  },
};
