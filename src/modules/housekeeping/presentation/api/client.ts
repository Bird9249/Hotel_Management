import type {
  CloseHkShiftInput,
  HkTaskUpdateInput,
  OpenHkShiftInput,
} from "@/modules/housekeeping/domain/contracts";
import type {
  CloseHkShiftResult,
  CurrentHkShiftResult,
  HkShiftsListResult,
  HkTasksResult,
  OpenHkShiftResult,
  UpdateHkTaskResult,
} from "@/modules/housekeeping/domain/types";
import type { OffsetPageQueryDTO } from "@/shared/contracts/base";
import { config } from "@/shared/lib/config";
import { fetcher } from "@/shared/lib/fetcher";

const hotelBase = `${config.apiUrl}/hotel`;

export const housekeepingApi = {
  async getCurrentShift() {
    return fetcher.get<CurrentHkShiftResult | null>(
      `${hotelBase}/housekeeping/shifts/current`,
    );
  },
  async openShift(input: OpenHkShiftInput = {}) {
    return fetcher.post<OpenHkShiftResult>(
      `${hotelBase}/housekeeping/shifts/open`,
      input,
    );
  },
  async closeShift(id: string, input: CloseHkShiftInput) {
    return fetcher.post<CloseHkShiftResult>(
      `${hotelBase}/housekeeping/shifts/${id}/close`,
      input,
    );
  },
  async listShifts(query: OffsetPageQueryDTO) {
    const url = new URL(`${hotelBase}/housekeeping/shifts`);
    url.searchParams.set("limit", String(query.limit ?? 20));
    url.searchParams.set("offset", String(query.offset ?? 0));
    if (query.sort) url.searchParams.set("sort", JSON.stringify(query.sort));
    if (query.filters)
      url.searchParams.set("filters", JSON.stringify(query.filters));
    return fetcher.get<HkShiftsListResult>(url.toString());
  },
  async listTasks() {
    return fetcher.get<HkTasksResult>(`${hotelBase}/housekeeping/tasks`);
  },
  async updateTask(id: string, input: HkTaskUpdateInput) {
    return fetcher.patch<UpdateHkTaskResult["updated"]>(
      `${hotelBase}/housekeeping/tasks/${id}`,
      input,
    );
  },
};
