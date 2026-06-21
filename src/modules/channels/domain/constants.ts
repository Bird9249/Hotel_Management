/** Reservation source ของ booking engine — ไม่จัดการใน Channel Manager (OTA) */
export const NON_OTA_SALES_CHANNEL_CODES = ["direct_web"] as const;

export function isOtaSalesChannelCode(code: string) {
  return !NON_OTA_SALES_CHANNEL_CODES.includes(
    code as (typeof NON_OTA_SALES_CHANNEL_CODES)[number],
  );
}
