import { Elysia } from "elysia";
import { Permissions } from "@/modules/roles/domain/contracts/permissions";
import { requirePermission } from "@/modules/roles/domain/http/middleware";
import { runInTransaction } from "@/server/platform/db/transaction";
import { serverContext } from "@/server/platform/http/context";
import {
  ChannelRoomMappingUpsertSchema,
  RoomTypeAvailabilityQuerySchema,
  SalesChannelIdParamSchema,
  SalesChannelUpdateSchema,
} from "../contracts";
import { listChannels } from "../repo/list-channels";
import { listRoomMappings } from "../repo/list-room-mappings";
import { getRoomTypeAvailabilityService } from "../service/get-room-type-availability";
import { updateChannelService } from "../service/update-channel";
import { upsertRoomMappingService } from "../service/upsert-room-mapping";

export const hotelChannelsRoutes = new Elysia()
  .use(serverContext)
  .get(
    "/channels/availability",
    async ({ db, query, status }) => {
      try {
        return await getRoomTypeAvailabilityService(db, { query });
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        if (message === "INVALID_DATE_RANGE") {
          return status(400, { error: "INVALID_DATE_RANGE" });
        }
        return status(500, { error: message });
      }
    },
    {
      beforeHandle: requirePermission(Permissions.channels.read),
      query: RoomTypeAvailabilityQuerySchema,
    },
  )
  .get("/channels", async ({ db }) => listChannels(db), {
    beforeHandle: requirePermission(Permissions.channels.read),
  })
  .patch(
    "/channels/:id",
    async ({ db, params, body, status }) => {
      try {
        const { updated } = await runInTransaction(db, (tx) =>
          updateChannelService(tx, { id: params.id, input: body }),
        );
        return updated;
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        if (message === "CHANNEL_NOT_FOUND") {
          return status(404, { error: "NOT_FOUND" });
        }
        return status(500, { error: message });
      }
    },
    {
      beforeHandle: requirePermission(Permissions.channels.manage),
      params: SalesChannelIdParamSchema,
      body: SalesChannelUpdateSchema,
    },
  )
  .get(
    "/channels/:id/mappings",
    async ({ db, params }) => listRoomMappings(params.id, db),
    {
      beforeHandle: requirePermission(Permissions.channels.read),
      params: SalesChannelIdParamSchema,
    },
  )
  .put(
    "/channels/:id/mappings",
    async ({ db, params, body, status }) => {
      try {
        const { mapping } = await runInTransaction(db, (tx) =>
          upsertRoomMappingService(tx, {
            channelId: params.id,
            input: body,
          }),
        );
        return mapping;
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        if (
          message === "CHANNEL_NOT_FOUND" ||
          message === "ROOM_TYPE_NOT_FOUND"
        ) {
          return status(404, { error: "NOT_FOUND" });
        }
        return status(500, { error: message });
      }
    },
    {
      beforeHandle: requirePermission(Permissions.channels.manage),
      params: SalesChannelIdParamSchema,
      body: ChannelRoomMappingUpsertSchema,
    },
  );
