import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useNotifications } from "@/app/providers/NotificationProvider";
import { toast } from "@/components/kit";
import { channelKeys } from "@/modules/channels/presentation/api/queries";
import { reservationsKeys } from "@/modules/reservations/presentation/api/queries";
import { roomsKeys } from "@/modules/rooms/presentation/api/queries";
import { config } from "@/shared/lib/config";
import { hkShiftKeys, hkTaskKeys } from "./queries";

type HousekeepingRoomStatusEvent = {
  type: "room_status_changed";
  roomId: string;
  roomNumber?: string;
  status: string;
  taskId?: string;
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

type ChannelReservationImportedEvent = {
  type: "channel_reservation_imported";
  channelCode: string;
  channelName: string;
  externalBookingId: string;
  reservationId: string | null;
  guestName: string;
  roomNumber: string | null;
  roomTypeName: string | null;
  checkInDate: string;
  checkOutDate: string;
  action: "created" | "updated" | "cancelled";
  occurredAt: string;
};

type UseHousekeepingEventsOptions = {
  notifyDirectBooking?: boolean;
  notifyChannelBooking?: boolean;
  notifyCleaning?: boolean;
  notifyRoomReady?: boolean;
  osNotifyCleaning?: boolean;
  osNotifyRoomReady?: boolean;
};

function showRoomReadyNotification(event: HousekeepingRoomStatusEvent) {
  if (
    typeof window === "undefined" ||
    !("Notification" in window) ||
    Notification.permission !== "granted"
  ) {
    return;
  }

  const body = event.roomNumber
    ? `ຫ້ອງ ${event.roomNumber} ພ້ອມຮັບແຂກ`
    : "ມີຫ້ອງທີ່ອານາໄມສຳເລັດແລ້ວ";

  new Notification("ຫ້ອງພ້ອມໃຊ້", {
    body,
    icon: "/logo.svg",
    tag: `housekeeping-ready-${event.roomId}`,
  });
}

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

function buildChannelReservationDescription(
  event: ChannelReservationImportedEvent,
) {
  const roomLabel = event.roomNumber
    ? `ຫ້ອງ ${event.roomNumber}`
    : event.roomTypeName ?? "—";
  return `${event.guestName} · ${roomLabel} · ${event.externalBookingId}`;
}

function getChannelReservationNotification(event: ChannelReservationImportedEvent) {
  const description = buildChannelReservationDescription(event);

  if (event.action === "cancelled") {
    return {
      title: `ຍົກເລີກການຈອງຈາກ ${event.channelName}`,
      description,
      type: "warning" as const,
      to: "/app/calendar" as const,
    };
  }

  if (event.action === "updated") {
    return {
      title: `ອັບເດດການຈອງຈາກ ${event.channelName}`,
      description,
      type: "info" as const,
      to: "/app/front-desk" as const,
    };
  }

  return {
    title: `ມີການຈອງໃໝ່ຈາກ ${event.channelName}`,
    description,
    type: "success" as const,
    to: "/app/front-desk" as const,
  };
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

    const invalidateReservationData = () => {
      qc.invalidateQueries({ queryKey: reservationsKeys.all });
      qc.invalidateQueries({ queryKey: roomsKeys.all });
      qc.invalidateQueries({ queryKey: channelKeys.all });
    };

    const handleRoomStatusChanged = (message: MessageEvent<string>) => {
      const event = JSON.parse(message.data) as HousekeepingRoomStatusEvent;
      invalidateReservationData();
      qc.invalidateQueries({ queryKey: hkShiftKeys.all });
      qc.invalidateQueries({ queryKey: hkTaskKeys.all });

      if (options.notifyCleaning && event.status === "cleaning") {
        toast.info("ມີຫ້ອງໃໝ່ຕ້ອງອານາໄມ", {
          description: event.roomNumber ? `ຫ້ອງ ${event.roomNumber}` : undefined,
        });
      }

      if (
        options.notifyRoomReady &&
        event.status === "available" &&
        event.taskId
      ) {
        const description = event.roomNumber
          ? `ຫ້ອງ ${event.roomNumber} ພ້ອມຮັບແຂກ`
          : undefined;
        toast.success("ອານາໄມຫ້ອງສຳເລັດ", { description });
        notify({
          title: "ຫ້ອງພ້ອມໃຊ້",
          description,
          type: "success",
          to: "/app/front-desk",
        });
      }

      if (options.osNotifyCleaning && event.status === "cleaning") {
        showCleaningNotification(event);
      }

      if (
        options.osNotifyRoomReady &&
        event.status === "available" &&
        event.taskId
      ) {
        showRoomReadyNotification(event);
      }
    };

    const handleDirectBookingCreated = (message: MessageEvent<string>) => {
      const event = JSON.parse(message.data) as DirectBookingCreatedEvent;
      invalidateReservationData();

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

    const handleChannelReservationImported = (
      message: MessageEvent<string>,
    ) => {
      const event = JSON.parse(
        message.data,
      ) as ChannelReservationImportedEvent;
      invalidateReservationData();

      if (!options.notifyChannelBooking) return;

      const payload = getChannelReservationNotification(event);
      toast.info(payload.title, { description: payload.description });
      notify(payload);
    };

    source.addEventListener("room_status_changed", handleRoomStatusChanged);
    source.addEventListener(
      "direct_booking_created",
      handleDirectBookingCreated,
    );
    source.addEventListener(
      "channel_reservation_imported",
      handleChannelReservationImported,
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
      source.removeEventListener(
        "channel_reservation_imported",
        handleChannelReservationImported,
      );
      source.close();
    };
  }, [
    enabled,
    options.notifyChannelBooking,
    options.notifyCleaning,
    options.notifyDirectBooking,
    options.notifyRoomReady,
    options.osNotifyCleaning,
    options.osNotifyRoomReady,
    notify,
    qc,
  ]);
}
