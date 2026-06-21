import type {
  BookingsBySourceResult,
  DailyCashSummaryResult,
  DailySalesResult,
  HkProductivityResult,
  OccupancyResult,
  ReportSummaryResult,
  RevenueBySourceResult,
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

export type HkProductivityParams = DateRangeParams & {
  mode: "daily" | "shift";
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
  async bookingsBySource(query: DateRangeParams) {
    const url = new URL(`${hotelBase}/reports/bookings-by-source`);
    withDateRange(url, query);
    return fetcher.get<BookingsBySourceResult>(url.toString());
  },
  async revenueBySource(query: DateRangeParams) {
    const url = new URL(`${hotelBase}/reports/revenue-by-source`);
    withDateRange(url, query);
    return fetcher.get<RevenueBySourceResult>(url.toString());
  },
  async hkProductivity(query: HkProductivityParams) {
    const url = new URL(`${hotelBase}/reports/hk-productivity`);
    withDateRange(url, query);
    url.searchParams.set("mode", query.mode);
    return fetcher.get<HkProductivityResult>(url.toString());
  },
};
