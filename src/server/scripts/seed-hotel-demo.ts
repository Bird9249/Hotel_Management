#!/usr/bin/env bun

import { addDays, format, subHours } from "date-fns";
import { eq, like, sql } from "drizzle-orm";
import { db } from "@/server/platform/db/client";
import { user } from "@/server/platform/db/schema/auth";
import {
  channelRoomMapping,
  channelSyncLog,
  salesChannel,
} from "@/server/platform/db/schema/channels";
import { guest } from "@/server/platform/db/schema/hotel-guests";
import { hkRoomTask, hkShift } from "@/server/platform/db/schema/housekeeping";
import { userRole } from "@/server/platform/db/schema/rbac";
import { reservation } from "@/server/platform/db/schema/reservations";
import { room, roomType } from "@/server/platform/db/schema/rooms";
import { logger } from "@/server/platform/observability/logger";
import type { DbTransaction } from "@/shared/types";
import { clearDemoSeedData, DEMO_PREFIX } from "./demo-seed-shared";

function isoDate(date: Date) {
  return format(date, "yyyy-MM-dd");
}

const DEMO_ROOM_TYPES = [
  {
    id: `${DEMO_PREFIX}room-type-standard`,
    name: "ຫ້ອງມາດຕະຖານ",
    description: "ຫ້ອງພັກມາດຕະຖານ ມີຕຽງຄູ່ ແລະ ຫ້ອງນ້ຳສ່ວນຕົວ",
    basePrice: "450000",
    capacity: 2,
  },
  {
    id: `${DEMO_PREFIX}room-type-deluxe`,
    name: "ຫ້ອງດີລັກ",
    description: "ຫ້ອງກວ້າງຂວາງ ມີວິວເມືອງ ແລະ ມິນິບາ",
    basePrice: "750000",
    capacity: 2,
  },
  {
    id: `${DEMO_PREFIX}room-type-suite`,
    name: "ຊຸດ",
    description: "ຫ້ອງຊຸດພິເສດ ມີຫ້ອງນັ່ງລິວິງ ແລະ ອ່າງອາບນ້ຳ",
    basePrice: "1200000",
    capacity: 4,
  },
] as const;

const DEMO_CHANNELS = [
  {
    id: "channel_agoda",
    code: "agoda",
    name: "Agoda",
    isActive: true,
    config: { adapter: "mock_ota", consecutiveFailures: 0 },
    lastSyncAt: subHours(new Date(), 1),
  },
  {
    id: "channel_booking_com",
    code: "booking_com",
    name: "Booking.com",
    isActive: true,
    config: { adapter: "booking_com_mock", consecutiveFailures: 0 },
    lastSyncAt: subHours(new Date(), 2),
  },
  {
    id: "channel_expedia",
    code: "expedia",
    name: "Expedia",
    isActive: false,
    config: {},
  },
] as const;

const DEMO_CHANNEL_MAPPINGS = [
  {
    id: `${DEMO_PREFIX}mapping-agoda-deluxe`,
    channelId: "channel_agoda",
    roomTypeId: `${DEMO_PREFIX}room-type-deluxe`,
    externalRoomTypeId: "AGD-DLX-001",
    allotment: 1,
  },
  {
    id: `${DEMO_PREFIX}mapping-booking-standard`,
    channelId: "channel_booking_com",
    roomTypeId: `${DEMO_PREFIX}room-type-standard`,
    externalRoomTypeId: "BDC-STD-001",
    allotment: 1,
  },
] as const;

const DEMO_SYNC_LOGS = [
  {
    id: `${DEMO_PREFIX}sync-agoda-success`,
    channelId: "channel_agoda",
    direction: "push",
    operation: "availability",
    status: "success",
    requestSummary: { from: isoDate(new Date()), pushedCount: 1 },
    errorMessage: null,
  },
  {
    id: `${DEMO_PREFIX}sync-booking-success`,
    channelId: "channel_booking_com",
    direction: "push",
    operation: "availability",
    status: "success",
    requestSummary: { from: isoDate(new Date()), pushedCount: 1 },
    errorMessage: null,
  },
] as const;

