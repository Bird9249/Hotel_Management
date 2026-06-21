import type { RoomTypeAvailabilityRow } from "../repo/list-room-type-availability";

export type SalesChannelCode =
  | "agoda"
  | "booking_com"
  | "expedia"
  | string;

export type ChannelSummary = {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
  config: Record<string, unknown> | null;
};

export type ChannelRoomMappingSummary = {
  roomTypeId: string;
  roomTypeName: string;
  externalRoomTypeId: string;
  allotment: number | null;
};

export type PushAvailabilityInput = {
  channel: ChannelSummary;
  mappings: ChannelRoomMappingSummary[];
  availability: RoomTypeAvailabilityRow[];
  from: string;
  to: string;
};

export type ExternalReservation = {
  externalBookingId: string;
  externalRoomTypeId: string;
  guestName: string;
  phone: string;
  email?: string | null;
  checkInDate: string;
  checkOutDate: string;
  guestsCount: number;
  status: "booked" | "cancelled";
  note?: string | null;
};

export interface ChannelAdapter {
  code: SalesChannelCode;
  pushAvailability(
    input: PushAvailabilityInput,
  ): Promise<{ pushedCount: number }>;
  pullReservations(since: Date): Promise<ExternalReservation[]>;
  acknowledgeReservation(externalId: string): Promise<void>;
}
