# Phase 4 — Billing & Invoicing (โมดูล `billing`)

> เป้าหมาย: ออกใบบิล, บันทึกการชำระเงินหลายช่องทาง, คำนวณภาษี
> Dependencies: Phase 2–3 (มี `reservation` ที่ checked_out), Phase 0 (permission `billing:*`)
> โมดูลใหม่: `src/modules/billing`

---

## 1. ขอบเขต

- **Invoicing**: ออกใบบิลค่าห้อง (ราคา/คืน × จำนวนคืน) + รายการบริการเพิ่มเติม
- **Payment Tracking**: บันทึกการชำระ (`cash` / `bank_transfer` / `credit_card`)
- **Tax Calculation**: คำนวณภาษีพื้นฐาน (อัตราตั้งค่าได้)

---

## 2. Database Schema

สร้าง `src/server/platform/db/schema/billing.ts`:

```ts
import { numeric, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { reservation } from "./reservations";

export const invoice = pgTable("invoice", {
  id: text("id").primaryKey(),
  reservationId: text("reservation_id").notNull().references(() => reservation.id, { onDelete: "restrict" }),
  subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull().default("0"),
  taxRate: numeric("tax_rate", { precision: 5, scale: 2 }).notNull().default("0"),     // %
  taxAmount: numeric("tax_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  total: numeric("total", { precision: 12, scale: 2 }).notNull().default("0"),
  // unpaid | partially_paid | paid
  status: text("status").notNull().default("unpaid"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const invoiceItem = pgTable("invoice_item", {
  id: text("id").primaryKey(),
  invoiceId: text("invoice_id").notNull().references(() => invoice.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  qty: numeric("qty", { precision: 12, scale: 2 }).notNull().default("1"),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
});

export const payment = pgTable("payment", {
  id: text("id").primaryKey(),
  invoiceId: text("invoice_id").notNull().references(() => invoice.id, { onDelete: "cascade" }),
  method: text("method").notNull(),    // cash | bank_transfer | credit_card
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  paidAt: timestamp("paid_at").notNull().defaultNow(),
});
```

เพิ่มใน `schema/index.ts`: `export * from "./billing";` แล้ว `db:generate` + `db:migrate`

> หมายเหตุ: ตัวเลขเงินใช้ `numeric` (drizzle คืนเป็น string) — ฝั่ง service ให้แปลงด้วย `Number()` ตอนคำนวณ แล้ว `.toFixed(2)` ตอนเก็บ เพื่อเลี่ยงปัญหา floating point

---

## 3. Domain Layer (`src/modules/billing/domain`)

### contracts
```ts
export const PaymentMethodSchema = z.enum(["cash", "bank_transfer", "credit_card"]);

export const InvoiceItemInputSchema = z.object({
  description: z.string().min(1),
  qty: z.number().positive().default(1),
  unitPrice: z.number().nonnegative(),
});

export const CreateInvoiceSchema = z.object({
  reservationId: z.string().min(1),
  taxRate: z.number().min(0).max(100).default(0),
  extraItems: z.array(InvoiceItemInputSchema).default([]),
});

export const AddPaymentSchema = z.object({
  method: PaymentMethodSchema,
  amount: z.number().positive(),
});
```

### repo
- `create-invoice.ts` + `insert-invoice-items.ts`
- `get-invoice-by-id.ts` (join items + payments), `list-invoices.ts`
- `add-payment.ts`, `list-payments-by-invoice.ts`
- `update-invoice-totals.ts` (set subtotal/tax/total/status)
- `sum-payments.ts` (รวมยอดชำระของ invoice)

### service/create-invoice.ts (logic หลัก)
```
1. ดึง reservation + room + room_type → คำนวณ จำนวนคืน = checkOut - checkIn
2. สร้าง line item ค่าห้อง: qty = nights, unitPrice = roomType.basePrice
3. รวม extraItems
4. subtotal = Σ amount
5. taxAmount = subtotal * taxRate / 100
6. total = subtotal + taxAmount
7. insert invoice + items (transaction เดียว), status = "unpaid"
```

