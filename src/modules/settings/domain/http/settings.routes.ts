import { Elysia } from "elysia";
import { Permissions } from "@/modules/roles/domain/contracts/permissions";
import { requirePermission } from "@/modules/roles/domain/http/middleware";
import { runInTransaction } from "@/server/platform/db/transaction";
import { serverContext } from "@/server/platform/http/context";
import { HotelBrandingSchema } from "../contracts";
import { getHotelBrandingService } from "../service/get-hotel-branding";
import { updateHotelBrandingService } from "../service/update-hotel-branding";

export const hotelSettingsRoutes = new Elysia()
  .use(serverContext)
  .get("/branding", async ({ db }) => getHotelBrandingService(db), {
    beforeHandle: requirePermission(Permissions.billing.read),
  })
  .put(
    "/branding",
    async ({ db, body, status }) => {
      try {
        const updated = await runInTransaction(db, (tx) =>
          updateHotelBrandingService(tx, body),
        );
        return updated;
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        return status(500, { error: message });
      }
    },
    {
      beforeHandle: requirePermission(Permissions.users.update),
      body: HotelBrandingSchema,
    },
  );
