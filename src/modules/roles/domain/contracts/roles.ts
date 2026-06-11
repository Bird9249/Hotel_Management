import { ALL_PERMISSIONS, type PermissionId } from "./permissions";

export const Roles: Record<string, PermissionId[]> = {
  admin: ALL_PERMISSIONS.map((p) => p.id),
  receptionist: [
    "rooms:read",
    "rooms:status",
    "guests:read",
    "guests:create",
    "guests:update",
    "guests:delete",
    "reservations:read",
    "reservations:create",
    "reservations:update",
    "reservations:cancel",
    "reservations:checkin",
    "reservations:checkout",
    "billing:read",
    "billing:invoice",
    "billing:payment",
    "reports:read",
  ],
  housekeeping: ["rooms:read", "rooms:status"],
};
