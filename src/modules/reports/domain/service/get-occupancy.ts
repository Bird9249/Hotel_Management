import type { DbClient } from "@/server/platform/db/client";
import type { DbTransaction } from "@/shared/types";
import { queryOccupancy } from "../repo/occupancy";

export async function getOccupancy(
  from: string,
  to: string,
  client: DbTransaction | DbClient,
) {
  const rows = await queryOccupancy(from, to, client);

  return rows.map((row) => {
    const totalRooms = Number(row.total_rooms);
    const occupiedRooms = Number(row.occupied_rooms);
    const rate = totalRooms > 0 ? occupiedRooms / totalRooms : 0;
    return {
      day: row.day,
      occupiedRooms,
      totalRooms,
      rate,
    };
  });
}
