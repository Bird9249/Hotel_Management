import type {
  RoomCreateInput,
  RoomStatusUpdateInput,
  RoomTypeCreateInput,
  RoomTypeUpdateInput,
  RoomUpdateInput,
} from "@/modules/rooms/domain/contracts";
import type {
  CreateRoomServiceResult,
  CreateRoomTypeServiceResult,
  DeleteRoomServiceResult,
  DeleteRoomTypeServiceResult,
  RoomByIdResult,
  RoomTypeByIdResult,
  RoomsListResult,
  RoomTypesListResult,
  SetRoomStatusServiceResult,
  UpdateRoomServiceResult,
  UpdateRoomTypeServiceResult,
} from "@/modules/rooms/domain/types";
import type { OffsetPageQueryDTO } from "@/shared/contracts/base";
import { config } from "@/shared/lib/config";
import { fetcher } from "@/shared/lib/fetcher";
import { fetchLookup, hydrateLookupItem } from "@/shared/lib/utils";

export type RoomTypeDTO = RoomTypesListResult["data"][number];
export type RoomDTO = RoomsListResult["data"][number];

const hotelBase = `${config.apiUrl}/hotel`;

export const roomTypesApi = {
  async list(query: OffsetPageQueryDTO) {
    const url = new URL(`${hotelBase}/room-types`);
    url.searchParams.set("limit", String(query.limit ?? 20));
    url.searchParams.set("offset", String(query.offset ?? 0));
    if (query.sort) url.searchParams.set("sort", JSON.stringify(query.sort));
    if (query.filters)
      url.searchParams.set("filters", JSON.stringify(query.filters));
    return fetcher.get<RoomTypesListResult>(url.toString());
  },
  async get(id: string) {
    return fetcher.get<RoomTypeByIdResult>(`${hotelBase}/room-types/${id}`);
  },
  async create(input: RoomTypeCreateInput) {
    return fetcher.post<CreateRoomTypeServiceResult["created"]>(
      `${hotelBase}/room-types`,
      input,
    );
  },
  async update(id: string, input: RoomTypeUpdateInput) {
    return fetcher.patch<UpdateRoomTypeServiceResult["updated"]>(
      `${hotelBase}/room-types/${id}`,
      input,
    );
  },
  async remove(id: string) {
    return fetcher.delete<DeleteRoomTypeServiceResult["deleted"]>(
      `${hotelBase}/room-types/${id}`,
    );
  },
  async lookup(params: {
    query: string;
    cursor?: string | null;
    pageSize: number;
  }) {
    return fetchLookup(`${hotelBase}/room-types/lookup`, params);
  },
  async hydrate(id: string) {
    return hydrateLookupItem(`${hotelBase}/room-types/lookup`, id);
  },
};

export const roomsApi = {
  async list(query: OffsetPageQueryDTO) {
    const url = new URL(`${hotelBase}/rooms`);
    url.searchParams.set("limit", String(query.limit ?? 20));
    url.searchParams.set("offset", String(query.offset ?? 0));
    if (query.sort) url.searchParams.set("sort", JSON.stringify(query.sort));
    if (query.filters)
      url.searchParams.set("filters", JSON.stringify(query.filters));
    return fetcher.get<RoomsListResult>(url.toString());
  },
  async get(id: string) {
    return fetcher.get<RoomByIdResult>(`${hotelBase}/rooms/${id}`);
  },
  async create(input: RoomCreateInput) {
    return fetcher.post<CreateRoomServiceResult["created"]>(
      `${hotelBase}/rooms`,
      input,
    );
  },
  async update(id: string, input: RoomUpdateInput) {
    return fetcher.patch<UpdateRoomServiceResult["updated"]>(
      `${hotelBase}/rooms/${id}`,
      input,
    );
  },
  async setStatus(id: string, input: RoomStatusUpdateInput) {
    return fetcher.patch<SetRoomStatusServiceResult["updated"]>(
      `${hotelBase}/rooms/${id}/status`,
      input,
    );
  },
  async remove(id: string) {
    return fetcher.delete<DeleteRoomServiceResult["deleted"]>(
      `${hotelBase}/rooms/${id}`,
    );
  },
};
