export const RESERVATION_SOURCE_LABELS: Record<string, string> = {
  front_desk: "Front Desk",
  direct_web: "Direct / ເວັບ",
  agoda: "Agoda",
  booking_com: "Booking.com",
  expedia: "Expedia",
  other: "ອື່ນໆ",
};

export const STATIC_RESERVATION_SOURCE_KEYS = [
  "front_desk",
  "direct_web",
  "other",
] as const;

export function toReservationSourceKey(
  source: string,
  channelId: string | null | undefined,
) {
  if (channelId) return channelId;
  return source || "front_desk";
}

export function resolveReservationSource(
  sourceKey: string,
  channels: Array<{ id: string; code: string; name: string }>,
) {
  if (
    STATIC_RESERVATION_SOURCE_KEYS.includes(
      sourceKey as (typeof STATIC_RESERVATION_SOURCE_KEYS)[number],
    )
  ) {
    return { source: sourceKey, channelId: null as string | null };
  }

  const channel = channels.find((item) => item.id === sourceKey);
  if (channel) {
    return { source: channel.code, channelId: channel.id };
  }

  return { source: "front_desk", channelId: null as string | null };
}

export function getReservationSourceLabel(
  sourceKey: string,
  channels: Array<{ id: string; code: string; name: string }>,
) {
  const channel = channels.find((item) => item.id === sourceKey);
  if (channel) return channel.name;
  return RESERVATION_SOURCE_LABELS[sourceKey] ?? sourceKey;
}
