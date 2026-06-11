import { Elysia } from "elysia";
import { Permissions } from "@/modules/roles/domain/contracts/permissions";
import { requirePermission } from "@/modules/roles/domain/http/middleware";
import { serverContext } from "@/server/platform/http/context";
import { DateRangeQuerySchema } from "../contracts";
import { getDailySales } from "../service/get-daily-sales";
import { getOccupancy } from "../service/get-occupancy";
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
  });
