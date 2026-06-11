import { z } from "zod";

export const DateRangeQuerySchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type DateRangeQuery = z.infer<typeof DateRangeQuerySchema>;
