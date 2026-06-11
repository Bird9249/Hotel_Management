import { Elysia } from "elysia";
import { Permissions } from "@/modules/roles/domain/contracts/permissions";
import { requirePermission } from "@/modules/roles/domain/http/middleware";
import { serverContext } from "@/server/platform/http/context";
import { OffsetPageQuerySchema } from "@/shared/contracts/base";
import {
  AvailabilityQuerySchema,
  ReservationCreateSchema,
  ReservationIdParamSchema,
  ReservationUpdateSchema,
} from "../contracts";
import { getReservationById } from "../repo/get-reservation-by-id";
import { listReservations } from "../repo/list-reservations";
import { cancelReservationService } from "../service/cancel-reservation";
import { createReservationService } from "../service/create-reservation";
import { getAvailabilityService } from "../service/get-availability";
import { updateReservationService } from "../service/update-reservation";

export const hotelReservationsRoutes = new Elysia()
  .use(serverContext)
  .get(
    "/availability",
    async ({ db, query, status }) => {
      try {
        return await getAvailabilityService(db, { query });
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        if (message === "INVALID_DATE_RANGE")
          return status(400, { error: "INVALID_DATE_RANGE" });
        return status(500, { error: message });
      }
    },
    {
      beforeHandle: requirePermission(Permissions.reservations.read),
      query: AvailabilityQuerySchema,
    },
  )
  .get("/reservations", async ({ db, query }) => listReservations(query, db), {
    beforeHandle: requirePermission(Permissions.reservations.read),
    query: OffsetPageQuerySchema,
  })
  .get(
    "/reservations/:id",
    async ({ db, params, status }) => {
      const item = await getReservationById(params.id, db);
      if (!item) return status(404, { error: "NOT_FOUND" });
      return item;
    },
    {
      beforeHandle: requirePermission(Permissions.reservations.read),
      params: ReservationIdParamSchema,
    },
  )
  .post(
    "/reservations",
    async ({ db, body, status }) => {
      try {
        const out = await createReservationService(db, { input: body });
        return status(201, out.created);
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        if (message === "ROOM_NOT_AVAILABLE")
          return status(409, { error: "ROOM_NOT_AVAILABLE" });
        if (message === "Guest not found" || message === "Room not found")
          return status(404, { error: "NOT_FOUND" });
        return status(500, { error: message });
      }
    },
    {
      beforeHandle: requirePermission(Permissions.reservations.create),
      body: ReservationCreateSchema,
    },
  )
  .patch(
    "/reservations/:id",
    async ({ db, params, body, status }) => {
      try {
        const { updated } = await updateReservationService(db, {
          id: params.id,
          input: body,
        });
        return updated;
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        if (message === "ROOM_NOT_AVAILABLE")
          return status(409, { error: "ROOM_NOT_AVAILABLE" });
        if (
          message === "Reservation not found" ||
          message === "Guest not found" ||
          message === "Room not found"
        )
          return status(404, { error: "NOT_FOUND" });
        if (message === "RESERVATION_NOT_EDITABLE")
          return status(409, { error: "RESERVATION_NOT_EDITABLE" });
        return status(500, { error: message });
      }
    },
    {
      beforeHandle: requirePermission(Permissions.reservations.update),
      params: ReservationIdParamSchema,
      body: ReservationUpdateSchema,
    },
  )
  .post(
    "/reservations/:id/cancel",
    async ({ db, params, status }) => {
      try {
        const { updated } = await cancelReservationService(db, {
          id: params.id,
        });
        return updated;
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        if (message === "Reservation not found")
          return status(404, { error: "NOT_FOUND" });
        if (message === "ALREADY_CANCELLED")
          return status(409, { error: "ALREADY_CANCELLED" });
        if (message === "CANNOT_CANCEL_CHECKED_OUT")
          return status(409, { error: "CANNOT_CANCEL_CHECKED_OUT" });
        return status(500, { error: message });
      }
    },
    {
      beforeHandle: requirePermission(Permissions.reservations.cancel),
      params: ReservationIdParamSchema,
    },
  );
