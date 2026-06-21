import { sql } from "drizzle-orm";
import {
  date,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { salesChannel } from "./channels";
import { guest } from "./hotel-guests";
import { room } from "./rooms";

export const reservation = pgTable(
  "reservation",
  {
    id: text("id").primaryKey(),
    guestId: text("guest_id")
      .notNull()
      .references(() => guest.id, { onDelete: "restrict" }),
    roomId: text("room_id")
      .notNull()
      .references(() => room.id, { onDelete: "restrict" }),
    checkInDate: date("check_in_date").notNull(),
    checkOutDate: date("check_out_date").notNull(),
    guestsCount: integer("guests_count").notNull().default(1),
    status: text("status").notNull().default("booked"),
    source: text("source").notNull().default("front_desk"),
    channelId: text("channel_id").references(() => salesChannel.id, {
      onDelete: "set null",
    }),
    externalBookingId: text("external_booking_id"),
    externalPayload: jsonb("external_payload"),
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("reservation_channel_external_booking_unique")
      .on(table.channelId, table.externalBookingId)
      .where(sql`${table.externalBookingId} is not null`),
  ],
);
