import { bookingComAdapter } from "./booking-com.adapter";
import {
  mockAgodaAdapter,
  mockExpediaAdapter,
} from "./mock-ota.adapter";
import type { ChannelAdapter, SalesChannelCode } from "./types";

const adapters = new Map<string, ChannelAdapter>([
  [mockAgodaAdapter.code, mockAgodaAdapter],
  [bookingComAdapter.code, bookingComAdapter],
  [mockExpediaAdapter.code, mockExpediaAdapter],
]);

export function getChannelAdapter(code: SalesChannelCode): ChannelAdapter {
  return adapters.get(code) ?? createFallbackMockAdapter(code);
}

function createFallbackMockAdapter(code: string): ChannelAdapter {
  return {
    code,
    async pushAvailability(input) {
      const mapped = input.mappings.length;
      return { pushedCount: mapped };
    },
    async pullReservations() {
      return [];
    },
    async acknowledgeReservation() {},
  };
}
