import type { getDailyCashSummary } from "./service/get-daily-cash-summary";
import type { getDailySales } from "./service/get-daily-sales";
import type { getOccupancy } from "./service/get-occupancy";
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
