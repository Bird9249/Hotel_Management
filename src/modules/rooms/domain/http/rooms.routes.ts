import { Elysia } from "elysia";
import { requirePermission } from "@/modules/roles/domain/http/middleware";
import { Permissions } from "@/modules/roles/domain/contracts/permissions";
import { serverContext } from "@/server/platform/http/context";
import type { FilterConditionDTO } from "@/shared/contracts/base";
import { OffsetPageQuerySchema } from "@/shared/contracts/base";
import {
  RoomCreateSchema,
  RoomIdParamSchema,
  RoomStatusUpdateSchema,
  RoomTypeCreateSchema,
  RoomTypeIdParamSchema,
  RoomTypeLookupQuerySchema,
  RoomTypeUpdateSchema,
  RoomUpdateSchema,
} from "../contracts";
import { getRoomById } from "../repo/get-room-by-id";
import { getRoomTypeById } from "../repo/get-room-type-by-id";
import { listRoomTypes } from "../repo/list-room-types";
import { listRooms } from "../repo/list-rooms";
import { createRoomService } from "../service/create-room";
import { createRoomTypeService } from "../service/create-room-type";
import { deleteRoomService } from "../service/delete-room";
import { deleteRoomTypeService } from "../service/delete-room-type";
import { setRoomStatusService } from "../service/set-room-status";
import { updateRoomService } from "../service/update-room";
import { updateRoomTypeService } from "../service/update-room-type";

export const hotelRoomsRoutes = new Elysia()
  .use(serverContext)
  .get(
    "/room-types",
    async ({ db, query }) => listRoomTypes(query, db),
    {
      beforeHandle: requirePermission(Permissions.rooms.read),
      query: OffsetPageQuerySchema,
    },
  )
  .get(
    "/room-types/lookup",
    async ({ db, query }) => {
      const { q, limit, skip } = query as {
        q?: string;
        limit: number;
        skip: number;
      };
      const filters: FilterConditionDTO[] | undefined = q
        ? [{ field: "name", op: "contains" as const, value: q }]
        : undefined;
      const result = await listRoomTypes(
        { limit, offset: skip, filters },
        db,
      );
      const items = result.data.map((r) => ({ id: r.id, name: r.name }));
      return { items, total: result.meta.total };
    },
    {
      beforeHandle: requirePermission(Permissions.rooms.read),
      query: RoomTypeLookupQuerySchema,
    },
  )
  .get(
    "/room-types/lookup/:id",
    async ({ db, params }) => {
      const item = await getRoomTypeById(params.id, db);
      if (!item) return { item: null };
      return { item: { id: item.id, name: item.name } };
    },
    { beforeHandle: requirePermission(Permissions.rooms.read) },
  )
  .get(
    "/room-types/:id",
    async ({ db, params, status }) => {
      const item = await getRoomTypeById(params.id, db);
      if (!item) return status(404, { error: "NOT_FOUND" });
      return item;
    },
    {
      beforeHandle: requirePermission(Permissions.rooms.read),
      params: RoomTypeIdParamSchema,
    },
  )
  .post(
    "/room-types",
    async ({ db, body, status }) => {
      try {
        const out = await createRoomTypeService(db, { input: body });
        return status(201, out.created);
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        return status(500, { error: message });
      }
    },
    {
      beforeHandle: requirePermission(Permissions.rooms.create),
      body: RoomTypeCreateSchema,
    },
  )
  .patch(
    "/room-types/:id",
    async ({ db, params, body, status }) => {
      try {
        const { updated } = await updateRoomTypeService(db, {
          id: params.id,
          input: body,
        });
        return updated;
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        if (message === "Room type not found")
          return status(404, { error: "NOT_FOUND" });
        return status(500, { error: message });
      }
    },
    {
      beforeHandle: requirePermission(Permissions.rooms.update),
      params: RoomTypeIdParamSchema,
      body: RoomTypeUpdateSchema,
    },
  )
  .delete(
    "/room-types/:id",
    async ({ db, params, status }) => {
      try {
        const { deleted } = await deleteRoomTypeService(db, { id: params.id });
        return deleted;
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        if (message === "Room type not found")
          return status(404, { error: "NOT_FOUND" });
        if (message === "ROOM_TYPE_IN_USE")
          return status(409, { error: "ROOM_TYPE_IN_USE" });
        return status(500, { error: message });
      }
    },
    {
      beforeHandle: requirePermission(Permissions.rooms.delete),
      params: RoomTypeIdParamSchema,
    },
  )
  .get(
    "/rooms",
    async ({ db, query }) => listRooms(query, db),
    {
      beforeHandle: requirePermission(Permissions.rooms.read),
      query: OffsetPageQuerySchema,
    },
  )
  .get(
    "/rooms/:id",
    async ({ db, params, status }) => {
      const item = await getRoomById(params.id, db);
      if (!item) return status(404, { error: "NOT_FOUND" });
      return item;
    },
    {
      beforeHandle: requirePermission(Permissions.rooms.read),
      params: RoomIdParamSchema,
    },
  )
  .post(
    "/rooms",
    async ({ db, body, status }) => {
      try {
        const out = await createRoomService(db, { input: body });
        return status(201, out.created);
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        if (message === "Room type not found")
          return status(404, { error: "ROOM_TYPE_NOT_FOUND" });
        if (message.includes("unique"))
          return status(409, { error: "ROOM_NUMBER_EXISTS" });
        return status(500, { error: message });
      }
    },
    {
      beforeHandle: requirePermission(Permissions.rooms.create),
      body: RoomCreateSchema,
    },
  )
  .patch(
    "/rooms/:id",
    async ({ db, params, body, status }) => {
      try {
        const { updated } = await updateRoomService(db, {
          id: params.id,
          input: body,
        });
        return updated;
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        if (message === "Room not found" || message === "Room type not found")
          return status(404, { error: "NOT_FOUND" });
        if (message.includes("unique"))
          return status(409, { error: "ROOM_NUMBER_EXISTS" });
        return status(500, { error: message });
      }
    },
    {
      beforeHandle: requirePermission(Permissions.rooms.update),
      params: RoomIdParamSchema,
      body: RoomUpdateSchema,
    },
  )
  .patch(
    "/rooms/:id/status",
    async ({ db, params, body, status }) => {
      try {
        const { updated } = await setRoomStatusService(db, {
          id: params.id,
          input: body,
        });
        return updated;
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        if (message === "Room not found")
          return status(404, { error: "NOT_FOUND" });
        return status(500, { error: message });
      }
    },
    {
      beforeHandle: requirePermission(Permissions.rooms.status),
      params: RoomIdParamSchema,
      body: RoomStatusUpdateSchema,
    },
  )
  .delete(
    "/rooms/:id",
    async ({ db, params, status }) => {
      try {
        const { deleted } = await deleteRoomService(db, { id: params.id });
        return deleted;
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        if (message === "Room not found")
          return status(404, { error: "NOT_FOUND" });
        return status(500, { error: message });
      }
    },
    {
      beforeHandle: requirePermission(Permissions.rooms.delete),
      params: RoomIdParamSchema,
    },
  );
