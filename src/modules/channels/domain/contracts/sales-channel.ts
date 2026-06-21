import { z } from "zod";

export const ChannelStatusSchema = z.enum(["success", "failed", "partial"]);
export const ChannelSyncDirectionSchema = z.enum(["push", "pull"]);
export const ChannelSyncOperationSchema = z.enum([
  "availability",
  "reservation",
  "rate",
]);

export const SalesChannelUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
  config: z.record(z.string(), z.unknown()).nullable().optional(),
});

export const SalesChannelIdParamSchema = z.object({
  id: z.string().min(1),
});

export type SalesChannelUpdateInput = z.infer<typeof SalesChannelUpdateSchema>;
