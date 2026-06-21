import { Elysia } from "elysia";
import { Permissions } from "@/modules/roles/domain/contracts/permissions";
import { requirePermission } from "@/modules/roles/domain/http/middleware";
import { runInTransaction } from "@/server/platform/db/transaction";
import { serverContext } from "@/server/platform/http/context";
import { OffsetPageQuerySchema } from "@/shared/contracts/base";
import {
  CloseHkShiftSchema,
  HkShiftIdParamSchema,
  HkTaskIdParamSchema,
  HkTaskUpdateSchema,
  OpenHkShiftSchema,
} from "../contracts";
import { listHkShifts } from "../repo/list-shifts";
import { closeHkShiftService } from "../service/close-shift";
import { updateHkTaskService } from "../service/complete-task";
import { getCurrentHkShiftService } from "../service/get-current-shift";
import { listHkTasksService } from "../service/list-tasks";
import { openHkShiftService } from "../service/open-shift";

export const hotelHousekeepingRoutes = new Elysia()
  .use(serverContext)
  .get(
    "/housekeeping/shifts/current",
    async ({ db, user, status }) => {
      if (!user?.id) return status(401, { error: "UNAUTHORIZED" });
      const result = await getCurrentHkShiftService(db, { userId: user.id });
      if (result === null) {
        return new Response(JSON.stringify(null), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      return result;
    },
    {
      beforeHandle: requirePermission(Permissions.housekeeping.read),
    },
  )
  .post(
    "/housekeeping/shifts/open",
    async ({ db, user, status }) => {
      if (!user?.id) return status(401, { error: "UNAUTHORIZED" });
      try {
        const out = await runInTransaction(db, (tx) =>
          openHkShiftService(tx, { userId: user.id }),
        );
        return status(201, out);
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        if (message === "SHIFT_ALREADY_OPEN") {
          return status(409, { error: message });
        }
        return status(500, { error: message });
      }
    },
    {
      beforeHandle: requirePermission(Permissions.housekeeping.shift),
      body: OpenHkShiftSchema,
    },
  )
  .post(
    "/housekeeping/shifts/:id/close",
    async ({ db, params, body, status, user, permissions }) => {
      if (!user?.id) return status(401, { error: "UNAUTHORIZED" });
      try {
        const canCloseAnyShift = permissions.includes(Permissions.users.read);
        const out = await runInTransaction(db, (tx) =>
          closeHkShiftService(tx, {
            shiftId: params.id,
            input: body,
            userId: user.id,
            canCloseAnyShift,
          }),
        );
        return out;
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        if (message === "SHIFT_NOT_FOUND")
          return status(404, { error: "NOT_FOUND" });
        if (message === "SHIFT_NOT_OPEN" || message === "SHIFT_NOT_OWNER")
          return status(409, { error: message });
        return status(500, { error: message });
      }
    },
    {
      beforeHandle: requirePermission(Permissions.housekeeping.shift),
      params: HkShiftIdParamSchema,
      body: CloseHkShiftSchema,
    },
  )
  .get(
    "/housekeeping/shifts",
    async ({ db, query }) => listHkShifts(query, db),
    {
      beforeHandle: requirePermission(Permissions.housekeeping.read),
      query: OffsetPageQuerySchema,
    },
  )
  .get(
    "/housekeeping/tasks",
    async ({ db, user, status }) => {
      if (!user?.id) return status(401, { error: "UNAUTHORIZED" });
      return runInTransaction(db, (tx) =>
        listHkTasksService(tx, { userId: user.id }),
      );
    },
    {
      beforeHandle: requirePermission(Permissions.housekeeping.read),
    },
  )
  .patch(
    "/housekeeping/tasks/:id",
    async ({ db, params, body, user, status }) => {
      if (!user?.id) return status(401, { error: "UNAUTHORIZED" });
      try {
        const { updated } = await runInTransaction(db, (tx) =>
          updateHkTaskService(tx, {
            id: params.id,
            input: body,
            userId: user.id,
          }),
        );
        return updated;
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        if (message === "TASK_NOT_FOUND") {
          return status(404, { error: "NOT_FOUND" });
        }
        return status(500, { error: message });
      }
    },
    {
      beforeHandle: requirePermission(Permissions.housekeeping.task),
      params: HkTaskIdParamSchema,
      body: HkTaskUpdateSchema,
    },
  );
