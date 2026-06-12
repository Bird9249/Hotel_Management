import type { DbClient } from "@/server/platform/db/client";
import type { DbTransaction } from "@/shared/types";
import { querySalesByShift } from "../repo/sales-by-shift";

export async function getSalesByShift(
  from: string,
  to: string,
  client: DbTransaction | DbClient,
) {
  const rows = await querySalesByShift(from, to, client);

  const byShift = new Map<
    string,
    {
      shiftId: string;
      status: string;
      openedByName: string;
      openedAt: string;
      closedAt: string | null;
      totalsByMethod: Record<string, number>;
      grandTotal: number;
    }
  >();

  for (const row of rows) {
    let entry = byShift.get(row.shiftId);
    if (!entry) {
      entry = {
        shiftId: row.shiftId,
        status: row.status,
        openedByName: row.openedByName,
        openedAt: row.openedAt.toISOString(),
        closedAt: row.closedAt?.toISOString() ?? null,
        totalsByMethod: {},
        grandTotal: 0,
      };
      byShift.set(row.shiftId, entry);
    }

    if (row.method && row.total != null) {
      const amount = Number(row.total);
      entry.totalsByMethod[row.method] =
        (entry.totalsByMethod[row.method] ?? 0) + amount;
      entry.grandTotal += amount;
    }
  }

  return [...byShift.values()].sort((a, b) =>
    b.openedAt.localeCompare(a.openedAt),
  );
}
