import { z } from "zod";

export const RoomTypeAvailabilityQuerySchema = z
  .object({
    from: z.string().min(1),
    to: z.string().min(1),
    roomTypeId: z.string().min(1).optional(),
  })
  .refine((v) => v.to > v.from, {
    message: "to must be after from",
    path: ["to"],
  });

export type RoomTypeAvailabilityQueryDTO = z.infer<
  typeof RoomTypeAvailabilityQuerySchema
>;
