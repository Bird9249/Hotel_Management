import type { DbClient } from "@/server/platform/db/client";
import type { DbTransaction } from "@/shared/types";
import {
  queryHkProductivityByShift,
  queryHkProductivityDaily,
} from "../repo/hk-productivity";

export type HkProductivityMode = "daily" | "shift";

export async function getHkProductivity(
  from: string,
  to: string,
  mode: HkProductivityMode,
  client: DbTransaction | DbClient,
) {
  if (mode === "shift") {
    const rows = await queryHkProductivityByShift(from, to, client);
    return {
      mode: "shift" as const,
      rows: rows.map((row) => ({
        shiftId: row.shiftId,
        openedAt: row.openedAt.toISOString(),
        closedAt: row.closedAt?.toISOString() ?? null,
        openedByName: row.openedByName,
        roomsCompleted: row.roomsCompleted,
        roomsPending: row.roomsPending,
        avgMinutesPerRoom: row.avgMinutesPerRoom,
      })),
    };
  }

  const rows = await queryHkProductivityDaily(from, to, client);
  return {
    mode: "daily" as const,
    rows,
  };
}
