#!/usr/bin/env bun

import { addDays, format } from "date-fns";
import { like } from "drizzle-orm";
import { db } from "@/server/platform/db/client";
import { guest } from "@/server/platform/db/schema/hotel-guests";
import { reservation } from "@/server/platform/db/schema/reservations";
import { room, roomType } from "@/server/platform/db/schema/rooms";
import { logger } from "@/server/platform/observability/logger";

const DEMO_PREFIX = "demo-";

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
    },
    {
      id: `${DEMO_PREFIX}res-102-stay`,
      guestId: `${DEMO_PREFIX}guest-noy`,
      roomId: `${DEMO_PREFIX}room-102`,
      checkInDate: isoDate(addDays(today, -1)),
      checkOutDate: isoDate(today),
      guestsCount: 1,
      status: "checked_in",
    },
    {
      id: `${DEMO_PREFIX}res-103-booked`,
      guestId: `${DEMO_PREFIX}guest-john`,
      roomId: `${DEMO_PREFIX}room-103`,
      checkInDate: isoDate(addDays(today, 7)),
      checkOutDate: isoDate(addDays(today, 10)),
      guestsCount: 2,
      status: "booked",
    },
    {
      id: `${DEMO_PREFIX}res-201-booked`,
      guestId: `${DEMO_PREFIX}guest-lin`,
      roomId: `${DEMO_PREFIX}room-201`,
      checkInDate: isoDate(today),
      checkOutDate: isoDate(addDays(today, 3)),
      guestsCount: 3,
      status: "booked",
    },
    {
      id: `${DEMO_PREFIX}res-202-suite`,
      guestId: `${DEMO_PREFIX}guest-anna`,
      roomId: `${DEMO_PREFIX}room-202`,
      checkInDate: isoDate(addDays(today, 14)),
      checkOutDate: isoDate(addDays(today, 18)),
      guestsCount: 4,
      status: "booked",
    },
    {
      id: `${DEMO_PREFIX}res-cancelled`,
      guestId: `${DEMO_PREFIX}guest-john`,
      roomId: `${DEMO_PREFIX}room-104`,
      checkInDate: isoDate(addDays(today, -10)),
      checkOutDate: isoDate(addDays(today, -7)),
      guestsCount: 2,
      status: "cancelled",
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
      await tx
        .delete(reservation)
        .where(like(reservation.id, `${DEMO_PREFIX}%`));
      await tx.delete(guest).where(like(guest.id, `${DEMO_PREFIX}%`));
      await tx.delete(room).where(like(room.id, `${DEMO_PREFIX}%`));
      await tx.delete(roomType).where(like(roomType.id, `${DEMO_PREFIX}%`));

      logger.info("Seeding room types...");
      await tx.insert(roomType).values([...DEMO_ROOM_TYPES]);

      logger.info("Seeding rooms...");
      await tx.insert(room).values([...DEMO_ROOMS]);

      logger.info("Seeding guests...");
      await tx.insert(guest).values([...DEMO_GUESTS]);

      logger.info("Seeding reservations...");
      await tx.insert(reservation).values([...demoReservations]);
    });

    logger.info("Hotel demo seed completed!");
    logger.info(
      `  Room types: ${DEMO_ROOM_TYPES.length}, Rooms: ${DEMO_ROOMS.length}, Guests: ${DEMO_GUESTS.length}, Reservations: ${demoReservations.length}`,
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
