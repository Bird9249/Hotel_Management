import { Elysia } from "elysia";
import { Permissions } from "@/modules/roles/domain/contracts/permissions";
import { requirePermission } from "@/modules/roles/domain/http/middleware";
import { serverContext } from "@/server/platform/http/context";
import { DateRangeQuerySchema, HkProductivityQuerySchema } from "../contracts";
import { getBookingsBySource } from "../service/get-bookings-by-source";
import { getDailyCashSummary } from "../service/get-daily-cash-summary";
import { getDailySales } from "../service/get-daily-sales";
import { getHkProductivity } from "../service/get-hk-productivity";
import { getOccupancy } from "../service/get-occupancy";
import { getRevenueBySource } from "../service/get-revenue-by-source";
import { getSalesByShift } from "../service/get-sales-by-shift";
import { getShiftReconciliation } from "../service/get-shift-reconciliation";
import { getSummary } from "../service/get-summary";

export const hotelReportsRoutes = new Elysia()
  .use(serverContext)
  .get(
    "/reports/daily-sales",
    async ({ db, query }) => getDailySales(query.from, query.to, db),
    {
      beforeHandle: requirePermission(Permissions.reports.read),
      query: DateRangeQuerySchema,
    },
  )
  .get(
    "/reports/occupancy",
    async ({ db, query }) => getOccupancy(query.from, query.to, db),
    {
      beforeHandle: requirePermission(Permissions.reports.read),
      query: DateRangeQuerySchema,
    },
  )
  .get("/reports/summary", async ({ db }) => getSummary(db), {
    beforeHandle: requirePermission(Permissions.reports.read),
  })
  .get(
    "/reports/shift-reconciliation",
    async ({ db, query }) => getShiftReconciliation(query.from, query.to, db),
    {
      beforeHandle: requirePermission(Permissions.reports.read),
      query: DateRangeQuerySchema,
    },
  )
  .get(
    "/reports/sales-by-shift",
    async ({ db, query }) => getSalesByShift(query.from, query.to, db),
    {
      beforeHandle: requirePermission(Permissions.reports.read),
      query: DateRangeQuerySchema,
    },
  )
  .get(
    "/reports/daily-cash",
    async ({ db, query }) => getDailyCashSummary(query.from, query.to, db),
    {
      beforeHandle: requirePermission(Permissions.reports.read),
      query: DateRangeQuerySchema,
    },
  )
  .get(
    "/reports/bookings-by-source",
    async ({ db, query }) => getBookingsBySource(query.from, query.to, db),
    {
      beforeHandle: requirePermission(Permissions.reports.read),
      query: DateRangeQuerySchema,
    },
  )
  .get(
    "/reports/revenue-by-source",
    async ({ db, query }) => getRevenueBySource(query.from, query.to, db),
    {
      beforeHandle: requirePermission(Permissions.reports.read),
      query: DateRangeQuerySchema,
    },
  )
  .get(
    "/reports/hk-productivity",
    async ({ db, query }) =>
      getHkProductivity(query.from, query.to, query.mode, db),
    {
      beforeHandle: requirePermission(Permissions.reports.read),
      query: HkProductivityQuerySchema,
    },
  );
