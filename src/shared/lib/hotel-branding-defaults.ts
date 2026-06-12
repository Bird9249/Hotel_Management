/** ค่าเริ่มต้นเมื่อยังไม่มีแถวใน hotel_settings */
export const DEFAULT_HOTEL_BRANDING = {
  name: "ໂຮງແຮມ [ຊື່ໂຮງແຮມ]",
  nameEn: "[Hotel Name]",
  address: "[ທີ່ຢູ່ — ແກ້ໃນການຕັ້ງຄ່າ]",
  phone: "+856 XX XXX XXXX",
  taxId: "",
} as const;

export type HotelBrandingDisplay = {
  name: string;
  nameEn: string | null;
  address: string | null;
  phone: string | null;
  taxId: string | null;
  logoKey: string | null;
};