const DEMO_ROOMS = [
  {
    id: `${DEMO_PREFIX}room-101`,
    roomNumber: "101",
    floor: 1,
    roomTypeId: `${DEMO_PREFIX}room-type-standard`,
    status: "available",
  },
  {
    id: `${DEMO_PREFIX}room-102`,
    roomNumber: "102",
    floor: 1,
    roomTypeId: `${DEMO_PREFIX}room-type-standard`,
    status: "occupied",
  },
  {
    id: `${DEMO_PREFIX}room-103`,
    roomNumber: "103",
    floor: 1,
    roomTypeId: `${DEMO_PREFIX}room-type-deluxe`,
    status: "available",
  },
  {
    id: `${DEMO_PREFIX}room-104`,
    roomNumber: "104",
    floor: 1,
    roomTypeId: `${DEMO_PREFIX}room-type-deluxe`,
    status: "cleaning",
  },
  {
    id: `${DEMO_PREFIX}room-201`,
    roomNumber: "201",
    floor: 2,
    roomTypeId: `${DEMO_PREFIX}room-type-deluxe`,
    status: "available",
  },
  {
    id: `${DEMO_PREFIX}room-202`,
    roomNumber: "202",
    floor: 2,
    roomTypeId: `${DEMO_PREFIX}room-type-suite`,
    status: "available",
  },
  {
    id: `${DEMO_PREFIX}room-203`,
    roomNumber: "203",
    floor: 2,
    roomTypeId: `${DEMO_PREFIX}room-type-suite`,
    status: "maintenance",
  },
] as const;

const DEMO_HK_SHIFT_ID = `${DEMO_PREFIX}hk-shift-open`;

async function getDemoHousekeepingUserId(client: DbTransaction) {
  const [housekeepingUser] = await client
    .select({ id: user.id })
    .from(user)
    .innerJoin(userRole, eq(userRole.userId, user.id))
    .where(eq(userRole.roleId, "housekeeping"))
    .limit(1);
  if (housekeepingUser?.id) return housekeepingUser.id;

  const [adminUser] = await client
    .select({ id: user.id })
    .from(user)
    .innerJoin(userRole, eq(userRole.userId, user.id))
    .where(eq(userRole.roleId, "admin"))
    .limit(1);
  if (adminUser?.id) return adminUser.id;

  const [fallbackUser] = await client
    .select({ id: user.id })
    .from(user)
    .limit(1);
  return fallbackUser?.id ?? null;
}

const DEMO_GUESTS = [
  {
    id: `${DEMO_PREFIX}guest-somchai`,
    fullName: "ສົມໄຊ ວົງສະຫວັນ",
    phone: "020 55123456",
    idDocument: "P1234567",
    nationality: "ລາວ",
  },
  {
    id: `${DEMO_PREFIX}guest-noy`,
    fullName: "ນ້ອຍ ພົມມະຈັນ",
    phone: "020 99887766",
    idDocument: "N9876543",
    nationality: "ລາວ",
  },
  {
    id: `${DEMO_PREFIX}guest-john`,
    fullName: "John Smith",
    phone: "+66 81 234 5678",
    idDocument: "US44556677",
    nationality: "ອາເມລິກາ",
  },
  {
    id: `${DEMO_PREFIX}guest-lin`,
    fullName: "Lin Wei",
    phone: "+86 138 0000 1111",
    idDocument: "CN88990011",
    nationality: "ຈີນ",
  },
  {
    id: `${DEMO_PREFIX}guest-anna`,
    fullName: "Anna Müller",
    phone: "+49 170 1234567",
    idDocument: "DE11223344",
    nationality: "ເຢຍລະມັນ",
  },
] as const;

