import type {
  GuestCreateInput,
  GuestUpdateInput,
} from "@/modules/guests/domain/contracts";
import type {
  CreateGuestServiceResult,
  DeleteGuestServiceResult,
  GuestByIdResult,
  GuestsListResult,
  UpdateGuestServiceResult,
} from "@/modules/guests/domain/types";
import type { OffsetPageQueryDTO } from "@/shared/contracts/base";
import { config } from "@/shared/lib/config";
import { fetcher } from "@/shared/lib/fetcher";
import { fetchLookup, hydrateLookupItem } from "@/shared/lib/utils";

export type GuestDTO = GuestsListResult["data"][number];

const hotelBase = `${config.apiUrl}/hotel`;

export const guestsApi = {
  async list(query: OffsetPageQueryDTO) {
    const url = new URL(`${hotelBase}/guests`);
    url.searchParams.set("limit", String(query.limit ?? 20));
    url.searchParams.set("offset", String(query.offset ?? 0));
    if (query.sort) url.searchParams.set("sort", JSON.stringify(query.sort));
    if (query.filters)
      url.searchParams.set("filters", JSON.stringify(query.filters));
    return fetcher.get<GuestsListResult>(url.toString());
  },
  async get(id: string) {
    return fetcher.get<GuestByIdResult>(`${hotelBase}/guests/${id}`);
  },
  async create(input: GuestCreateInput) {
    return fetcher.post<CreateGuestServiceResult["created"]>(
      `${hotelBase}/guests`,
      input,
    );
  },
  async update(id: string, input: GuestUpdateInput) {
    return fetcher.patch<UpdateGuestServiceResult["updated"]>(
      `${hotelBase}/guests/${id}`,
      input,
    );
  },
  async remove(id: string) {
    return fetcher.delete<DeleteGuestServiceResult["deleted"]>(
      `${hotelBase}/guests/${id}`,
    );
  },
  async lookup(params: {
    query: string;
    cursor?: string | null;
    pageSize: number;
  }) {
    return fetchLookup(`${hotelBase}/guests/lookup`, params);
  },
  async hydrate(id: string) {
    return hydrateLookupItem(`${hotelBase}/guests/lookup`, id);
  },
};
