import { Elysia } from "elysia";
import { publicBillingRoutes } from "../domain/http/public-billing.routes";

/** Public billing endpoints — ไม่ต้อง login */
export const billingPublicRoutes = new Elysia().use(
  new Elysia({ prefix: "/public" }).use(publicBillingRoutes),
);
