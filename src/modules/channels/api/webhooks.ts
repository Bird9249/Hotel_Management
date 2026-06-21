import { Elysia } from "elysia";
import { channelWebhookRoutes } from "../domain/http/webhook.routes";

export const channelsWebhookRoutes = new Elysia().use(
  new Elysia({ prefix: "/webhooks/channels" }).use(channelWebhookRoutes),
);
