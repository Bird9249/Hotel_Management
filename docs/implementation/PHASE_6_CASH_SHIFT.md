# Phase 6 — Cash Shift / Cash Drawer (ກະເງິນສົດ Reception)

> เป้าหมาย: ระบบเปิด–ปิดกะเงินสด (Cash Drawer / Shift Handover) สำหรับ Reception
> Dependencies: Phase 0 (`billing:*` permission), Phase 4 (ตาราง `payment` — ต้องมีการบันทึกชำระเงินก่อน)
> ต่อยอดในโมดูลเดิม: `src/modules/billing` (+ schema `billing.ts`)

> **หมายเหตุลำดับงาน:** จากมุมธุรกิจ feature นี้เป็น **MVP ขาดไม่ได้สำหรับ Reception** ตั้งแต่วันแรกที่รับเงิน
> แต่ทางเทคนิคต้องทำ **หลัง Phase 4** เพราะสรุปยอดกะดึงจาก `payment` ที่บันทึกผ่าน `billing:payment`

---

## 1. ขอบเขต (MVP)

| Feature | รายละเอียด |
|---------|------------|
| **Open Shift** | ปุ่มเปิดกะ + บันทึกพนักงานที่เข้าเวน (จาก session) + เวลาเปิด |
| **Opening Cash** | บันทึกเงินตั้งต้นในลิ้นชัก (opening balance) |
| **รับชำระในกะ** | การชำระเงินที่บันทึกระหว่างกะเปิดอยู่ ผูกกับ `shift_id` อัตโนมัติ |
| **Close Shift** | สรุปยอดรับเข้าทั้งกะ (แยก cash / โอน / บัตร) + นับเงินสดจริง + บันทึกส่งมอบ |
| **ประวัติกะ** | Admin ดูประวัติกะที่ปิดแล้ว + variance (เงินขาด/เกิน) |

**นอกขอบเขต MVP (Phase ถัดไป):**
- หลายลิ้นชัก (multi-drawer) ต่อสาขา
- อนุมัติส่งมอบข้ามกะ (manager sign-off)
- พิมพ์ใบสรุปกะ (thermal printer)
- ผูกกับรายงาน Daily Sales แยกตามกะ

---

## 2. กฎธุรกิจ (Business Rules)

```
1. มีกะที่ status = "open" ได้ทีละ 1 กะต่อระบบ (single drawer MVP)
2. เปิดกะได้เมื่อไม่มีกะ open อยู่ — ถ้ามีแล้วต้องปิดกะเดิมก่อน
3. ปิดกะได้เฉพาะผู้ที่เปิดกะ (opened_by) หรือ Admin
4. บันทึก payment ระหว่างมีกะ open → ผูก shift_id อัตโนมัติ
5. บันทึก payment แบบ cash ขณะไม่มีกะ open → แจ้งเตือน (MVP: warn ไม่ block;
   ถ้าต้องการเข้มงวดให้ block เฉพาะ method = "cash" ใน Phase ถัดไป)
6. สรุปยอดกะคำนวณจาก payment ที่ shift_id ตรงกัน (ไม่ใช้ช่วงเวลาอย่างเดียว)
```

### สูตรสรุปตอนปิดกะ

```
cashReceived     = SUM(payment.amount WHERE method = 'cash' AND shift_id = :id)
transferReceived = SUM(payment.amount WHERE method = 'bank_transfer' AND shift_id = :id)
cardReceived     = SUM(payment.amount WHERE method = 'credit_card' AND shift_id = :id)

expectedCashInDrawer = openingCash + cashReceived
variance             = closingCashCounted - expectedCashInDrawer   // บันทึกตอนปิดกะ
```

---

## 3. Database Schema

แก้ `src/server/platform/db/schema/billing.ts` — เพิ่มตาราง `cash_shift` และคอลัมน์ใน `payment`:

