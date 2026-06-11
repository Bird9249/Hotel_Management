import { date, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { guest } from "./hotel-guests";
import { room } from "./rooms";

export const reservation = pgTable("reservation", {
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
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
