import { sql } from "drizzle-orm";
import type { DbClient } from "@/server/platform/db/client";
import type { DbTransaction } from "@/shared/types";
import { toExclusiveEnd } from "../lib/date-range";

type OccupancyRow = {
  day: string;
  occupied_rooms: number;
  total_rooms: number;
};

export async function queryOccupancy(
  from: string,
  inclusiveTo: string,
  client: DbTransaction | DbClient,
) {
  const exclusiveTo = toExclusiveEnd(inclusiveTo);

  const result = await client.execute<OccupancyRow>(sql`
    WITH days AS (
      SELECT generate_series(
        ${from}::date,
        (${exclusiveTo}::date - interval '1 day')::date,
        interval '1 day'
      )::date AS day
    ),
    total_rooms AS (
      SELECT COUNT(*)::int AS cnt FROM room WHERE status <> 'maintenance'
    )
    SELECT
      d.day::text AS day,
      COUNT(DISTINCT r.room_id)::int AS occupied_rooms,
      tr.cnt AS total_rooms
    FROM days d
    CROSS JOIN total_rooms tr
    LEFT JOIN reservation r ON
      r.status IN ('checked_in', 'checked_out', 'booked')
      AND r.check_in_date <= d.day
      AND r.check_out_date > d.day
    GROUP BY d.day, tr.cnt
    ORDER BY d.day
  `);

  return result.rows ?? result;
}
