import type { DbClient } from "@/server/platform/db/client";
import type { DbTransaction } from "@/shared/types";
import { queryDailySales } from "../repo/daily-sales";

export async function getDailySales(
  from: string,
  to: string,
  client: DbTransaction | DbClient,
) {
  const rows = await queryDailySales(from, to, client);

  const byDay = new Map<
    string,
    { day: string; totalsByMethod: Record<string, number>; grandTotal: number }
  >();

  for (const row of rows) {
    const amount = Number(row.total);
    let entry = byDay.get(row.day);
    if (!entry) {
      entry = { day: row.day, totalsByMethod: {}, grandTotal: 0 };
      byDay.set(row.day, entry);
    }
    entry.totalsByMethod[row.method] =
      (entry.totalsByMethod[row.method] ?? 0) + amount;
    entry.grandTotal += amount;
  }

  return [...byDay.values()].sort((a, b) => a.day.localeCompare(b.day));
}
