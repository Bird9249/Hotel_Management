/**
 * Demo webhook fixtures — ต้องตรงกับ DEMO_CHANNEL_MAPPINGS ใน seed-hotel-demo.ts
 */
export const SEED_CHANNEL_WEBHOOK_EXTERNAL_ROOM_IDS = {
  agoda: "AGD-DLX-001",
  booking_com: "BDC-STD-001",
} as const satisfies Record<string, string>;

export const SEED_CHANNEL_WEBHOOK_GUEST_NAMES: Record<string, string> = {
  agoda: "OTA Guest",
  booking_com: "Booking Guest",
};

export const SEED_CHANNEL_WEBHOOK_BOOKING_ID_PREFIX: Record<string, string> = {
  agoda: "AGD-DEMO",
  booking_com: "BDC-DEMO",
};

export function resolveSeedWebhookExternalRoomTypeId(
  channelCode: string,
  mappings: Array<{ externalRoomTypeId: string }>,
): string {
  const fromSeed = SEED_CHANNEL_WEBHOOK_EXTERNAL_ROOM_IDS[channelCode];
  if (fromSeed) {
    const match = mappings.find(
      (mapping) => mapping.externalRoomTypeId === fromSeed,
    );
    if (!match) throw new Error("ROOM_MAPPING_NOT_FOUND");
    return match.externalRoomTypeId;
  }

  const fallback = mappings[0];
  if (!fallback) throw new Error("ROOM_MAPPING_NOT_FOUND");
  return fallback.externalRoomTypeId;
}
