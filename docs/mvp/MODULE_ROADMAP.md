# Module Roadmap — ระบบจัดการโรงแรม (MVP)

> แผนการพัฒนาแบบแบ่งเป็นโมดูลและเฟส (Phase) เรียงตามลำดับการพึ่งพา (dependency)
> อ้างอิงภาพรวมจาก [`../PROJECT_OVERVIEW.md`](../PROJECT_OVERVIEW.md)

สัญลักษณ์สถานะ: ✅ พร้อมแล้ว · 🚧 กำลังทำ · ⬜ ยังไม่เริ่ม

---

## ภาพรวมลำดับการพัฒนา (Sequencing)

```
Phase 0  ฐานระบบ (auth / roles / users)          ✅
   │
Phase 1  Room Management (rooms + room types)     ✅
   │
Phase 2  Guest & Reservation (guests + booking)   ✅
   │
Phase 3  Front Desk Ops (check-in / check-out)    ✅
   │
Phase 4  Billing & Invoicing                      ✅
   │
Phase 6  Cash Shift (Reception drawer)            ✅
   │
Phase 5  Reporting (sales / occupancy)            ✅
```

> เหตุผลของลำดับ: ต้องมี "ห้อง" ก่อนจึงจะจองได้ → ต้องมี "การจอง" ก่อนจึงเช็คอินได้
> → ต้องเช็คเอาท์/มีการเข้าพักก่อนจึงออกบิลได้ → ต้องมี `payment` ก่อนตัดกะเงินสด
> → มีข้อมูลครบจึงทำรายงานได้

---

## Phase 0 — Foundation (✅)

| โมดูล | สถานะ | หมายเหตุ |
|-------|-------|----------|
| `auth` | ✅ | Better Auth — login / session |
| `roles` | ✅ | RBAC — Admin / Receptionist / Housekeeping |
| `users` | ✅ | จัดการบัญชีพนักงาน |
| `settings`, `audit`, `upload`, `dashboard` | ✅ | บริการกลาง + hotel branding |

**งานในเฟสนี้:**
- [x] กำหนด permission keys ของโรงแรม (`rooms`, `guests`, `reservations`, `billing`, `reports`)
- [x] ผูก 3 roles หลักใน `roles.ts` + seed migration + `bun run rbac:sync`

---

## Phase 1 — Room Management (✅)

โมดูล: `src/modules/rooms`

### ขอบเขต
- **Room Types**: ชื่อประเภท, คำอธิบาย, ราคา/คืน, ความจุ
- **Rooms**: เลขห้อง, ชั้น, ผูกกับ Room Type, สถานะปัจจุบัน
- **Room Status (real-time)**: `available` / `occupied` / `cleaning` / `maintenance`

### Data Model
| ตาราง | ฟิลด์หลัก |
|-------|-----------|
| `room_types` | id, name, description, base_price, capacity |
| `rooms` | id, room_number, floor, room_type_id, status |

### Tasks
- [x] `domain/contracts` — Zod schema ของ RoomType / Room
- [x] Drizzle schema + migration
- [x] `domain/repo` + `domain/service` (CRUD + เปลี่ยนสถานะห้อง)
- [x] `domain/http` — Elysia routes
- [x] `presentation` — หน้า Room Types, ตารางห้อง + เปลี่ยนสถานะ
- [x] สิทธิ์: Admin จัดการได้เต็ม, Housekeeping เปลี่ยนสถานะได้ (`rooms:status`)

**Deliverable:** ✅ สร้าง/แก้ไขประเภทห้องและห้องได้ + เห็นสถานะห้องแบบ real-time

---

## Phase 2 — Guest & Reservation (✅)

โมดูล: `src/modules/guests`, `src/modules/reservations`

### ขอบเขต
- **Guest Profile**: ชื่อ, เบอร์โทร, เลขพาสปอร์ต/บัตรประชาชน, สัญชาติ
- **Reservation**: ผูก guest + room, วันที่เข้า/ออก, จำนวนผู้เข้าพัก, สถานะการจอง
- **Booking Calendar**: ปฏิทินแสดงห้องว่าง/เต็มตามช่วงวันที่

### Data Model
| ตาราง | ฟิลด์หลัก |
|-------|-----------|
| `guests` | id, full_name, phone, id_document, nationality |
| `reservations` | id, guest_id, room_id, check_in_date, check_out_date, status |

> สถานะการจอง: `booked` / `checked_in` / `checked_out` / `cancelled`

### Tasks
- [x] โมดูล `guests` — CRUD โปรไฟล์ลูกค้า + ค้นหา
- [x] โมดูล `reservations` — สร้าง/แก้ไข/ยกเลิกการจอง
- [x] ตรวจสอบห้องว่าง (กันจองซ้อนช่วงเวลาเดียวกัน)
- [x] หน้า Booking Calendar (`/app/calendar`)
- [x] สิทธิ์: Receptionist และ Admin จัดการได้

**Deliverable:** ✅ สร้างลูกค้า + จองห้องได้ และเห็นการจองบนปฏิทิน

---

## Phase 3 — Front Desk Operations (✅)

ต่อยอดในโมดูล `reservations` (+ ผูก `rooms`)

### ขอบเขต
- **Check-in**: เปลี่ยนสถานะการจอง → `checked_in` และห้อง → `occupied`
- **Check-out**: เปลี่ยนสถานะ → `checked_out`, ห้อง → `cleaning`, ส่งต่อไปออกบิล

### Tasks
- [x] หน้าจอ Front Desk / Check-in (`/app/front-desk`)
- [x] Check-out + ส่งต่อออกบิล
- [x] อัปเดตสถานะห้องอัตโนมัติเมื่อ check-in / check-out
- [x] คิว Housekeeping (`/app/housekeeping`) — ห้อง `cleaning` → `available`

