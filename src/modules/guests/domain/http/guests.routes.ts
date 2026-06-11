import { Elysia } from "elysia";
import { Permissions } from "@/modules/roles/domain/contracts/permissions";
import { requirePermission } from "@/modules/roles/domain/http/middleware";
import { serverContext } from "@/server/platform/http/context";
import type { FilterConditionDTO } from "@/shared/contracts/base";
import { OffsetPageQuerySchema } from "@/shared/contracts/base";
import {
  GuestCreateSchema,
  GuestIdParamSchema,
  GuestLookupQuerySchema,
  GuestUpdateSchema,
} from "../contracts";
import { getGuestById } from "../repo/get-guest-by-id";
import { listGuests } from "../repo/list-guests";
import { createGuestService } from "../service/create-guest";
import { deleteGuestService } from "../service/delete-guest";
import { updateGuestService } from "../service/update-guest";

export const hotelGuestsRoutes = new Elysia()
  .use(serverContext)
  .get("/guests", async ({ db, query }) => listGuests(query, db), {
    beforeHandle: requirePermission(Permissions.guests.read),
    query: OffsetPageQuerySchema,
  })
  .get(
    "/guests/lookup",
    async ({ db, query }) => {
      const { q, limit, skip } = query as {
        q?: string;
        limit: number;
        skip: number;
      };
      const filters: FilterConditionDTO[] | undefined = q
        ? [{ field: "fullName", op: "contains" as const, value: q }]
        : undefined;
      const result = await listGuests({ limit, offset: skip, filters }, db);
      const items = result.data.map((r) => ({
        id: r.id,
        name: r.fullName,
      }));
      return { items, total: result.meta.total };
    },
    {
      beforeHandle: requirePermission(Permissions.guests.read),
      query: GuestLookupQuerySchema,
    },
  )
  .get(
    "/guests/lookup/:id",
    async ({ db, params }) => {
      const item = await getGuestById(params.id, db);
      if (!item) return { item: null };
      return { item: { id: item.id, name: item.fullName } };
    },
    { beforeHandle: requirePermission(Permissions.guests.read) },
  )
  .get(
    "/guests/:id",
    async ({ db, params, status }) => {
      const item = await getGuestById(params.id, db);
      if (!item) return status(404, { error: "NOT_FOUND" });
      return item;
    },
    {
      beforeHandle: requirePermission(Permissions.guests.read),
      params: GuestIdParamSchema,
    },
  )
  .post(
    "/guests",
    async ({ db, body, status }) => {
      try {
        const out = await createGuestService(db, { input: body });
        return status(201, out.created);
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        return status(500, { error: message });
      }
    },
    {
      beforeHandle: requirePermission(Permissions.guests.create),
      body: GuestCreateSchema,
    },
  )
  .patch(
    "/guests/:id",
    async ({ db, params, body, status }) => {
      try {
        const { updated } = await updateGuestService(db, {
          id: params.id,
          input: body,
        });
        return updated;
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        if (message === "Guest not found")
          return status(404, { error: "NOT_FOUND" });
        return status(500, { error: message });
      }
    },
    {
      beforeHandle: requirePermission(Permissions.guests.update),
      params: GuestIdParamSchema,
      body: GuestUpdateSchema,
    },
  )
  .delete(
    "/guests/:id",
    async ({ db, params, status }) => {
      try {
        const { deleted } = await deleteGuestService(db, { id: params.id });
        return deleted;
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        if (message === "Guest not found")
          return status(404, { error: "NOT_FOUND" });
        return status(500, { error: message });
      }
    },
    {
      beforeHandle: requirePermission(Permissions.guests.delete),
      params: GuestIdParamSchema,
    },
  );
