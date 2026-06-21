export function getPostLoginRoute(permissions: readonly string[]) {
  const isHousekeepingOnly =
    permissions.includes("housekeeping:task") &&
    !permissions.includes("users:read") &&
    !permissions.includes("reservations:read");

  return isHousekeepingOnly ? "/m/housekeeping" : "/app/dashboard";
}