### service/add-payment.ts
```
1. insert payment
2. paidTotal = sum-payments(invoiceId)
3. status = paidTotal >= total ? "paid" : paidTotal > 0 ? "partially_paid" : "unpaid"
4. update invoice.status
```

### http/billing.routes.ts
| Method | Path | Permission |
|--------|------|-----------|
| GET | `/invoices` | `billing:read` |
| GET | `/invoices/:id` | `billing:read` |
| POST | `/invoices` | `billing:invoice` |
| POST | `/invoices/:id/payments` | `billing:payment` |
| GET | `/invoices/:id/payments` | `billing:read` |

`api/index.ts` → `billingRoutes` (prefix `/hotel` หรือ `/billing`) + ลงทะเบียนใน `rest/index.ts`

---

## 4. เชื่อมกับ Phase 3 (Check-out)

ตัวเลือกการสร้าง invoice:
- **A (แนะนำ):** หน้า Check-out กดยืนยันแล้วเรียก `POST /invoices` ทันที (ส่ง `reservationId`) → เปิดหน้า invoice ให้รับชำระ
- **B:** สร้าง draft invoice อัตโนมัติใน `checkOutService` (Phase 3) แล้ว UI แค่เปิดมาดู

> เลือก A เพื่อแยกความรับผิดชอบให้ชัด (check-out = สถานะห้อง, invoice = การเงิน)

---

## 5. Presentation Layer

- `api/client.ts` + `queries.ts`: `useInvoicesQuery`, `useInvoiceQuery`, `useCreateInvoice`, `useAddPayment`
- ui:
  - `InvoicesTable.tsx` (เลขที่, ลูกค้า, total, สถานะ badge)
  - `InvoiceDetail.tsx` (รายการ items, ยอดรวม, ภาษี, ประวัติการชำระ, ยอดค้าง)
  - `AddPaymentDialog.tsx` (เลือก method + จำนวนเงิน)
  - `InvoicePrint.tsx` (เลย์เอาต์สำหรับพิมพ์ / export)
- pages: `InvoicesPage.tsx`, `InvoiceDetailPage.tsx`

---

## 6. Frontend Route + Sidebar

`router.tsx`:
```tsx
const invoicesRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/invoices",
  component: () => (
    <RequirePermissions all={["billing:read"]}>
      <LazyPage><InvoicesPage /></LazyPage>
    </RequirePermissions>
  ),
});
// invoiceDetail: /invoices/$id
```

`sidebar-data.tsx` (กลุ่ม "ໂຮງແຮມ"):
```tsx
{ title: "ໃບບິນ", url: "/app/invoices", icon: ReceiptText, requiredPermissions: ["billing:read"] },
```
`route-meta.ts`:
```ts
"/app/invoices": { label: "ໃບບິນ" },
"/app/invoices/$id": { label: "ລາຍລະອຽດໃບບິນ", parent: "/app/invoices" },
```

---

## 7. Task Checklist

- [ ] DB: `billing.ts` (invoice / invoice_item / payment) + re-export + migrate
- [ ] contracts (CreateInvoice, AddPayment, item)
- [ ] repo ครบ + `sum-payments`
- [ ] service `create-invoice` (คำนวณคืน/ภาษี/total) + `add-payment` (อัปเดต status)
- [ ] http routes + permission
- [ ] เชื่อม check-out → สร้าง invoice
- [ ] presentation: ตาราง, รายละเอียด, dialog ชำระเงิน, พิมพ์
- [ ] frontend route + sidebar + route-meta
- [ ] `bun run lint`

---

## 8. Acceptance Criteria

- สร้าง invoice จาก reservation ได้ โดยค่าห้อง = ราคา/คืน × จำนวนคืน ถูกต้อง
- เพิ่มรายการบริการอื่น (extra items) ได้
- ภาษีคำนวณถูกตามอัตราที่กำหนด และ total = subtotal + tax
- บันทึกการชำระหลายครั้ง/หลายช่องทาง แล้ว status เปลี่ยนเป็น `partially_paid` / `paid` ถูกต้อง
- พิมพ์/แสดงใบบิลได้