**Deliverable:** ✅ ทำ flow check-in → check-out ได้ครบ และสถานะห้องอัปเดตถูกต้อง

---

## Phase 4 — Billing & Invoicing (✅)

โมดูล: `src/modules/billing`

### ขอบเขต
- **Invoicing**: ออกใบบิลค่าห้อง + รายการบริการเพิ่มเติม
- **Payment Tracking**: บันทึกการชำระ (เงินสด / โอน / บัตรเครดิต)
- **Tax Calculation**: คำนวณภาษีพื้นฐาน

### Data Model
| ตาราง | ฟิลด์หลัก |
|-------|-----------|
| `invoices` | id, reservation_id, subtotal, tax_amount, total, status |
| `invoice_items` | id, invoice_id, description, qty, unit_price, amount |
| `payments` | id, invoice_id, method, amount, paid_at |

> สถานะใบบิล: `unpaid` / `partially_paid` / `paid`

### Tasks
- [x] สร้าง Invoice จากการเข้าพัก (ค่าห้อง × คืน + ค่าบริการ)
- [x] คำนวณภาษีและยอดรวม
- [x] บันทึกการชำระเงินหลายช่องทาง + ติดตามยอดค้าง
- [x] พิมพ์/แสดงใบบิล (+ QR verify)
- [x] สิทธิ์: Receptionist และ Admin

**Deliverable:** ✅ ออกบิล + รับชำระเงิน + คำนวณภาษีได้ครบ

---

## Phase 6 — Cash Shift / Cash Drawer (✅)

ต่อยอดในโมดูล `billing`

> รายละเอียดใน [`implementation/PHASE_6_CASH_SHIFT.md`](./implementation/PHASE_6_CASH_SHIFT.md)

### ขอบเขต
- **Open Shift / Close Shift** — บันทึกพนักงานเข้าเวน + เวลาเปิด/ปิด
- **Opening Cash** — เงินตั้งต้นในลิ้นชัก
- **สรุปกะ** — ยอดรับเงินสด / โอน / บัตร + นับเงินจริง + variance

### Data Model
| ตาราง | ฟิลด์หลัก |
|-------|-----------|
| `cash_shift` | id, status, opened_by, opened_at, opening_cash, closed_by, closed_at, closing_cash_counted, cash/transfer/card received, variance |
| `payment` | shift_id, recorded_by_user_id |

### Tasks
- [x] Schema + migration
- [x] Permission `billing:shift`
- [x] Service เปิด/ปิดกะ + ผูก payment กับ shift
- [x] UI แถบสถานะกะบน Front Desk / Invoice
- [x] ประวัติกะ (`/app/cash-shifts`)

**Deliverable:** ✅ Reception เปิดกะ → รับเงิน → ปิดกะส่งมอบ พร้อมตรวจสอบเงินสดได้

---

## Phase 5 — Basic Reporting (✅)

โมดูล: `src/modules/reports`

### ขอบเขต
- **Daily Sales Report**: รายรับประจำวัน (จาก payments)
- **Occupancy Rate**: อัตราการเข้าพักตามช่วงเวลา
- **Cash reports**: สรุปกะ / ยอดเงินสดรายวัน / ยอดขายตามกะ
- **Export CSV**: ส่งออกตาม filter ช่วงวันที่

### Tasks
- [x] Query สรุปยอดขายรายวัน
- [x] คำนวณ occupancy rate ตามวัน/ช่วงเวลา
- [x] แสดงผลด้วย Recharts + ตารางสรุป (`/app/reports`)
- [x] Export CSV ทุกแท็บรายงาน (ใช้ filter เดียวกับหน้าจอ)
- [x] สิทธิ์: Admin + Receptionist (`reports:read`)

**Deliverable:** ✅ ดูรายรับประจำวัน อัตราการเข้าพัก และรายงานกะเงินสดได้

---

## สรุปโมดูล

| โมดูล | Phase | สถานะ |
|-------|-------|-------|
| `rooms` | 1 | ✅ |
| `guests` | 2 | ✅ |
| `reservations` | 2–3 | ✅ |
| `billing` | 4, 6 | ✅ |
| `reports` | 5 | ✅ |

---

## Checklist ภาพรวม MVP (Definition of Done)

- [x] Phase 0: permission keys + ผูก 3 roles
- [x] Phase 1: จัดการ Room Types & Rooms + สถานะ real-time
- [x] Phase 2: Guest Profile + Reservation + Booking Calendar
- [x] Phase 3: Check-in / Check-out + อัปเดตสถานะห้อง
- [x] Phase 4: Invoice + Payment + Tax
- [x] Phase 6: Cash Shift (Open/Close + Opening Cash + สรุปส่งมอบ)
- [x] Phase 5: Daily Sales Report + Occupancy Rate (+ export CSV)
- [ ] ทดสอบสิทธิ์ครบทั้ง 3 roles (Admin / Receptionist / Housekeeping) — QA ด้วยมือ

### สิ่งที่เสริมนอก checklist เดิม

- [x] Demo seed — migration `0001_demo_seed.sql` + scripts `seed:hotel` / `seed:billing`
- [x] Deploy — Ansible (`deploy/`) + env sync
- [x] Dev quick login — แสดงเมื่อ server `NODE_ENV=development`

---

## ต่อไป — Phase 2 (Post-MVP)

> แผน Channel Management & Operations อยู่ใน [`../phase-2/ROADMAP.md`](../phase-2/ROADMAP.md)
