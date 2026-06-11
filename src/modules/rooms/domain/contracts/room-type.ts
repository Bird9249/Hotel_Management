import { z } from "zod";

export const RoomTypeCreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  basePrice: z.number().nonnegative(),
  capacity: z.number().int().min(1).default(2),
});

export const RoomTypeUpdateSchema = RoomTypeCreateSchema.partial();

export const RoomTypeIdParamSchema = z.object({ id: z.string().min(1) });

export const RoomTypeLookupQuerySchema = z.object({
  q: z
    .string()
    .trim()
    .transform((v) => (v && v.length > 0 ? v : undefined))
    .optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  skip: z.coerce.number().int().min(0).default(0),
});

export type RoomTypeCreateInput = z.infer<typeof RoomTypeCreateSchema>;
export type RoomTypeUpdateInput = z.infer<typeof RoomTypeUpdateSchema>;
export type RoomTypeLookupQueryDTO = z.infer<typeof RoomTypeLookupQuerySchema>;
