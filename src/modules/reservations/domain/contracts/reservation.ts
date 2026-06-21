import { z } from "zod";

export const ReservationStatusSchema = z.enum([
  "booked",
  "checked_in",
  "checked_out",
  "cancelled",
]);

export const ReservationSourceSchema = z.enum([
  "front_desk",
  "direct_web",
  "agoda",
  "booking_com",
  "expedia",
  "other",
]);

export const ReservationCreateSchema = z
  .object({
    guestId: z.string().min(1),
    roomId: z.string().min(1),
    checkInDate: z.string().min(1),
    checkOutDate: z.string().min(1),
    guestsCount: z.number().int().min(1).default(1),
    source: ReservationSourceSchema.default("front_desk"),
    channelId: z.string().nullable().optional(),
  })
  .refine((v) => v.checkOutDate > v.checkInDate, {
    message: "checkOutDate must be after checkInDate",
    path: ["checkOutDate"],
  });

export const ReservationUpdateSchema = z
  .object({
    guestId: z.string().min(1).optional(),
    roomId: z.string().min(1).optional(),
    checkInDate: z.string().min(1).optional(),
    checkOutDate: z.string().min(1).optional(),
    guestsCount: z.number().int().min(1).optional(),
    source: ReservationSourceSchema.optional(),
    channelId: z.string().nullable().optional(),
  })
  .refine(
    (v) => {
      if (v.checkInDate && v.checkOutDate) {
        return v.checkOutDate > v.checkInDate;
      }
      return true;
    },
    {
      message: "checkOutDate must be after checkInDate",
      path: ["checkOutDate"],
    },
  );

export const ReservationIdParamSchema = z.object({ id: z.string().min(1) });

export const AvailabilityQuerySchema = z.object({
  from: z.string().min(1),
  to: z.string().min(1),
  roomTypeId: z.string().min(1).optional(),
});

export type ReservationStatus = z.infer<typeof ReservationStatusSchema>;
export type ReservationSource = z.infer<typeof ReservationSourceSchema>;
export type ReservationCreateInput = z.infer<typeof ReservationCreateSchema>;
export type ReservationUpdateInput = z.infer<typeof ReservationUpdateSchema>;
export type AvailabilityQueryDTO = z.infer<typeof AvailabilityQuerySchema>;
