import { z } from "zod";

export const ChannelWebhookPayloadSchema = z
  .object({
    externalBookingId: z.string().min(1),
    externalRoomTypeId: z.string().min(1),
    guestName: z.string().min(1).max(200),
    phone: z.string().min(1).max(50),
    email: z.string().email().optional().or(z.literal("")),
    checkInDate: z.string().min(1),
    checkOutDate: z.string().min(1),
    guestsCount: z.number().int().min(1).default(1),
    status: z.enum(["booked", "cancelled"]).default("booked"),
    note: z.string().max(500).optional(),
  })
  .refine((value) => value.checkOutDate > value.checkInDate, {
    message: "check-out must be after check-in",
    path: ["checkOutDate"],
  });

export const ChannelCodeParamSchema = z.object({
  channelCode: z.string().min(1),
});

export type ChannelWebhookPayload = z.infer<typeof ChannelWebhookPayloadSchema>;
