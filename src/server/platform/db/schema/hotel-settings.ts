import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

/** Singleton row (id = default) — ข้อมูลโรงแรมบนใบบิล */
export const hotelSettings = pgTable("hotel_settings", {
  id: text("id").primaryKey().default("default"),
  name: text("name").notNull().default(""),
  nameEn: text("name_en"),
  address: text("address"),
  phone: text("phone"),
  taxId: text("tax_id"),
  logoKey: text("logo_key"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
