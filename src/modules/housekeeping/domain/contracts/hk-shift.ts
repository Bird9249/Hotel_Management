import { z } from "zod";

export const HkShiftStatusSchema = z.enum(["open", "closed"]);

export const OpenHkShiftSchema = z.object({});

export const CloseHkShiftSchema = z.object({
  handoverNote: z.string().max(500).optional(),
});

export const HkShiftIdParamSchema = z.object({ id: z.string().min(1) });

export type HkShiftStatus = z.infer<typeof HkShiftStatusSchema>;
export type OpenHkShiftInput = z.infer<typeof OpenHkShiftSchema>;
export type CloseHkShiftInput = z.infer<typeof CloseHkShiftSchema>;
