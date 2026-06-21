import { Elysia } from "elysia";
import { publicBookingRoutes } from "../domain/http/public.routes";

/** Public booking endpoints — ไม่ต้อง login */
export const bookingEnginePublicRoutes = new Elysia().use(
  new Elysia({ prefix: "/public" }).use(publicBookingRoutes),
);
