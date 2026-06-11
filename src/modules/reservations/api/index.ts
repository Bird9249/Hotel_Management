import { Elysia } from "elysia";
import { requireAuth } from "@/modules/roles/domain/http/middleware";
import { serverContext } from "@/server/platform/http/context";
import { hotelReservationsRoutes } from "../domain/http/reservations.routes";

export const reservationsRoutes = new Elysia().use(
  new Elysia({ prefix: "/hotel" })
    .use(serverContext)
    .onBeforeHandle(requireAuth)
    .use(hotelReservationsRoutes),
);
