import {
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { room } from "./rooms";

export const hkShift = pgTable("hk_shift", {
  id: text("id").primaryKey(),
  status: text("status").notNull().default("open"),
  openedByUserId: text("opened_by_user_id")
    .notNull()
    .references(() => user.id, { onDelete: "restrict" }),
  openedAt: timestamp("opened_at").notNull().defaultNow(),
  closedByUserId: text("closed_by_user_id").references(() => user.id, {
    onDelete: "restrict",
  }),
  closedAt: timestamp("closed_at"),
  roomsCompleted: integer("rooms_completed"),
  roomsPending: integer("rooms_pending"),
  handoverNote: text("handover_note"),
});

export const hkRoomTask = pgTable(
  "hk_room_task",
  {
    id: text("id").primaryKey(),
    shiftId: text("shift_id").references(() => hkShift.id, {
      onDelete: "set null",
    }),
    roomId: text("room_id")
      .notNull()
      .references(() => room.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("pending"),
    startedAt: timestamp("started_at"),
    completedAt: timestamp("completed_at"),
    completedByUserId: text("completed_by_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
  },
  (table) => [
    uniqueIndex("hk_room_task_shift_room_unique").on(
      table.shiftId,
      table.roomId,
    ),
  ],
);
