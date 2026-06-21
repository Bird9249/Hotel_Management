import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useNotifications } from "@/app/providers/NotificationProvider";
import { toast } from "@/components/kit";
import { reservationsKeys } from "@/modules/reservations/presentation/api/queries";
import { roomsKeys } from "@/modules/rooms/presentation/api/queries";
import { config } from "@/shared/lib/config";
import { hkShiftKeys, hkTaskKeys } from "./queries";

type HousekeepingRoomStatusEvent = {
  type: "room_status_changed";
  roomId: string;
  roomNumber?: string;
  status: string;
  occurredAt: string;
};

type DirectBookingCreatedEvent = {
  type: "direct_booking_created";
  code: string;
  reservationId: string;
  guestName: string;
  roomNumber: string;
  roomTypeName: string | null;
  checkInDate: string;
  checkOutDate: string;
  occurredAt: string;
};

type UseHousekeepingEventsOptions = {
  notifyDirectBooking?: boolean;
  notifyCleaning?: boolean;
  osNotifyCleaning?: boolean;
};

function showCleaningNotification(event: HousekeepingRoomStatusEvent) {
  if (
    typeof window === "undefined" ||
    !("Notification" in window) ||
    Notification.permission !== "granted"
  ) {
    return;
  }

  const body = event.roomNumber
    ? `ຫ້ອງ ${event.roomNumber} ກຳລັງລໍຖ້າອານາໄມ`
    : "ມີຫ້ອງໃໝ່ກຳລັງລໍຖ້າອານາໄມ";

  new Notification("ມີວຽກແມ່ບ້ານໃໝ່", {
    body,
    icon: "/logo.svg",
    tag: `housekeeping-cleaning-${event.roomId}`,
  });
}

export function useHousekeepingEvents(
  enabled = true,
  options: UseHousekeepingEventsOptions = {},
) {
  const qc = useQueryClient();
  const { notify } = useNotifications();

  useEffect(() => {
    if (!enabled) return;

    const source = new EventSource(
      `${config.apiUrl}/hotel/housekeeping/events`,
      {
        withCredentials: true,
      },
    );

    const handleRoomStatusChanged = (message: MessageEvent<string>) => {
      const event = JSON.parse(message.data) as HousekeepingRoomStatusEvent;
      qc.invalidateQueries({ queryKey: reservationsKeys.all });
      qc.invalidateQueries({ queryKey: roomsKeys.all });
      qc.invalidateQueries({ queryKey: hkShiftKeys.all });
      qc.invalidateQueries({ queryKey: hkTaskKeys.all });

      if (options.notifyCleaning && event.status === "cleaning") {
        toast.info("ມີຫ້ອງໃໝ່ຕ້ອງອານາໄມ", {
          description: event.roomNumber ? `ຫ້ອງ ${event.roomNumber}` : undefined,
        });
      }

      if (options.osNotifyCleaning && event.status === "cleaning") {
        showCleaningNotification(event);
      }
    };

    const handleDirectBookingCreated = (message: MessageEvent<string>) => {
      const event = JSON.parse(message.data) as DirectBookingCreatedEvent;
      qc.invalidateQueries({ queryKey: reservationsKeys.all });
      qc.invalidateQueries({ queryKey: roomsKeys.all });

      if (options.notifyDirectBooking) {
        const description = `${event.guestName} · ຫ້ອງ ${event.roomNumber} · ${event.code}`;
        toast.info("ມີການຈອງໃໝ່ຈາກເວັບ", {
          description,
        });
        notify({
          title: "ມີການຈອງໃໝ່ຈາກເວັບ",
          description,
          type: "success",
          to: "/app/front-desk",
        });
      }
    };

    source.addEventListener("room_status_changed", handleRoomStatusChanged);
    source.addEventListener(
      "direct_booking_created",
      handleDirectBookingCreated,
    );

    return () => {
      source.removeEventListener(
        "room_status_changed",
        handleRoomStatusChanged,
      );
      source.removeEventListener(
        "direct_booking_created",
        handleDirectBookingCreated,
      );
      source.close();
    };
  }, [
    enabled,
    options.notifyCleaning,
    options.notifyDirectBooking,
    options.osNotifyCleaning,
    notify,
    qc,
  ]);
}
