import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
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

type UseHousekeepingEventsOptions = {
  notifyCleaning?: boolean;
  osNotifyCleaning?: boolean;
};

type BrowserNotificationPermission = NotificationPermission | "unsupported";

type UseBrowserNotificationPermissionOptions = {
  autoRequest?: boolean;
};

function getBrowserNotificationPermission(): BrowserNotificationPermission {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission;
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

export function useBrowserNotificationPermission(
  options: UseBrowserNotificationPermissionOptions = {},
) {
  const [permission, setPermission] = useState<BrowserNotificationPermission>(
    () => getBrowserNotificationPermission(),
  );
  const autoRequested = useRef(false);

  const requestPermission = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setPermission("unsupported");
      toast.error("Browser ນີ້ບໍ່ຮອງຮັບ OS notification");
      return;
    }

    const next = await Notification.requestPermission();
    setPermission(next);

    if (next === "granted") {
      toast.success("ເປີດແຈ້ງເຕືອນສຳເລັດ");
    } else if (next === "denied") {
      toast.error("ບໍ່ສາມາດເປີດແຈ້ງເຕືອນໄດ້", {
        description: "ກະລຸນາອະນຸຍາດ Notification ໃນ browser settings",
      });
    }
  }, []);

  useEffect(() => {
    if (!options.autoRequest || autoRequested.current) return;
    if (permission !== "default") return;

    autoRequested.current = true;
    void requestPermission();
  }, [options.autoRequest, permission, requestPermission]);

  return {
    canRequest: permission === "default",
    isGranted: permission === "granted",
    isSupported: permission !== "unsupported",
    permission,
    requestPermission,
  };
}

export function useHousekeepingEvents(
  enabled = true,
  options: UseHousekeepingEventsOptions = {},
) {
  const qc = useQueryClient();

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

    source.addEventListener("room_status_changed", handleRoomStatusChanged);

    return () => {
      source.removeEventListener(
        "room_status_changed",
        handleRoomStatusChanged,
      );
      source.close();
    };
  }, [enabled, options.notifyCleaning, options.osNotifyCleaning, qc]);
}
