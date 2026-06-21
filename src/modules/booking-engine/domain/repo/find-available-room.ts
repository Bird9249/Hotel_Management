import { and, eq, ne } from "drizzle-orm";
import { findOverlapping } from "@/modules/reservations/domain/repo/find-overlapping";
import type { DbClient } from "@/server/platform/db/client";
import { room } from "@/server/platform/db/schema/rooms";
import type { DbTransaction } from "@/shared/types";

export async function findAvailableRoomForRoomType(
  params: {
    roomTypeId: string;
    checkInDate: string;
    checkOutDate: string;
  },
  client: DbTransaction | DbClient,
) {
  const rooms = await client
    .select()
    .from(room)
    .where(
      and(
        eq(room.roomTypeId, params.roomTypeId),
        ne(room.status, "maintenance"),
      ),
    )
    .orderBy(room.roomNumber);

  for (const item of rooms) {
    const overlap = await findOverlapping(
      {
        roomId: item.id,
        checkInDate: params.checkInDate,
        checkOutDate: params.checkOutDate,
      },
      client,
    );
    if (!overlap) return item;
  }

  return null;
}
