import { Elysia } from "elysia";
import { requireAuth } from "@/modules/roles/domain/http/middleware";
import { serverContext } from "@/server/platform/http/context";
import { hotelChannelsRoutes } from "../domain/http/channels.routes";

export const channelsRoutes = new Elysia().use(
  new Elysia({ prefix: "/hotel" })
    .use(serverContext)
    .onBeforeHandle(requireAuth)
    .use(hotelChannelsRoutes),
);
