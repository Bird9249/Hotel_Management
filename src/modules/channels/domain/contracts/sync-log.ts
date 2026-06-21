import { z } from "zod";

export const SyncLogListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  status: z.enum(["success", "failed", "partial"]).optional(),
});

export const SyncAvailabilityBodySchema = z.object({
  from: z.string().min(1).optional(),
  to: z.string().min(1).optional(),
});

export const SyncLogIdParamSchema = z.object({
  logId: z.string().min(1),
});

export type SyncLogListQuery = z.infer<typeof SyncLogListQuerySchema>;
export type SyncAvailabilityBody = z.infer<typeof SyncAvailabilityBodySchema>;
