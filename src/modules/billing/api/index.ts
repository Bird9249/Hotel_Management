import { Elysia } from "elysia";
import { requireAuth } from "@/modules/roles/domain/http/middleware";
import { serverContext } from "@/server/platform/http/context";
import { hotelBillingRoutes } from "../domain/http/billing.routes";

export const billingRoutes = new Elysia().use(
  new Elysia({ prefix: "/hotel" })
    .use(serverContext)
    .onBeforeHandle(requireAuth)
    .use(hotelBillingRoutes),
);
