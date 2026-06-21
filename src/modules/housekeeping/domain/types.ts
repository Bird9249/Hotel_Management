import type { listHkShifts } from "./repo/list-shifts";
import type { closeHkShiftService } from "./service/close-shift";
import type { updateHkTaskService } from "./service/complete-task";
import type { getCurrentHkShiftService } from "./service/get-current-shift";
import type { listHkTasksService } from "./service/list-tasks";
import type { openHkShiftService } from "./service/open-shift";

export type CurrentHkShiftResult = Awaited<
  ReturnType<typeof getCurrentHkShiftService>
>;
export type OpenHkShiftResult = Awaited<ReturnType<typeof openHkShiftService>>;
export type CloseHkShiftResult = Awaited<
  ReturnType<typeof closeHkShiftService>
>;
export type HkTasksResult = Awaited<ReturnType<typeof listHkTasksService>>;
export type HkTaskDTO = HkTasksResult["tasks"][number];
export type UpdateHkTaskResult = Awaited<
  ReturnType<typeof updateHkTaskService>
>;
export type HkShiftsListResult = Awaited<ReturnType<typeof listHkShifts>>;
export type HkShiftDTO = HkShiftsListResult["data"][number];
