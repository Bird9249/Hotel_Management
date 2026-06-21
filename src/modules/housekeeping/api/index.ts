import { Elysia } from "elysia";
import { requireAuth } from "@/modules/roles/domain/http/middleware";
import { serverContext } from "@/server/platform/http/context";
import { hotelHousekeepingRoutes } from "../domain/http/housekeeping.routes";

export const housekeepingRoutes = new Elysia().use(
  new Elysia({ prefix: "/hotel" })
    .use(serverContext)
    .onBeforeHandle(requireAuth)
    .use(hotelHousekeepingRoutes),
);
