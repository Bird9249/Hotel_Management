import { integer, numeric, pgTable, text } from "drizzle-orm/pg-core";

export const roomType = pgTable("room_type", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  basePrice: numeric("base_price", { precision: 12, scale: 2 }).notNull(),
  capacity: integer("capacity").notNull().default(2),
});

export const room = pgTable("room", {
  id: text("id").primaryKey(),
  roomNumber: text("room_number").notNull().unique(),
  floor: integer("floor"),
  roomTypeId: text("room_type_id")
    .notNull()
    .references(() => roomType.id, { onDelete: "restrict" }),
  status: text("status").notNull().default("available"),
});
