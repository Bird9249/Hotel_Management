import type { getDailySales } from "./service/get-daily-sales";
import type { getOccupancy } from "./service/get-occupancy";
import type { getSummary } from "./service/get-summary";

export type DailySalesResult = Awaited<ReturnType<typeof getDailySales>>;
export type OccupancyResult = Awaited<ReturnType<typeof getOccupancy>>;
export type ReportSummaryResult = Awaited<ReturnType<typeof getSummary>>;
