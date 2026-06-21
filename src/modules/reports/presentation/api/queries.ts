import { useQuery } from "@tanstack/react-query";
import {
  type DateRangeParams,
  type HkProductivityParams,
  reportsApi,
} from "./client";

export const reportsKeys = {
  all: ["reports"] as const,
  dailySales: (q: DateRangeParams) => ["reports", "daily-sales", q] as const,
  occupancy: (q: DateRangeParams) => ["reports", "occupancy", q] as const,
  summary: () => ["reports", "summary"] as const,
  shiftReconciliation: (q: DateRangeParams) =>
    ["reports", "shift-reconciliation", q] as const,
  salesByShift: (q: DateRangeParams) =>
    ["reports", "sales-by-shift", q] as const,
  dailyCash: (q: DateRangeParams) => ["reports", "daily-cash", q] as const,
  bookingsBySource: (q: DateRangeParams) =>
    ["reports", "bookings-by-source", q] as const,
  revenueBySource: (q: DateRangeParams) =>
    ["reports", "revenue-by-source", q] as const,
  hkProductivity: (q: HkProductivityParams) =>
    ["reports", "hk-productivity", q] as const,
};

function useDateRangeQuery<T>(
  key: readonly unknown[],
  queryFn: () => Promise<T>,
  query: DateRangeParams,
  enabled = true,
) {
  return useQuery({
    queryKey: key,
    queryFn,
    enabled: enabled && Boolean(query.from && query.to),
  });
}

export function useDailySalesQuery(query: DateRangeParams, enabled = true) {
  return useDateRangeQuery(
    reportsKeys.dailySales(query),
    () => reportsApi.dailySales(query),
    query,
    enabled,
  );
}

export function useOccupancyQuery(query: DateRangeParams, enabled = true) {
  return useDateRangeQuery(
    reportsKeys.occupancy(query),
    () => reportsApi.occupancy(query),
    query,
    enabled,
  );
}

export function useReportSummaryQuery(enabled = true) {
  return useQuery({
    queryKey: reportsKeys.summary(),
    queryFn: () => reportsApi.summary(),
    enabled,
  });
}

export function useShiftReconciliationQuery(
  query: DateRangeParams,
  enabled = true,
) {
  return useDateRangeQuery(
    reportsKeys.shiftReconciliation(query),
    () => reportsApi.shiftReconciliation(query),
    query,
    enabled,
  );
}

export function useSalesByShiftQuery(query: DateRangeParams, enabled = true) {
  return useDateRangeQuery(
    reportsKeys.salesByShift(query),
    () => reportsApi.salesByShift(query),
    query,
    enabled,
  );
}

export function useDailyCashQuery(query: DateRangeParams, enabled = true) {
  return useDateRangeQuery(
    reportsKeys.dailyCash(query),
    () => reportsApi.dailyCash(query),
    query,
    enabled,
  );
}

export function useBookingsBySourceQuery(
  query: DateRangeParams,
  enabled = true,
) {
  return useDateRangeQuery(
    reportsKeys.bookingsBySource(query),
    () => reportsApi.bookingsBySource(query),
    query,
    enabled,
  );
}

export function useRevenueBySourceQuery(
  query: DateRangeParams,
  enabled = true,
) {
  return useDateRangeQuery(
    reportsKeys.revenueBySource(query),
    () => reportsApi.revenueBySource(query),
    query,
    enabled,
  );
}

export function useHkProductivityQuery(
  query: HkProductivityParams,
  enabled = true,
) {
  return useDateRangeQuery(
    reportsKeys.hkProductivity(query),
    () => reportsApi.hkProductivity(query),
    query,
    enabled,
  );
}