function buildDemoReservations(today: Date) {
  return [
    {
      id: `${DEMO_PREFIX}res-101-upcoming`,
      guestId: `${DEMO_PREFIX}guest-somchai`,
      roomId: `${DEMO_PREFIX}room-101`,
      checkInDate: isoDate(addDays(today, 2)),
      checkOutDate: isoDate(addDays(today, 5)),
      guestsCount: 2,
      status: "booked",
      source: "direct_web",
      channelId: null,
      externalBookingId: `${DEMO_PREFIX}direct-101-upcoming`,
    },
    {
      id: `${DEMO_PREFIX}res-102-stay`,
      guestId: `${DEMO_PREFIX}guest-noy`,
      roomId: `${DEMO_PREFIX}room-102`,
      checkInDate: isoDate(addDays(today, -1)),
      checkOutDate: isoDate(today),
      guestsCount: 1,
      status: "checked_in",
      source: "front_desk",
      channelId: null,
      externalBookingId: null,
    },
    {
      id: `${DEMO_PREFIX}res-103-booked`,
      guestId: `${DEMO_PREFIX}guest-john`,
      roomId: `${DEMO_PREFIX}room-103`,
      checkInDate: isoDate(addDays(today, 7)),
      checkOutDate: isoDate(addDays(today, 10)),
      guestsCount: 2,
      status: "booked",
      source: "agoda",
      channelId: "channel_agoda",
      externalBookingId: `${DEMO_PREFIX}agoda-103-booked`,
    },
    {
      id: `${DEMO_PREFIX}res-201-booked`,
      guestId: `${DEMO_PREFIX}guest-lin`,
      roomId: `${DEMO_PREFIX}room-201`,
      checkInDate: isoDate(today),
      checkOutDate: isoDate(addDays(today, 3)),
      guestsCount: 3,
      status: "booked",
      source: "booking_com",
      channelId: "channel_booking_com",
      externalBookingId: `${DEMO_PREFIX}booking-201-booked`,
    },
    {
      id: `${DEMO_PREFIX}res-202-suite`,
      guestId: `${DEMO_PREFIX}guest-anna`,
      roomId: `${DEMO_PREFIX}room-202`,
      checkInDate: isoDate(addDays(today, 14)),
      checkOutDate: isoDate(addDays(today, 18)),
      guestsCount: 4,
      status: "booked",
      source: "direct_web",
      channelId: null,
      externalBookingId: `${DEMO_PREFIX}direct-202-suite`,
    },
    {
      id: `${DEMO_PREFIX}res-cancelled`,
      guestId: `${DEMO_PREFIX}guest-john`,
      roomId: `${DEMO_PREFIX}room-104`,
      checkInDate: isoDate(addDays(today, -10)),
      checkOutDate: isoDate(addDays(today, -7)),
      guestsCount: 2,
      status: "cancelled",
      source: "expedia",
      channelId: "channel_expedia",
      externalBookingId: `${DEMO_PREFIX}expedia-cancelled`,
    },
    {
      id: `${DEMO_PREFIX}res-done`,
      guestId: `${DEMO_PREFIX}guest-john`,
      roomId: `${DEMO_PREFIX}room-103`,
      checkInDate: isoDate(addDays(today, -3)),
      checkOutDate: isoDate(addDays(today, -1)),
      guestsCount: 2,
      status: "checked_out",
      source: "front_desk",
      channelId: null,
      externalBookingId: null,
    },
    {
      id: `${DEMO_PREFIX}res-done-2`,
      guestId: `${DEMO_PREFIX}guest-anna`,
      roomId: `${DEMO_PREFIX}room-202`,
      checkInDate: isoDate(addDays(today, -5)),
      checkOutDate: isoDate(addDays(today, -2)),
      guestsCount: 4,
      status: "checked_out",
      source: "direct_web",
      channelId: null,
      externalBookingId: `${DEMO_PREFIX}direct-done-2`,
    },
  ] as const;
}