```ts
import { user } from "./auth"; // หรือ path ตาราง user ที่มีในโปรเจกต์

export const cashShift = pgTable("cash_shift", {
  id: text("id").primaryKey(),
  // open | closed
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
  // เงินสดที่นับได้จริงตอนปิดกะ
  closingCashCounted: numeric("closing_cash_counted", { precision: 12, scale: 2 }),
  // snapshot ตอนปิด (เก็บไว้ audit แม้ payment ถูกแก้ภายหลัง)
  cashReceived: numeric("cash_received", { precision: 12, scale: 2 }),
  transferReceived: numeric("transfer_received", { precision: 12, scale: 2 }),
  cardReceived: numeric("card_received", { precision: 12, scale: 2 }),
  expectedCash: numeric("expected_cash", { precision: 12, scale: 2 }),
  variance: numeric("variance", { precision: 12, scale: 2 }),
  handoverNote: text("handover_note"),
});

// เพิ่มใน payment (migration แยก column)
export const payment = pgTable("payment", {
  // ... ฟิลด์เดิม ...
  shiftId: text("shift_id").references(() => cashShift.id, { onDelete: "set null" }),
  recordedByUserId: text("recorded_by_user_id").references(() => user.id, {
    onDelete: "set null",
  }),
});
```

รัน `bun run db:generate` แล้ว `bun run db:migrate`

> หมายเหตุ: `payment.shift_id` เป็น nullable — payment เก่าก่อนมี feature นี้ยังใช้งานได้
> ตัวเลขเงินใช้ `numeric` + helper `toMoney()` / `formatMoney()` เหมือน Phase 4

---

## 4. Permission (RBAC)

เพิ่มใน `src/modules/roles/domain/contracts/permissions.ts`:

```ts
billing: {
  read: "billing:read",
  invoice: "billing:invoice",
  payment: "billing:payment",
  shift: "billing:shift",   // เปิด/ปิดกะ + ดูกะปัจจุบัน
},
```

| Action | Permission | Admin | Receptionist |
|--------|------------|:-----:|:------------:|
| เปิด/ปิดกะ | `billing:shift` | ✓ | ✓ |
| ดูกะปัจจุบัน + สรุป | `billing:shift` | ✓ | ✓ |
| ดูประวัติกะทั้งหมด | `billing:read` | ✓ | — (MVP) |
| บันทึก payment | `billing:payment` | ✓ | ✓ |

เพิ่ม label ภาษาลาวใน `ACTION_LABELS`: `shift: "ກະເງິນສົດ"`

รัน `bun run rbac:sync` แล้วอัปเดต role `receptionist` ให้มี `billing:shift`

---

## 5. Domain Layer (`src/modules/billing/domain`)

### contracts/cash-shift.ts

```ts
export const OpenShiftSchema = z.object({
  openingCash: z.number().nonnegative(),
});

export const CloseShiftSchema = z.object({
  closingCashCounted: z.number().nonnegative(),
  handoverNote: z.string().max(500).optional(),
});

export const ShiftStatusSchema = z.enum(["open", "closed"]);
```

### repo

| ไฟล์ | หน้าที่ |
|------|---------|
| `get-open-shift.ts` | ดึงกะที่ `status = open` (มีได้สูงสุด 1) |
| `get-shift-by-id.ts` | ดึงกะ + join ชื่อผู้เปิด/ปิด |
| `list-shifts.ts` | ประวัติกะ (filter วันที่ / status) |
| `insert-shift.ts` | สร้างกะใหม่ |
| `close-shift.ts` | อัปเดต status, ยอดสรุป, variance |
| `sum-payments-by-shift.ts` | รวมยอดแยกตาม `method` ของกะ |

### service/open-shift.ts

```
1. ตรวจว่าไม่มีกะ open อยู่ → ถ้ามี throw SHIFT_ALREADY_OPEN
2. insert cash_shift { status: open, openedByUserId, openingCash }
3. return shift detail + openedBy display name
```

### service/close-shift.ts

```
1. ดึง shift by id → ต้อง status = open
2. ตรวจสิทธิ์: user เป็น openedBy หรือมีสิทธิ์ admin (billing:read ทุกกะ)
3. sums = sum-payments-by-shift(shiftId)
4. expectedCash = openingCash + sums.cash
5. variance = closingCashCounted - expectedCash
6. update shift: status=closed, closedAt, closedBy, snapshots, variance, handoverNote
7. return สรุปส่งมอบ (พร้อมรายการ payment ล่าสุด optional)
```

### service/get-current-shift.ts

```
1. get-open-shift()
2. ถ้ามี → คำนวณยอดสะสมระหว่างกะ (live totals จาก payment)
3. return { shift, totals: { cash, transfer, card }, expectedCash }
```

