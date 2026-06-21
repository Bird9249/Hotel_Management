import type { ChartConfig } from "@/components/kit";
import { RESERVATION_SOURCE_LABELS } from "@/modules/reservations/presentation/ui/reservation-sources";

const SOURCE_COLORS: Record<string, string> = {
  front_desk: "var(--chart-1)",
  direct_web: "var(--chart-2)",
  agoda: "var(--chart-3)",
  booking_com: "var(--chart-4)",
  expedia: "var(--chart-5)",
  other: "var(--chart-6)",
};

const FALLBACK_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
];

type SourceRow = {
  totalsBySource: Record<string, number>;
};

export function collectSourceKeys(rows: SourceRow[]): string[] {
  const keys = new Set<string>();
  for (const row of rows) {
    for (const key of Object.keys(row.totalsBySource)) {
      keys.add(key);
    }
  }
  return [...keys].sort((a, b) => a.localeCompare(b));
}

export function getSourceLabel(
  sourceKey: string,
  channels: Array<{ id: string; name: string }>,
): string {
  const channel = channels.find((item) => item.id === sourceKey);
  if (channel) return channel.name;
  return RESERVATION_SOURCE_LABELS[sourceKey] ?? sourceKey;
}

export function buildSourceChartConfig(
  sourceKeys: string[],
  channels: Array<{ id: string; name: string }>,
): ChartConfig {
  const config: ChartConfig = {};

  sourceKeys.forEach((key, index) => {
    config[key] = {
      label: getSourceLabel(key, channels),
      color:
        SOURCE_COLORS[key] ??
        FALLBACK_COLORS[index % FALLBACK_COLORS.length] ??
        "var(--chart-1)",
    };
  });

  return config;
}

export function sumBySourceKeys(
  rows: SourceRow[],
  sourceKeys: string[],
): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const key of sourceKeys) {
    totals[key] = 0;
  }
  for (const row of rows) {
    for (const key of sourceKeys) {
      totals[key] = (totals[key] ?? 0) + (row.totalsBySource[key] ?? 0);
    }
  }
  return totals;
}
