import type { getBookingsBySource } from "./service/get-bookings-by-source";
import type { getDailyCashSummary } from "./service/get-daily-cash-summary";
import type { getDailySales } from "./service/get-daily-sales";
import type { getHkProductivity } from "./service/get-hk-productivity";
import type { getOccupancy } from "./service/get-occupancy";
import type { getRevenueBySource } from "./service/get-revenue-by-source";
import type { getSalesByShift } from "./service/get-sales-by-shift";
import type { getShiftReconciliation } from "./service/get-shift-reconciliation";
import type { getSummary } from "./service/get-summary";

export type DailySalesResult = Awaited<ReturnType<typeof getDailySales>>;
export type OccupancyResult = Awaited<ReturnType<typeof getOccupancy>>;
export type ReportSummaryResult = Awaited<ReturnType<typeof getSummary>>;
export type ShiftReconciliationResult = Awaited<
  ReturnType<typeof getShiftReconciliation>
>;
export type SalesByShiftResult = Awaited<ReturnType<typeof getSalesByShift>>;
export type DailyCashSummaryResult = Awaited<
  ReturnType<typeof getDailyCashSummary>
>;
export type BookingsBySourceResult = Awaited<
  ReturnType<typeof getBookingsBySource>
>;
export type RevenueBySourceResult = Awaited<
  ReturnType<typeof getRevenueBySource>
>;
export type HkProductivityResult = Awaited<
  ReturnType<typeof getHkProductivity>
>;