### แก้ `service/add-payment.ts`

```
1. ... logic เดิม ...
2. openShift = get-open-shift()
3. insert payment พร้อม:
   - shiftId: openShift?.id ?? null
   - recordedByUserId: currentUserId
```

### http/billing.routes.ts (เพิ่ม endpoints)

| Method | Path | Permission | คำอธิบาย |
|--------|------|------------|----------|
| GET | `/cash-shifts/current` | `billing:shift` | กะที่เปิดอยู่ + ยอดสะสม |
| POST | `/cash-shifts/open` | `billing:shift` | เปิดกะ |
| POST | `/cash-shifts/:id/close` | `billing:shift` | ปิดกะ |
| GET | `/cash-shifts` | `billing:read` | ประวัติกะ (Admin) |
| GET | `/cash-shifts/:id` | `billing:read` หรือ `billing:shift` (เจ้าของกะ) | รายละเอียดกะ |

> ใส่ routes ใน `billingRoutes` เดิม ไม่ต้องแยก module ใหม่

---

## 6. Presentation Layer

### api

`presentation/api/client.ts` + `queries.ts`:

```ts
useCurrentShiftQuery()      // poll ทุก 30s หรือ invalidate หลัง payment
useOpenShift()
useCloseShift()
useShiftsQuery(filters)     // Admin history
useShiftQuery(id)
```

### ui

| Component | หน้าที่ |
|-----------|---------|
| `ShiftStatusBar.tsx` | แถบสถานะบน Front Desk / Billing — แสดงกะเปิด/ปิด, ปุ่ม Open/Close |
| `OpenShiftDialog.tsx` | ฟอร์ม opening cash |
| `CloseShiftDialog.tsx` | สรุปยอดกะ + input นับเงินจริง + หมายเหตุส่งมอบ |
| `ShiftSummaryCard.tsx` | การ์ดยอด cash / โอน / บัตร + expected cash |
| `ShiftHistoryTable.tsx` | ตารางประวัติ (Admin) |
| `ShiftVarianceBadge.tsx` | แสดงขาด/เกิน (สีเขียว=ตรง, แดง=มี variance) |

### pages

- `CashShiftPage.tsx` — หน้าหลักจัดการกะ (สรุปปัจจุบัน + ประวัติถ้าเป็น Admin)
- หรือฝัง `ShiftStatusBar` ใน `FrontDeskPage` + `InvoiceDetailPage` แทนหน้าแยก (แนะนำ MVP)

### UX Flow

```
[ไม่มีกะเปิด]
  → Reception เห็น banner "ຍັງບໍ່ໄດ້ເປີດກະເງິນສົດ"
  → กด "ເປີດກະ" → กรอก opening cash → ยืนยัน

[มีกะเปิด]
  → แถบแสดง: ພະນັກງານ, ເວລາເປີດ, ເງິນຕັ້ງຕົ້ນ, ຮັບເງິນສົດສະສົມ, ໂອນສະສົມ
  → บันทึก payment ตามปกติ (ยอดอัปเดตในแถบ)
  → กด "ປິດກະ" → เห็นสรุป → กรอกเงินที่นับได้ → บันทึกส่งมอบ

[ปิดกะแล้ว]
  → แสดงสรุป variance
  → กะถัดไปต้องกด Open ใหม่
```

---

## 7. Frontend Route + Sidebar

**ทางเลือก A (แนะนำ MVP):** ไม่เพิ่มเมนูแยก — ใช้ `ShiftStatusBar` ใน:
- `FrontDeskPage.tsx`
- `InvoicesPage.tsx` / `InvoiceDetailPage.tsx`
- `DashboardPage` Quick Action (ถ้ามี `billing:shift`)

**ทางเลือก B:** เพิ่มหน้าแยกสำหรับ Admin ดูประวัติ

`router.tsx`:
```tsx
const cashShiftsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/cash-shifts",
  component: () => (
    <RequirePermissions all={["billing:read"]}>
      <LazyPage><CashShiftPage /></LazyPage>
    </RequirePermissions>
  ),
});
```

`sidebar-data.tsx` (กลุ่ม "ການເງິນ & ລາຍງານ"):
```tsx
{
  title: "ກະເງິນສົດ",
  url: "/app/cash-shifts",
  icon: Banknote, // lucide-react
  requiredPermissions: ["billing:shift"],
},
```

