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
  SyncAvailabilityBodySchema,
  SyncLogIdParamSchema,
  SyncLogListQuerySchema,
} from "../contracts";
import { listChannels } from "../repo/list-channels";
import { listRoomMappings } from "../repo/list-room-mappings";
import { listSyncLogs } from "../repo/list-sync-logs";
import { getRoomTypeAvailabilityService } from "../service/get-room-type-availability";
import { retrySyncLogService } from "../service/retry-sync-log";
import {
  syncAllActiveChannelsService,
  syncChannelAvailabilityService,
} from "../service/sync-channel-availability";
import { updateChannelService } from "../service/update-channel";
import { testChannelWebhookService } from "../service/test-channel-webhook";
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
  )
  .get(
    "/channels/:id/logs",
    async ({ db, params, query }) =>
      listSyncLogs(
        {
          channelId: params.id,
          limit: query.limit,
          offset: query.offset,
          status: query.status,
        },
        db,
      ),
    {
      beforeHandle: requirePermission(Permissions.channels.read),
      params: SalesChannelIdParamSchema,
      query: SyncLogListQuerySchema,
    },
  )
  .post(
    "/channels/:id/test-webhook",
    async ({ db, params, status }) => {
      if (process.env.NODE_ENV !== "development") {
        return status(404, { error: "NOT_FOUND" });
      }

      try {
        const out = await runInTransaction(db, (tx) =>
          testChannelWebhookService(tx, { channelId: params.id }),
        );
        return status(201, out);
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        if (message === "CHANNEL_NOT_FOUND") {
          return status(404, { error: "NOT_FOUND" });
        }
        if (
          message === "CHANNEL_INACTIVE" ||
          message === "ROOM_MAPPING_NOT_FOUND"
        ) {
          return status(422, { error: message });
        }
        if (message === "ROOM_NOT_AVAILABLE") {
          return status(409, { error: message });
        }
        return status(500, { error: message });
      }
    },
    {
      beforeHandle: requirePermission(Permissions.channels.sync),
      params: SalesChannelIdParamSchema,
    },
  )
  .post(
    "/channels/:id/sync",
    async ({ db, params, body, status }) => {
      try {
        const out = await runInTransaction(db, (tx) =>
          syncChannelAvailabilityService(tx, {
            channelId: params.id,
            from: body.from,
            to: body.to,
          }),
        );
        return out;
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        if (message === "CHANNEL_NOT_FOUND") {
          return status(404, { error: "NOT_FOUND" });
        }
        if (
          message === "CHANNEL_INACTIVE" ||
          message === "INVALID_DATE_RANGE"
        ) {
          return status(422, { error: message });
        }
        return status(500, { error: message });
      }
    },
    {
      beforeHandle: requirePermission(Permissions.channels.sync),
      params: SalesChannelIdParamSchema,
      body: SyncAvailabilityBodySchema,
    },
  )
  .post(
    "/channels/sync-all",
    async ({ db, body, status }) => {
      try {
        return await syncAllActiveChannelsService(db, body);
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        return status(500, { error: message });
      }
    },
    {
      beforeHandle: requirePermission(Permissions.channels.sync),
      body: SyncAvailabilityBodySchema,
    },
  )
  .post(
    "/channels/logs/:logId/retry",
    async ({ db, params, status }) => {
      try {
        const out = await runInTransaction(db, (tx) =>
          retrySyncLogService(tx, { logId: params.logId }),
        );
        return out;
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        if (
          message === "SYNC_LOG_NOT_FOUND" ||
          message === "SYNC_LOG_NOT_RETRYABLE"
        ) {
          return status(422, { error: message });
        }
        if (message === "ROOM_NOT_AVAILABLE") {
          return status(409, { error: message });
        }
        return status(500, { error: message });
      }
    },
    {
      beforeHandle: requirePermission(Permissions.channels.sync),
      params: SyncLogIdParamSchema,
    },
  );
