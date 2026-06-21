import { findOverlapping } from "@/modules/reservations/domain/repo/find-overlapping";
import { getRoomById } from "@/modules/rooms/domain/repo/get-room-by-id";
import type { DbTransaction } from "@/shared/types";
import { listRoomTypeAvailability } from "../repo/list-room-type-availability";

export async function reserveInventoryService(
  client: DbTransaction,
  params: {
    roomId: string;
    checkInDate: string;
    checkOutDate: string;
    excludeReservationId?: string;
  },
) {
  const room = await getRoomById(params.roomId, client);
  if (!room) throw new Error("Room not found");

  const overlap = await findOverlapping(
    {
      roomId: params.roomId,
      checkInDate: params.checkInDate,
      checkOutDate: params.checkOutDate,
      excludeId: params.excludeReservationId,
    },
    client,
  );
  if (overlap) throw new Error("ROOM_NOT_AVAILABLE");

  const [availability] = await listRoomTypeAvailability(
    {
      from: params.checkInDate,
      to: params.checkOutDate,
      roomTypeId: room.roomTypeId,
      excludeReservationId: params.excludeReservationId,
    },
    client,
  );

  if (!availability || availability.availableRooms < 1) {
    throw new Error("ROOM_NOT_AVAILABLE");
  }

  return { room, availability };
}
