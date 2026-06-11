import { Elysia } from "elysia";
import { requireAuth } from "@/modules/roles/domain/http/middleware";
import { serverContext } from "@/server/platform/http/context";
import { hotelRoomsRoutes } from "../domain/http/rooms.routes";

export const roomsRoutes = new Elysia().use(
  new Elysia({ prefix: "/hotel" })
    .use(serverContext)
    .onBeforeHandle(requireAuth)
    .use(hotelRoomsRoutes),
);
