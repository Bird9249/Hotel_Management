import {
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { lazy } from "react";
import { RequirePermissions } from "@/modules/auth/presentation/ui/RequirePermissions";
import { LazyPage } from "@/shared/ui/LazyPage";

const RootLayout = lazy(() =>
  import("./layout/RootLayout").then((module) => ({
    default: module.RootLayout,
  })),
);
const ErrorBoundary = lazy(() =>
  import("./error/ErrorBoundary").then((module) => ({
    default: module.ErrorBoundary,
  })),
);
const AuthLayout = lazy(() =>
  import("./layout/AuthLayout").then((module) => ({
    default: module.AuthLayout,
  })),
);

const LoginPage = lazy(() =>
  import("@/modules/auth/presentation/pages/LoginPage").then((module) => ({
    default: module.LoginPage,
  })),
);
const AuthenticatedLayout = lazy(() =>
  import("./layout/AuthenticatedLayout").then((module) => ({
    default: module.AuthenticatedLayout,
  })),
);
const DashboardPage = lazy(() =>
  import("@/modules/dashboard/presentation/pages/DashboardPage").then(
    (module) => ({
      default: module.DashboardPage,
    }),
  ),
);
const RolesPage = lazy(() =>
  import("@/modules/roles/presentation/pages/RolesPage").then((module) => ({
    default: module.RolesPage,
  })),
);
const RoleCreatePage = lazy(() =>
  import("@/modules/roles/presentation/pages/RoleCreatePage").then(
    (module) => ({
      default: module.RoleCreatePage,
    }),
  ),
);
const RoleEditPage = lazy(() =>
  import("@/modules/roles/presentation/pages/RoleEditPage").then((module) => ({
    default: module.RoleEditPage,
  })),
);
const AuditPage = lazy(() =>
  import("@/modules/audit/presentation/pages/AuditPage").then((module) => ({
    default: module.AuditPage,
  })),
);
const AuditDetailPage = lazy(() =>
  import("@/modules/audit/presentation/pages/AuditDetailPage").then(
    (module) => ({
      default: module.AuditDetailPage,
    }),
  ),
);
const UsersPage = lazy(() =>
  import("@/modules/users/presentation/pages/UsersPage").then((module) => ({
    default: module.UsersPage,
  })),
);
const UserCreatePage = lazy(() =>
  import("@/modules/users/presentation/pages/UserCreatePage").then(
    (module) => ({
      default: module.UserCreatePage,
    }),
  ),
);
const UserEditPage = lazy(() =>
  import("@/modules/users/presentation/pages/UserEditPage").then((module) => ({
    default: module.UserEditPage,
  })),
);
const ProfilePage = lazy(() =>
  import("@/modules/auth/presentation/pages/ProfilePage").then((module) => ({
    default: module.ProfilePage,
  })),
);
const SettingsPage = lazy(() =>
  import("@/modules/settings/presentation/pages/SettingsPage").then(
    (module) => ({
      default: module.SettingsPage,
    }),
  ),
);
const RoomsPage = lazy(() =>
  import("@/modules/rooms/presentation/pages/RoomsPage").then((module) => ({
    default: module.RoomsPage,
  })),
);
const RoomCreatePage = lazy(() =>
  import("@/modules/rooms/presentation/pages/RoomCreatePage").then(
    (module) => ({
      default: module.RoomCreatePage,
    }),
  ),
);
const RoomEditPage = lazy(() =>
  import("@/modules/rooms/presentation/pages/RoomEditPage").then((module) => ({
    default: module.RoomEditPage,
  })),
);
const RoomTypesPage = lazy(() =>
  import("@/modules/rooms/presentation/pages/RoomTypesPage").then((module) => ({
    default: module.RoomTypesPage,
  })),
);
const GuestsPage = lazy(() =>
  import("@/modules/guests/presentation/pages/GuestsPage").then((module) => ({
    default: module.GuestsPage,
  })),
);
const GuestCreatePage = lazy(() =>
  import("@/modules/guests/presentation/pages/GuestCreatePage").then(
    (module) => ({
      default: module.GuestCreatePage,
    }),
  ),
);
const GuestEditPage = lazy(() =>
  import("@/modules/guests/presentation/pages/GuestEditPage").then(
    (module) => ({
      default: module.GuestEditPage,
    }),
  ),
);
const ReservationsPage = lazy(() =>
  import("@/modules/reservations/presentation/pages/ReservationsPage").then(
    (module) => ({
      default: module.ReservationsPage,
    }),
  ),
);
const ReservationCreatePage = lazy(() =>
  import(
    "@/modules/reservations/presentation/pages/ReservationCreatePage"
  ).then((module) => ({
    default: module.ReservationCreatePage,
  })),
);
const ReservationEditPage = lazy(() =>
  import("@/modules/reservations/presentation/pages/ReservationEditPage").then(
    (module) => ({
      default: module.ReservationEditPage,
    }),
  ),
);
const BookingCalendarPage = lazy(() =>
  import("@/modules/reservations/presentation/pages/BookingCalendarPage").then(
    (module) => ({
      default: module.BookingCalendarPage,
    }),
  ),
);
const FrontDeskPage = lazy(() =>
  import("@/modules/reservations/presentation/pages/FrontDeskPage").then(
    (module) => ({
      default: module.FrontDeskPage,
    }),
  ),
);
const HousekeepingPage = lazy(() =>
  import("@/modules/rooms/presentation/pages/HousekeepingPage").then(
    (module) => ({
      default: module.HousekeepingPage,
    }),
  ),
);
const InvoicesPage = lazy(() =>
  import("@/modules/billing/presentation/pages/InvoicesPage").then(
    (module) => ({
      default: module.InvoicesPage,
    }),
  ),
);
const InvoiceDetailPage = lazy(() =>
  import("@/modules/billing/presentation/pages/InvoiceDetailPage").then(
    (module) => ({
      default: module.InvoiceDetailPage,
    }),
  ),
);
const Forbidden = lazy(() =>
  import("./error/Forbidden").then((module) => ({
    default: module.Forbidden,
  })),
);

const rootRoute = createRootRoute({
  component: RootLayout,
  errorComponent: ErrorBoundary,
});

const authLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth",
  component: AuthLayout,
});

const loginRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/login",
  component: LoginPage,
});

const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app",
  component: AuthenticatedLayout,
});

const dashboardRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/dashboard",
  component: () => (
    <LazyPage>
      <DashboardPage />
    </LazyPage>
  ),
});

const rolesRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/roles",
  component: () => (
    <RequirePermissions all={["users:read"]} any={["users:ban"]}>
      <LazyPage>
        <RolesPage />
      </LazyPage>
    </RequirePermissions>
  ),
});

const roleCreateRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/roles/create",
  component: () => (
    <RequirePermissions all={["users:read"]} any={["users:ban"]}>
      <LazyPage>
        <RoleCreatePage />
      </LazyPage>
    </RequirePermissions>
  ),
});

const roleEditRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/roles/$id/edit",
  component: () => (
    <RequirePermissions all={["users:read"]} any={["users:ban"]}>
      <LazyPage>
        <RoleEditPage />
      </LazyPage>
    </RequirePermissions>
  ),
});

const auditRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/audit",
  component: () => (
    <RequirePermissions all={["audit:read"]}>
      <LazyPage>
        <AuditPage />
      </LazyPage>
    </RequirePermissions>
  ),
});

const auditDetailRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/audit/$id",
  component: () => (
    <RequirePermissions all={["audit:read"]}>
      <LazyPage>
        <AuditDetailPage />
      </LazyPage>
    </RequirePermissions>
  ),
});

const usersRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/users",
  component: () => (
    <RequirePermissions all={["users:read"]}>
      <LazyPage>
        <UsersPage />
      </LazyPage>
    </RequirePermissions>
  ),
});

const userCreateRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/users/create",
  component: () => (
    <RequirePermissions all={["users:read"]} any={["users:create"]}>
      <LazyPage>
        <UserCreatePage />
      </LazyPage>
    </RequirePermissions>
  ),
});

const userEditRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/users/$id/edit",
  component: () => (
    <RequirePermissions all={["users:read"]} any={["users:update"]}>
      <LazyPage>
        <UserEditPage />
      </LazyPage>
    </RequirePermissions>
  ),
});

const profileRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/profile",
  component: () => (
    <LazyPage>
      <ProfilePage />
    </LazyPage>
  ),
});

const settingsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/settings",
  component: () => (
    <LazyPage>
      <SettingsPage />
    </LazyPage>
  ),
});

const roomsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/rooms",
  component: () => (
    <RequirePermissions all={["rooms:read"]}>
      <LazyPage>
        <RoomsPage />
      </LazyPage>
    </RequirePermissions>
  ),
});

const roomCreateRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/rooms/create",
  component: () => (
    <RequirePermissions all={["rooms:read"]} any={["rooms:create"]}>
      <LazyPage>
        <RoomCreatePage />
      </LazyPage>
    </RequirePermissions>
  ),
});

const roomEditRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/rooms/$id/edit",
  component: () => (
    <RequirePermissions all={["rooms:read"]} any={["rooms:update"]}>
      <LazyPage>
        <RoomEditPage />
      </LazyPage>
    </RequirePermissions>
  ),
});

const roomTypesRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/room-types",
  component: () => (
    <RequirePermissions all={["rooms:read"]}>
      <LazyPage>
        <RoomTypesPage />
      </LazyPage>
    </RequirePermissions>
  ),
});

const guestsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/guests",
  component: () => (
    <RequirePermissions all={["guests:read"]}>
      <LazyPage>
        <GuestsPage />
      </LazyPage>
    </RequirePermissions>
  ),
});

const guestCreateRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/guests/create",
  component: () => (
    <RequirePermissions all={["guests:read"]} any={["guests:create"]}>
      <LazyPage>
        <GuestCreatePage />
      </LazyPage>
    </RequirePermissions>
  ),
});

const guestEditRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/guests/$id/edit",
  component: () => (
    <RequirePermissions all={["guests:read"]} any={["guests:update"]}>
      <LazyPage>
        <GuestEditPage />
      </LazyPage>
    </RequirePermissions>
  ),
});

const reservationsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/reservations",
  component: () => (
    <RequirePermissions all={["reservations:read"]}>
      <LazyPage>
        <ReservationsPage />
      </LazyPage>
    </RequirePermissions>
  ),
});

const reservationCreateRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/reservations/create",
  component: () => (
    <RequirePermissions
      all={["reservations:read"]}
      any={["reservations:create"]}
    >
      <LazyPage>
        <ReservationCreatePage />
      </LazyPage>
    </RequirePermissions>
  ),
});

const reservationEditRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/reservations/$id/edit",
  component: () => (
    <RequirePermissions
      all={["reservations:read"]}
      any={["reservations:update"]}
    >
      <LazyPage>
        <ReservationEditPage />
      </LazyPage>
    </RequirePermissions>
  ),
});

const calendarRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/calendar",
  component: () => (
    <RequirePermissions all={["reservations:read"]}>
      <LazyPage>
        <BookingCalendarPage />
      </LazyPage>
    </RequirePermissions>
  ),
});

const frontDeskRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/front-desk",
  component: () => (
    <RequirePermissions
      all={["reservations:read"]}
      any={["reservations:checkin", "reservations:checkout"]}
    >
      <LazyPage>
        <FrontDeskPage />
      </LazyPage>
    </RequirePermissions>
  ),
});

const housekeepingRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/housekeeping",
  component: () => (
    <RequirePermissions all={["rooms:read", "rooms:status"]}>
      <LazyPage>
        <HousekeepingPage />
      </LazyPage>
    </RequirePermissions>
  ),
});

const invoicesRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/invoices",
  component: () => (
    <RequirePermissions all={["billing:read"]}>
      <LazyPage>
        <InvoicesPage />
      </LazyPage>
    </RequirePermissions>
  ),
});

const invoiceDetailRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/invoices/$id",
  component: () => (
    <RequirePermissions all={["billing:read"]}>
      <LazyPage>
        <InvoiceDetailPage />
      </LazyPage>
    </RequirePermissions>
  ),
});

const forbiddenRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/errors/forbidden",
  component: () => (
    <LazyPage>
      <Forbidden />
    </LazyPage>
  ),
});

export const routeTree = rootRoute.addChildren([
  authLayoutRoute.addChildren([loginRoute]),
  appRoute.addChildren([
    dashboardRoute,
    rolesRoute,
    roleCreateRoute,
    roleEditRoute,
    usersRoute,
    userCreateRoute,
    userEditRoute,
    auditRoute,
    auditDetailRoute,
    profileRoute,
    settingsRoute,
    roomsRoute,
    roomCreateRoute,
    roomEditRoute,
    roomTypesRoute,
    guestsRoute,
    guestCreateRoute,
    guestEditRoute,
    reservationsRoute,
    reservationCreateRoute,
    reservationEditRoute,
    calendarRoute,
    frontDeskRoute,
    housekeepingRoute,
    invoicesRoute,
    invoiceDetailRoute,
  ]),
  forbiddenRoute,
]);
export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
