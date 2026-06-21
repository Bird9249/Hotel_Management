import { z } from "zod";

export const ChannelRoomMappingUpsertSchema = z.object({
  roomTypeId: z.string().min(1),
  externalRoomTypeId: z.string().min(1),
  allotment: z.number().int().positive().nullable().optional(),
});

export type ChannelRoomMappingUpsertInput = z.infer<
  typeof ChannelRoomMappingUpsertSchema
>;
