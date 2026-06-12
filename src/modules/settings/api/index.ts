import { Elysia } from "elysia";
import { requireAuth } from "@/modules/roles/domain/http/middleware";
import { serverContext } from "@/server/platform/http/context";
import { hotelSettingsRoutes } from "../domain/http/settings.routes";

export const settingsRoutes = new Elysia().use(
  new Elysia({ prefix: "/hotel/settings" })
    .use(serverContext)
    .onBeforeHandle(requireAuth)
    .use(hotelSettingsRoutes),
);
