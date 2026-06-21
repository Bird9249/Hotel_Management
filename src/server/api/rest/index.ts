import { Elysia } from "elysia";
import { auditRoutes } from "@/modules/audit/api";
import { authRoutes } from "@/modules/auth/api";
import { billingRoutes } from "@/modules/billing/api";
import { billingPublicRoutes } from "@/modules/billing/api/public";
import { bookingEnginePublicRoutes } from "@/modules/booking-engine/api";
import { channelsRoutes } from "@/modules/channels/api";
import { channelsWebhookRoutes } from "@/modules/channels/api/webhooks";
import { guestsRoutes } from "@/modules/guests/api";
import { housekeepingRoutes } from "@/modules/housekeeping/api";
import { reportsRoutes } from "@/modules/reports/api";
import { reservationsRoutes } from "@/modules/reservations/api";
import { rolesRoutes } from "@/modules/roles/api";
import { roomsRoutes } from "@/modules/rooms/api";
import { settingsRoutes } from "@/modules/settings/api";
import { uploadRoutes } from "@/modules/upload/api";
import { usersRoutes } from "@/modules/users/api";

export function createRestRoutes() {
  return new Elysia()
    .use(authRoutes)
    .use(usersRoutes)
    .use(rolesRoutes)
    .use(roomsRoutes)
    .use(channelsRoutes)
    .use(channelsWebhookRoutes)
    .use(guestsRoutes)
    .use(housekeepingRoutes)
    .use(reservationsRoutes)
    .use(billingRoutes)
    .use(billingPublicRoutes)
    .use(bookingEnginePublicRoutes)
    .use(reportsRoutes)
    .use(settingsRoutes)
    .use(auditRoutes)
    .use(uploadRoutes);
}
