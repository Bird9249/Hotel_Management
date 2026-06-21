import { Elysia } from "elysia";
import { runInTransaction } from "@/server/platform/db/transaction";
import { serverContext } from "@/server/platform/http/context";
import {
  ChannelCodeParamSchema,
  ChannelWebhookPayloadSchema,
} from "../contracts";
import { processChannelWebhookService } from "../service/process-channel-webhook";
import { verifyChannelWebhookAuth } from "../service/verify-webhook-auth";

export const channelWebhookRoutes = new Elysia().use(serverContext).post(
  "/:channelCode",
  async ({ db, params, body, request, status }) => {
    if (!verifyChannelWebhookAuth(request)) {
      return status(401, { error: "UNAUTHORIZED" });
    }

    try {
      const out = await runInTransaction(db, (tx) =>
        processChannelWebhookService(tx, {
          channelCode: params.channelCode,
          input: body,
        }),
      );
      return status(201, out);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      if (message === "CHANNEL_NOT_FOUND") {
        return status(404, { error: message });
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
    params: ChannelCodeParamSchema,
    body: ChannelWebhookPayloadSchema,
  },
);
