import { z } from "zod";

export const RoomStatusSchema = z.enum([
  "available",
  "occupied",
  "cleaning",
  "maintenance",
]);

export const RoomCreateSchema = z.object({
  roomNumber: z.string().min(1),
  floor: z.number().int().optional(),
  roomTypeId: z.string().min(1),
  status: RoomStatusSchema.default("available"),
});

export const RoomUpdateSchema = RoomCreateSchema.partial();

export const RoomStatusUpdateSchema = z.object({
  status: RoomStatusSchema,
});

export const RoomIdParamSchema = z.object({ id: z.string().min(1) });

export type RoomCreateInput = z.infer<typeof RoomCreateSchema>;
export type RoomUpdateInput = z.infer<typeof RoomUpdateSchema>;
export type RoomStatusUpdateInput = z.infer<typeof RoomStatusUpdateSchema>;
export type RoomStatus = z.infer<typeof RoomStatusSchema>;
