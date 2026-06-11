import type {
  DailySalesResult,
  OccupancyResult,
  ReportSummaryResult,
} from "@/modules/reports/domain/types";
import { config } from "@/shared/lib/config";
import { fetcher } from "@/shared/lib/fetcher";

const hotelBase = `${config.apiUrl}/hotel`;

export type DateRangeParams = {
  from: string;
  to: string;
};

export const reportsApi = {
  async dailySales(query: DateRangeParams) {
    const url = new URL(`${hotelBase}/reports/daily-sales`);
    url.searchParams.set("from", query.from);
    url.searchParams.set("to", query.to);
    return fetcher.get<DailySalesResult>(url.toString());
  },
  async occupancy(query: DateRangeParams) {
    const url = new URL(`${hotelBase}/reports/occupancy`);
    url.searchParams.set("from", query.from);
    url.searchParams.set("to", query.to);
    return fetcher.get<OccupancyResult>(url.toString());
  },
  async summary() {
    return fetcher.get<ReportSummaryResult>(`${hotelBase}/reports/summary`);
  },
};