async function seedHotelDemo() {
  try {
    logger.info("Starting hotel demo seed (Phase 1 + 2)...");

    const today = new Date();
    const demoReservations = buildDemoReservations(today);

    await db.transaction(async (tx) => {
      logger.info("Clearing previous demo data...");
      await clearDemoSeedData(tx);

      logger.info("Seeding sales channels...");
      await tx
        .insert(salesChannel)
        .values([...DEMO_CHANNELS])
        .onConflictDoUpdate({
          target: salesChannel.code,
          set: {
            name: sql`excluded.name`,
            isActive: sql`excluded.is_active`,
            config: sql`excluded.config`,
            lastSyncAt: sql`excluded.last_sync_at`,
          },
        });

      logger.info("Removing legacy direct_web sales channel...");
      await tx
        .update(reservation)
        .set({ channelId: null })
        .where(eq(reservation.source, "direct_web"));
      await tx.delete(salesChannel).where(eq(salesChannel.code, "direct_web"));

      logger.info("Clearing previous demo sync logs...");
      await tx
        .delete(channelSyncLog)
        .where(like(channelSyncLog.id, `${DEMO_PREFIX}%`));

      logger.info("Seeding room types...");
      await tx.insert(roomType).values([...DEMO_ROOM_TYPES]);

      logger.info("Seeding rooms...");
      await tx.insert(room).values([...DEMO_ROOMS]);

      logger.info("Seeding guests...");
      await tx.insert(guest).values([...DEMO_GUESTS]);

      logger.info("Seeding channel room mappings...");
      await tx.insert(channelRoomMapping).values([...DEMO_CHANNEL_MAPPINGS]);

      logger.info("Seeding channel sync logs...");
      await tx.insert(channelSyncLog).values([...DEMO_SYNC_LOGS]);

      logger.info("Seeding reservations...");
      await tx.insert(reservation).values([...demoReservations]);

      const housekeepingUserId = await getDemoHousekeepingUserId(tx);
      if (housekeepingUserId) {
        const cleaningRooms = DEMO_ROOMS.filter(
          (demoRoom) => demoRoom.status === "cleaning",
        );

        logger.info("Seeding housekeeping shift and tasks...");
        await tx.insert(hkShift).values({
          id: DEMO_HK_SHIFT_ID,
          status: "open",
          openedByUserId: housekeepingUserId,
          openedAt: subHours(new Date(), 2),
        });

        if (cleaningRooms.length > 0) {
          await tx.insert(hkRoomTask).values(
            cleaningRooms.map((demoRoom) => ({
              id: `${DEMO_PREFIX}hk-task-${demoRoom.id.replace(DEMO_PREFIX, "")}`,
              shiftId: DEMO_HK_SHIFT_ID,
              roomId: demoRoom.id,
              status: "pending",
            })),
          );
        }
      } else {
        logger.warn(
          "Skipping housekeeping shift seed because no user exists in the database.",
        );
      }
    });

    logger.info("Hotel demo seed completed!");
    logger.info(
      `  Room types: ${DEMO_ROOM_TYPES.length}, Rooms: ${DEMO_ROOMS.length}, Guests: ${DEMO_GUESTS.length}, Reservations: ${demoReservations.length}`,
    );
    logger.info(
      `  Channels: ${DEMO_CHANNELS.length}, Mappings: ${DEMO_CHANNEL_MAPPINGS.length}, Sync logs: ${DEMO_SYNC_LOGS.length}`,
    );
    logger.info(
      "  Housekeeping: open shift + cleaning room tasks seeded when a user exists",
    );
    logger.info(
      `  Calendar range: ${isoDate(today)} → ${isoDate(addDays(today, 14))} (use /app/calendar)`,
    );
  } catch (error) {
    logger.error("Hotel demo seed failed:", error);
    process.exit(1);
  }
}

seedHotelDemo();
