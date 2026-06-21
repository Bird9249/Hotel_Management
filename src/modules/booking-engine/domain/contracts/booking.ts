import { z } from "zod";

export const PublicAvailabilityQuerySchema = z
  .object({
    from: z.string().min(1),
    to: z.string().min(1),
    guests: z.coerce.number().int().min(1).default(1),
  })
  .refine((value) => value.to > value.from, {
    message: "check-out must be after check-in",
    path: ["to"],
  });

export const CreateBookingHoldSchema = z.object({
  roomTypeId: z.string().min(1),
  checkInDate: z.string().min(1),
  checkOutDate: z.string().min(1),
  guestsCount: z.number().int().min(1).default(1),
});

export const ConfirmBookingSchema = z.object({
  holdId: z.string().min(1),
  guestName: z.string().min(1).max(200),
  phone: z.string().min(1).max(50),
  email: z.string().email().optional().or(z.literal("")),
  guestsCount: z.number().int().min(1).default(1),
  note: z.string().max(500).optional(),
  website: z.string().max(0).optional(),
});

export const BookingCodeParamSchema = z.object({
  code: z.string().min(1),
});

export const BookingHoldParamSchema = z.object({
  holdId: z.string().min(1),
});

export type PublicAvailabilityQuery = z.infer<
  typeof PublicAvailabilityQuerySchema
>;
export type CreateBookingHoldInput = z.infer<typeof CreateBookingHoldSchema>;
export type ConfirmBookingInput = z.infer<typeof ConfirmBookingSchema>;
