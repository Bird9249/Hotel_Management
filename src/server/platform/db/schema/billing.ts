import { numeric, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { reservation } from "./reservations";

export const cashShift = pgTable("cash_shift", {
  id: text("id").primaryKey(),
  status: text("status").notNull().default("open"),
  openedByUserId: text("opened_by_user_id")
    .notNull()
    .references(() => user.id, { onDelete: "restrict" }),
  openedAt: timestamp("opened_at").notNull().defaultNow(),
  openingCash: numeric("opening_cash", { precision: 12, scale: 2 }).notNull(),
  closedByUserId: text("closed_by_user_id").references(() => user.id, {
    onDelete: "restrict",
  }),
  closedAt: timestamp("closed_at"),
  closingCashCounted: numeric("closing_cash_counted", {
    precision: 12,
    scale: 2,
  }),
  cashReceived: numeric("cash_received", { precision: 12, scale: 2 }),
  transferReceived: numeric("transfer_received", { precision: 12, scale: 2 }),
  cardReceived: numeric("card_received", { precision: 12, scale: 2 }),
  expectedCash: numeric("expected_cash", { precision: 12, scale: 2 }),
  variance: numeric("variance", { precision: 12, scale: 2 }),
  handoverNote: text("handover_note"),
});

export const invoice = pgTable("invoice", {
  id: text("id").primaryKey(),
  reservationId: text("reservation_id")
    .notNull()
    .references(() => reservation.id, { onDelete: "restrict" }),
  subtotal: numeric("subtotal", { precision: 12, scale: 2 })
    .notNull()
    .default("0"),
  taxRate: numeric("tax_rate", { precision: 5, scale: 2 })
    .notNull()
    .default("0"),
  taxAmount: numeric("tax_amount", { precision: 12, scale: 2 })
    .notNull()
    .default("0"),
  total: numeric("total", { precision: 12, scale: 2 }).notNull().default("0"),
  status: text("status").notNull().default("unpaid"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const invoiceItem = pgTable("invoice_item", {
  id: text("id").primaryKey(),
  invoiceId: text("invoice_id")
    .notNull()
    .references(() => invoice.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  qty: numeric("qty", { precision: 12, scale: 2 }).notNull().default("1"),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
});

export const payment = pgTable("payment", {
  id: text("id").primaryKey(),
  invoiceId: text("invoice_id")
    .notNull()
    .references(() => invoice.id, { onDelete: "cascade" }),
  method: text("method").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  paidAt: timestamp("paid_at").notNull().defaultNow(),
  shiftId: text("shift_id").references(() => cashShift.id, {
    onDelete: "set null",
  }),
  recordedByUserId: text("recorded_by_user_id").references(() => user.id, {
    onDelete: "set null",
  }),
});
