import { Elysia } from "elysia";
import { auditRoutes } from "@/modules/audit/api";
import { authRoutes } from "@/modules/auth/api";
import { guestsRoutes } from "@/modules/guests/api";
import { reservationsRoutes } from "@/modules/reservations/api";
import { rolesRoutes } from "@/modules/roles/api";
import { roomsRoutes } from "@/modules/rooms/api";
import { uploadRoutes } from "@/modules/upload/api";
import { usersRoutes } from "@/modules/users/api";

export function createRestRoutes() {
  return new Elysia()
    .use(authRoutes)
    .use(usersRoutes)
    .use(rolesRoutes)
    .use(roomsRoutes)
    .use(guestsRoutes)
    .use(reservationsRoutes)
    .use(auditRoutes)
    .use(uploadRoutes);
}
