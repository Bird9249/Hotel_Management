import { z } from "zod";

export const HotelBrandingSchema = z.object({
  name: z.string().min(1, "ຕ້ອງໃສ່ຊື່ໂຮງແຮມ"),
  nameEn: z.string().max(200).optional(),
  address: z.string().max(500).optional(),
  phone: z.string().max(50).optional(),
  taxId: z.string().max(50).optional(),
  logoKey: z.string().max(500).nullable().optional(),
});

export type HotelBrandingInput = z.infer<typeof HotelBrandingSchema>;

export type HotelBrandingDTO = {
  name: string;
  nameEn: string | null;
  address: string | null;
  phone: string | null;
  taxId: string | null;
  logoKey: string | null;
  updatedAt: string;
};