`route-meta.ts`:
```ts
"/app/cash-shifts": { label: "ກະເງິນສົດ" },
```

---

## 8. เชื่อมกับ Phase 4 (Billing) และ Phase 5 (Reports)

### Billing
- `AddPaymentDialog` — หลังชำระสำเร็จ → `invalidateQueries` ของ `currentShift`
- ถ้าไม่มีกะเปิดและ method = cash → `toast.warning("ກະລຸນາເປີດກະເງິນສົດກ່ອນຮັບເງິນສົດ")`

### Reports (optional ใน MVP)
- Daily Sales ยังรวมจาก `payment` เหมือนเดิม
- Phase ถัดไป: เพิ่ม filter `shiftId` ในรายงาน

### Audit
- บันทึก audit event: `cash_shift.opened`, `cash_shift.closed` (ใช้ outbox ที่มีอยู่)
- snapshot ยอดตอนปิดกะเก็บในตาราง `cash_shift` แล้ว — ไม่พึ่ง re-calculate ย้อนหลัง

---

## 9. Task Checklist

### Database & RBAC
- [ ] เพิ่มตาราง `cash_shift` + คอลัมน์ `payment.shift_id`, `payment.recorded_by_user_id`
- [ ] migrate + seed ทดสอบ
- [ ] เพิ่ม permission `billing:shift` + label ลาว + `rbac:sync`
- [ ] อัปเดต role receptionist ให้มี `billing:shift`

### Domain
- [ ] contracts `OpenShiftSchema`, `CloseShiftSchema`
- [ ] repo ครบ (open shift, close, sum by shift, list)
- [ ] service `open-shift`, `close-shift`, `get-current-shift`
- [ ] แก้ `add-payment` ให้ผูก `shiftId` + `recordedByUserId`
- [ ] http routes + error mapping (`SHIFT_ALREADY_OPEN`, `SHIFT_NOT_FOUND`, `SHIFT_NOT_OWNER`)

### Presentation
- [ ] API client + query hooks
- [ ] `ShiftStatusBar`, `OpenShiftDialog`, `CloseShiftDialog`, `ShiftSummaryCard`
- [ ] ฝังแถบกะใน Front Desk + หน้า Invoice
- [ ] (optional) `CashShiftPage` + ประวัติ Admin
- [ ] frontend route + sidebar + route-meta (ถ้าทำหน้าแยก)

### Integration & QA
- [ ] ทดสอบ flow: เปิดกะ → รับชำระ cash/โอน → ปิดกะ → ตรวจ variance
- [ ] ทดสอบ: เปิดกะซ้อน (ต้อง error), ปิดกะโดยคนอื่น (ต้อง error ยกเว้น Admin)
- [ ] ทดสอบ payment เก่า (shift_id = null) ไม่พัง
- [ ] `bun run lint`

---

## 10. Acceptance Criteria

- Reception เปิดกะพร้อมบันทึก **opening cash** และ **ชื่อพนักงาน** (จาก session) ได้
- ระหว่างกะเปิด การชำระเงินถูกนับรวมในกะนั้น แยก **เงินสด / โอน / บัตร** ถูกต้อง
- ปิดกะแสดง **ยอดที่คาดหวังในลิ้นชัก** = opening + cash received
- กรอก **เงินที่นับได้จริง** แล้วระบบคำนวณ **variance** (ขาด/เกิน) ได้
- มีกะ open ได้ทีละ 1 กะ; ปิดแล้วดูประวัติสรุปได้ (Admin)
- UI ใช้ภาษาลาวตาม convention โปรเจกต์

---

## 11. ลำดับในภาพรวม MVP (อัปเดต)

```
Phase 4  Billing (payment table)
   │
Phase 6  Cash Shift  ← feature นี้
   │
Phase 5  Reporting (สามารถทำคู่ขนานได้ แต่ Cash Shift ควรก่อน go-live Reception)
```

> แนะนำ: ทำ Phase 6 ทันทีหลัง Phase 4 เสร็จ — ก่อนหรือคู่ขนาน Phase 5
> เพราะ Reception ใช้รับเงินจริงทุกวัน การไม่มีตัดกะจะทำให้ audit เงินสดทำไม่ได้ตั้งแต่วันแรก
