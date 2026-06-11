import type { getRoomById } from "./repo/get-room-by-id";
import type { getRoomTypeById } from "./repo/get-room-type-by-id";
import type { listRoomTypes } from "./repo/list-room-types";
import type { listRooms } from "./repo/list-rooms";
import type { createRoomService } from "./service/create-room";
import type { createRoomTypeService } from "./service/create-room-type";
import type { deleteRoomService } from "./service/delete-room";
import type { deleteRoomTypeService } from "./service/delete-room-type";
import type { setRoomStatusService } from "./service/set-room-status";
import type { updateRoomService } from "./service/update-room";
import type { updateRoomTypeService } from "./service/update-room-type";

export type RoomTypesListResult = Awaited<ReturnType<typeof listRoomTypes>>;
export type RoomTypeByIdResult = Awaited<ReturnType<typeof getRoomTypeById>>;
export type RoomsListResult = Awaited<ReturnType<typeof listRooms>>;
export type RoomByIdResult = Awaited<ReturnType<typeof getRoomById>>;

export type CreateRoomTypeServiceResult = Awaited<
  ReturnType<typeof createRoomTypeService>
>;
export type UpdateRoomTypeServiceResult = Awaited<
  ReturnType<typeof updateRoomTypeService>
>;
export type DeleteRoomTypeServiceResult = Awaited<
  ReturnType<typeof deleteRoomTypeService>
>;
export type CreateRoomServiceResult = Awaited<
  ReturnType<typeof createRoomService>
>;
export type UpdateRoomServiceResult = Awaited<
  ReturnType<typeof updateRoomService>
>;
export type DeleteRoomServiceResult = Awaited<
  ReturnType<typeof deleteRoomService>
>;
export type SetRoomStatusServiceResult = Awaited<
  ReturnType<typeof setRoomStatusService>
>;
