import { getObjectFromS3 } from "@/server/utils/s3-get-object";
import type { HonoContext } from "@/shared/types";
import { Hono } from "hono";

/**
 * Route สำหรับ stream ไฟล์จาก MinIO ตาม key
 * GET /files/uploads/demo/123.jpg → stream object ที่ key = uploads/demo/123.jpg
 * ใช้สำหรับ preview / ดาวน์โหลด ฝั่ง frontend (config.apiUrl + "/files/" + key)
 */
export function registerFileRoutes() {
  const r = new Hono<HonoContext>();

  // GET /files/uploads/demo/123.jpg → key = uploads/demo/123.jpg (path หลัง /files/)
  r.get("*", async (c) => {
    const pathname = new URL(c.req.url).pathname;
    const key = pathname.replace(/^(\/api)?\/files\/?/, "").replace(/^\//, "");

    if (!key) return c.json({ error: "Missing key" }, 400);

    const result = await getObjectFromS3(key);
    if (!result) {
      return c.json({ error: "Not found" }, 404);
    }

    const headers: Record<string, string> = {};
    if (result.contentType) {
      headers["Content-Type"] = result.contentType;
    }
    if (result.contentLength != null) {
      headers["Content-Length"] = String(result.contentLength);
    }

    return new Response(result.body, {
      status: 200,
      headers,
    });
  });

  return r;
}
