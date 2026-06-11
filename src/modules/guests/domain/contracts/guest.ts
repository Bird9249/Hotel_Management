import { z } from "zod";

export const GuestCreateSchema = z.object({
  fullName: z.string().min(1),
  phone: z.string().optional(),
  idDocument: z.string().optional(),
  nationality: z.string().optional(),
});

export const GuestUpdateSchema = GuestCreateSchema.partial();

export const GuestIdParamSchema = z.object({ id: z.string().min(1) });

export const GuestLookupQuerySchema = z.object({
  q: z
    .string()
    .trim()
    .transform((v) => (v && v.length > 0 ? v : undefined))
    .optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  skip: z.coerce.number().int().min(0).default(0),
});

export type GuestCreateInput = z.infer<typeof GuestCreateSchema>;
export type GuestUpdateInput = z.infer<typeof GuestUpdateSchema>;
export type GuestLookupQueryDTO = z.infer<typeof GuestLookupQuerySchema>;
