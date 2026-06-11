import type {
  AvailabilityQueryDTO,
  ReservationCreateInput,
  ReservationUpdateInput,
} from "@/modules/reservations/domain/contracts";
import type {
  AvailabilityResult,
  CancelReservationServiceResult,
  CheckInServiceResult,
  CheckOutServiceResult,
  CreateReservationServiceResult,
  ReservationByIdResult,
  ReservationsListResult,
  UpdateReservationServiceResult,
} from "@/modules/reservations/domain/types";
import type { OffsetPageQueryDTO } from "@/shared/contracts/base";
import { config } from "@/shared/lib/config";
import { fetcher } from "@/shared/lib/fetcher";

export type ReservationDTO = ReservationsListResult["data"][number];

const hotelBase = `${config.apiUrl}/hotel`;

export const reservationsApi = {
  async list(query: OffsetPageQueryDTO) {
    const url = new URL(`${hotelBase}/reservations`);
    url.searchParams.set("limit", String(query.limit ?? 20));
    url.searchParams.set("offset", String(query.offset ?? 0));
    if (query.sort) url.searchParams.set("sort", JSON.stringify(query.sort));
    if (query.filters)
      url.searchParams.set("filters", JSON.stringify(query.filters));
    return fetcher.get<ReservationsListResult>(url.toString());
  },
  async get(id: string) {
    return fetcher.get<ReservationByIdResult>(
      `${hotelBase}/reservations/${id}`,
    );
  },
  async availability(query: AvailabilityQueryDTO) {
    const url = new URL(`${hotelBase}/availability`);
    url.searchParams.set("from", query.from);
    url.searchParams.set("to", query.to);
    return fetcher.get<AvailabilityResult>(url.toString());
  },
  async create(input: ReservationCreateInput) {
    return fetcher.post<CreateReservationServiceResult["created"]>(
      `${hotelBase}/reservations`,
      input,
    );
  },
  async update(id: string, input: ReservationUpdateInput) {
    return fetcher.patch<UpdateReservationServiceResult["updated"]>(
      `${hotelBase}/reservations/${id}`,
      input,
    );
  },
  async cancel(id: string) {
    return fetcher.post<CancelReservationServiceResult["updated"]>(
      `${hotelBase}/reservations/${id}/cancel`,
      {},
    );
  },
  async checkIn(id: string) {
    return fetcher.post<CheckInServiceResult["updated"]>(
      `${hotelBase}/reservations/${id}/check-in`,
      {},
    );
  },
  async checkOut(id: string) {
    return fetcher.post<CheckOutServiceResult["updated"]>(
      `${hotelBase}/reservations/${id}/check-out`,
      {},
    );
  },
};
