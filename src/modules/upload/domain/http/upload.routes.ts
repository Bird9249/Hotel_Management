import {
  abortMultipartUpload,
  completeMultipartUpload,
  createMultipartUpload,
  getPresignedPartUrls,
} from "@/server/utils/multipart-upload";
import { getPresignedUploadUrl } from "@/server/utils/presign-upload";
import {
  MultipartAbortSchema,
  MultipartCompleteSchema,
  MultipartInitSchema,
  MultipartPresignPartsSchema,
  PresignUploadSchema,
} from "@/shared/contracts/upload";
import type { HonoContext } from "@/shared/types";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";

export function registerUploadRoutes() {
  const r = new Hono<HonoContext>();

  /**
   * ขอ presigned PUT URL สำหรับอัปโหลดไฟล์จาก frontend ไป MinIO โดยตรง
   * POST body: { key: string, contentType?: string, expiresIn?: number }
   * Response: { uploadUrl: string, key: string }
   */
  r.post("/presign", zValidator("json", PresignUploadSchema), async (c) => {
    const input = c.req.valid("json");
    const result = await getPresignedUploadUrl({
      key: input.key,
      contentType: input.contentType,
      expiresIn: input.expiresIn,
    });
    if (!result) {
      return c.json(
        { error: "Object store (S3/MinIO) is not configured" },
        503,
      );
    }
    return c.json(result, 200);
  });

  // --- Multipart (chunk) upload สำหรับไฟล์ขนาดใหญ่ ---

  /** เริ่ม multipart upload → ได้ uploadId */
  r.post(
    "/multipart/init",
    zValidator("json", MultipartInitSchema),
    async (c) => {
      const input = c.req.valid("json");
      const result = await createMultipartUpload(input.key, input.contentType);
      if (!result) {
        return c.json(
          { error: "Object store (S3/MinIO) is not configured" },
          503,
        );
      }
      return c.json(result, 200);
    },
  );

  /** ขอ presigned URL สำหรับแต่ละ part */
  r.post(
    "/multipart/presign-parts",
    zValidator("json", MultipartPresignPartsSchema),
    async (c) => {
      const input = c.req.valid("json");
      const parts = await getPresignedPartUrls(
        input.key,
        input.uploadId,
        input.partNumbers,
        input.expiresIn,
      );
      if (!parts) {
        return c.json(
          { error: "Object store (S3/MinIO) is not configured" },
          503,
        );
      }
      return c.json({ parts }, 200);
    },
  );

  /** รวม parts เป็น object (complete) */
  r.post(
    "/multipart/complete",
    zValidator("json", MultipartCompleteSchema),
    async (c) => {
      const input = c.req.valid("json");
      const result = await completeMultipartUpload(
        input.key,
        input.uploadId,
        input.parts,
      );
      if (!result) {
        return c.json(
          { error: "Object store (S3/MinIO) is not configured" },
          503,
        );
      }
      return c.json(result, 200);
    },
  );

  /** ยกเลิก multipart upload */
  r.post(
    "/multipart/abort",
    zValidator("json", MultipartAbortSchema),
    async (c) => {
      const input = c.req.valid("json");
      const ok = await abortMultipartUpload(input.key, input.uploadId);
      if (!ok) {
        return c.json(
          { error: "Object store (S3/MinIO) is not configured" },
          503,
        );
      }
      return c.json({ ok: true }, 200);
    },
  );

  return r;
}
