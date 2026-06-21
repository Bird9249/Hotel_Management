import {
  boolean,
  date,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { roomType } from "./rooms";

export const salesChannel = pgTable("sales_channel", {
  id: text("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  config: jsonb("config"),
  lastSyncAt: timestamp("last_sync_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const channelRoomMapping = pgTable(
  "channel_room_mapping",
  {
    id: text("id").primaryKey(),
    channelId: text("channel_id")
      .notNull()
      .references(() => salesChannel.id, { onDelete: "cascade" }),
    roomTypeId: text("room_type_id")
      .notNull()
      .references(() => roomType.id, { onDelete: "restrict" }),
    externalRoomTypeId: text("external_room_type_id").notNull(),
    allotment: integer("allotment"),
  },
  (table) => [
    uniqueIndex("channel_room_mapping_channel_room_type_unique").on(
      table.channelId,
      table.roomTypeId,
    ),
  ],
);

export const inventoryHold = pgTable("inventory_hold", {
  id: text("id").primaryKey(),
  roomTypeId: text("room_type_id")
    .notNull()
    .references(() => roomType.id, { onDelete: "cascade" }),
  checkInDate: date("check_in_date").notNull(),
  checkOutDate: date("check_out_date").notNull(),
  quantity: integer("quantity").notNull().default(1),
  source: text("source").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const channelSyncLog = pgTable("channel_sync_log", {
  id: text("id").primaryKey(),
  channelId: text("channel_id")
    .notNull()
    .references(() => salesChannel.id, { onDelete: "cascade" }),
  direction: text("direction").notNull(),
  operation: text("operation").notNull(),
  status: text("status").notNull(),
  requestSummary: jsonb("request_summary"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
