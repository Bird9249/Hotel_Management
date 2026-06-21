import { publishHousekeepingEvent } from "@/modules/housekeeping/domain/events/housekeeping-events";

export type ChannelReservationImportAction = "created" | "updated" | "cancelled";

export function publishChannelReservationImportedEvent(params: {
  channelCode: string;
  channelName: string;
  externalBookingId: string;
  reservationId: string | null;
  guestName: string;
  roomNumber: string | null;
  roomTypeName: string | null;
  checkInDate: string;
  checkOutDate: string;
  action: ChannelReservationImportAction;
}) {
  publishHousekeepingEvent({
    type: "channel_reservation_imported",
    occurredAt: new Date().toISOString(),
    ...params,
  });
}
