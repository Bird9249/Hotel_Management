import { requireAuth } from "@/modules/roles/domain/http/middleware";
import type { HonoContext } from "@/shared/types";
import type { Hono } from "hono";
import { registerFileRoutes } from "../domain/http/files.routes";
import { registerUploadRoutes } from "../domain/http/upload.routes";

export function registerUploadAPIRoutes(app: Hono<HonoContext>) {
  app.use("/upload/*", requireAuth());
  app.use("/files/*", requireAuth());
  app.route("/upload", registerUploadRoutes());
  app.route("/files", registerFileRoutes());
}
