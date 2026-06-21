import type { ChannelAdapter, PushAvailabilityInput } from "./types";

function buildPayload(input: PushAvailabilityInput) {
  const mappedRoomTypeIds = new Set(
    input.mappings.map((item) => item.roomTypeId),
  );
  return input.availability
    .filter((row) => mappedRoomTypeIds.has(row.roomTypeId))
    .map((row) => {
      const mapping = input.mappings.find(
        (item) => item.roomTypeId === row.roomTypeId,
      );
      const allotment = mapping?.allotment ?? row.totalRooms;
      const available = Math.min(row.availableRooms, allotment);
      return {
        externalRoomTypeId: mapping?.externalRoomTypeId,
        roomTypeId: row.roomTypeId,
        roomTypeName: row.roomTypeName,
        available,
        from: input.from,
        to: input.to,
      };
    });
}

export function createMockOtaAdapter(code: string): ChannelAdapter {
  return {
    code,
    async pushAvailability(input) {
      const payload = buildPayload(input);
      return { pushedCount: payload.length };
    },
    async pullReservations() {
      return [];
    },
    async acknowledgeReservation() {},
  };
}

export const mockAgodaAdapter = createMockOtaAdapter("agoda");
export const mockBookingComAdapter = createMockOtaAdapter("booking_com");
export const mockExpediaAdapter = createMockOtaAdapter("expedia");
