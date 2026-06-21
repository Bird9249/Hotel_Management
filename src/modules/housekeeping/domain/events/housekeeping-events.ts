export type HousekeepingEvent =
  | {
      type: "room_status_changed";
      roomId: string;
      roomNumber?: string;
      status: string;
      taskId?: string;
      occurredAt: string;
    }
  | {
      type: "direct_booking_created";
      code: string;
      reservationId: string;
      guestName: string;
      roomNumber: string;
      roomTypeName: string | null;
      checkInDate: string;
      checkOutDate: string;
      occurredAt: string;
    }
  | {
      type: "heartbeat";
      occurredAt: string;
    };

type Listener = (event: HousekeepingEvent) => void;

const listeners = new Set<Listener>();

export function publishHousekeepingEvent(event: HousekeepingEvent) {
  for (const listener of listeners) {
    listener(event);
  }
}

export function subscribeHousekeepingEvents(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
