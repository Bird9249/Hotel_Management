import { z } from "zod";

export const ShiftStatusSchema = z.enum(["open", "closed"]);

export const OpenShiftSchema = z.object({
  openingCash: z.number().nonnegative(),
});

export const CloseShiftSchema = z.object({
  closingCashCounted: z.number().nonnegative(),
  handoverNote: z.string().max(500).optional(),
});

export const ShiftIdParamSchema = z.object({ id: z.string().min(1) });

export type ShiftStatus = z.infer<typeof ShiftStatusSchema>;
export type OpenShiftInput = z.infer<typeof OpenShiftSchema>;
export type CloseShiftInput = z.infer<typeof CloseShiftSchema>;
