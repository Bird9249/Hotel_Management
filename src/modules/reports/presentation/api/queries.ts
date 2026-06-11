import { useQuery } from "@tanstack/react-query";
import { type DateRangeParams, reportsApi } from "./client";

export const reportsKeys = {
  all: ["reports"] as const,
  dailySales: (q: DateRangeParams) => ["reports", "daily-sales", q] as const,
  occupancy: (q: DateRangeParams) => ["reports", "occupancy", q] as const,
  summary: () => ["reports", "summary"] as const,
};

export function useDailySalesQuery(query: DateRangeParams, enabled = true) {
  return useQuery({
    queryKey: reportsKeys.dailySales(query),
    queryFn: () => reportsApi.dailySales(query),
    enabled: enabled && Boolean(query.from && query.to),
  });
}

export function useOccupancyQuery(query: DateRangeParams, enabled = true) {
  return useQuery({
    queryKey: reportsKeys.occupancy(query),
    queryFn: () => reportsApi.occupancy(query),
    enabled: enabled && Boolean(query.from && query.to),
  });
}

export function useReportSummaryQuery(enabled = true) {
  return useQuery({
    queryKey: reportsKeys.summary(),
    queryFn: () => reportsApi.summary(),
    enabled,
  });
}
