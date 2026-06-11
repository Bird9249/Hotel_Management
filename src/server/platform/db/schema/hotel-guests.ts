import { pgTable, text } from "drizzle-orm/pg-core";

export const guest = pgTable("guest", {
  id: text("id").primaryKey(),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  idDocument: text("id_document"),
  nationality: text("nationality"),
});
