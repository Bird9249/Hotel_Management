import { z } from "zod";

export const HkTaskStatusSchema = z.enum(["pending", "in_progress", "done"]);

export const HkTaskUpdateSchema = z.object({
  status: HkTaskStatusSchema,
});

export const HkTaskIdParamSchema = z.object({ id: z.string().min(1) });

export type HkTaskStatus = z.infer<typeof HkTaskStatusSchema>;
export type HkTaskUpdateInput = z.infer<typeof HkTaskUpdateSchema>;
