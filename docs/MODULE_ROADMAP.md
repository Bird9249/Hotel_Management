# Module Roadmap — ระบบจัดการโรงแรม (MVP)

> แผนการพัฒนาแบบแบ่งเป็นโมดูลและเฟส (Phase) เรียงตามลำดับการพึ่งพา (dependency)
> อ้างอิงภาพรวมจาก [`PROJECT_OVERVIEW.md`](./PROJECT_OVERVIEW.md)

สัญลักษณ์สถานะ: ✅ พร้อมแล้ว · 🚧 กำลังทำ · ⬜ ยังไม่เริ่ม

---

## ภาพรวมลำดับการพัฒนา (Sequencing)

```
Phase 0  ฐานระบบ (auth / roles / users)          ✅ มีอยู่แล้ว
   │
Phase 1  Room Management (rooms + room types)     ⬜  ← เริ่มที่นี่
   │
Phase 2  Guest & Reservation (guests + booking)   ⬜
   │
Phase 3  Front Desk Ops (check-in / check-out)    ⬜
   │
Phase 4  Billing & Invoicing                      ⬜
   │
Phase 5  Reporting (sales / occupancy)            ⬜
```

> เหตุผลของลำดับ: ต้องมี "ห้อง" ก่อนจึงจะจองได้ → ต้องมี "การจอง" ก่อนจึงเช็คอินได้
> → ต้องเช็คเอาท์/มีการเข้าพักก่อนจึงออกบิลได้ → มีข้อมูลครบจึงทำรายงานได้

---

## Phase 0 — Foundation (✅ มีอยู่แล้ว)

| โมดูล | สถานะ | หมายเหตุ |
|-------|-------|----------|
| `auth` | ✅ | Better Auth — login / session |
| `roles` | ✅ | RBAC — ใช้กำหนดสิทธิ์ Admin / Receptionist / Housekeeping |
| `users` | ✅ | จัดการบัญชีพนักงาน |
| `settings`, `audit`, `upload`, `dashboard` | ✅ | บริการกลาง |

**งานที่ต้องทำเพิ่มในเฟสนี้:**
- [ ] กำหนด permission keys ของโรงแรม (เช่น `room:read`, `reservation:write`, `billing:write`)
- [ ] ผูก 3 roles หลัก (Admin / Receptionist / Housekeeping) เข้ากับ permission ผ่านสคริปต์ `rbac:sync`

---

## Phase 1 — Room Management (⬜)

โมดูลใหม่: `src/modules/rooms`

### ขอบเขต
- **Room Types**: ชื่อประเภท, คำอธิบาย, ราคา/คืน, ความจุ
- **Rooms**: เลขห้อง, ชั้น, ผูกกับ Room Type, สถานะปัจจุบัน
- **Room Status (real-time)**: `available` / `occupied` / `cleaning` / `maintenance`

### Data Model (ร่าง)
| ตาราง | ฟิลด์หลัก |
|-------|-----------|
| `room_types` | id, name, description, base_price, capacity |
| `rooms` | id, room_number, floor, room_type_id, status |

### Tasks
- [ ] `domain/contracts` — Zod schema ของ RoomType / Room
- [ ] Drizzle schema + migration (`db:generate` → `db:migrate`)
- [ ] `domain/repo` + `domain/service` (CRUD + เปลี่ยนสถานะห้อง)
- [ ] `domain/http` — Elysia routes
- [ ] `presentation` — หน้าจัดการ Room Types, ตารางห้อง + ปุ่มเปลี่ยนสถานะ
- [ ] สิทธิ์: Admin จัดการได้เต็ม, Housekeeping เปลี่ยนสถานะทำความสะอาดได้

**Deliverable:** สร้าง/แก้ไขประเภทห้องและห้องได้ + เห็นสถานะห้องแบบ real-time

---

## Phase 2 — Guest & Reservation (⬜)

โมดูลใหม่: `src/modules/guests`, `src/modules/reservations`

### ขอบเขต
- **Guest Profile**: ชื่อ, เบอร์โทร, เลขพาสปอร์ต/บัตรประชาชน, สัญชาติ
- **Reservation**: ผูก guest + room, วันที่เข้า/ออก, จำนวนผู้เข้าพัก, สถานะการจอง
- **Booking Calendar**: ปฏิทินแสดงห้องว่าง/เต็มตามช่วงวันที่

### Data Model (ร่าง)
| ตาราง | ฟิลด์หลัก |
|-------|-----------|
| `guests` | id, full_name, phone, id_document, nationality |
| `reservations` | id, guest_id, room_id, check_in_date, check_out_date, status |

> สถานะการจอง: `booked` / `checked_in` / `checked_out` / `cancelled`

### Tasks
- [ ] โมดูล `guests` — CRUD โปรไฟล์ลูกค้า + ค้นหา
- [ ] โมดูล `reservations` — สร้าง/แก้ไข/ยกเลิกการจอง
- [ ] ตรวจสอบห้องว่าง (กันจองซ้อนช่วงเวลาเดียวกัน)
- [ ] หน้า Booking Calendar (ใช้ react-day-picker / ตารางตามวันที่)
- [ ] สิทธิ์: Receptionist และ Admin จัดการได้

**Deliverable:** สร้างลูกค้า + จองห้องได้ และเห็นการจองบนปฏิทิน

---

## Phase 3 — Front Desk Operations (⬜)

ต่อยอดในโมดูล `reservations` (+ ผูก `rooms`)

### ขอบเขต
- **Check-in**: เปลี่ยนสถานะการจอง → `checked_in` และห้อง → `occupied`
- **Check-out**: เปลี่ยนสถานะ → `checked_out`, ห้อง → `cleaning`, ส่งต่อไปออกบิล

### Tasks
- [ ] หน้าจอ Check-in (ค้นหาการจอง → ยืนยันเข้าพัก)
- [ ] หน้าจอ Check-out (สรุปค่าใช้จ่าย → ไปขั้นออกบิล)
- [ ] อัปเดตสถานะห้องอัตโนมัติเมื่อ check-in / check-out
- [ ] เชื่อมกับ Housekeeping: ห้องที่ check-out แล้วขึ้นคิวทำความสะอาด

**Deliverable:** ทำ flow check-in → check-out ได้ครบ และสถานะห้องอัปเดตถูกต้อง

---

## Phase 4 — Billing & Invoicing (⬜)

โมดูลใหม่: `src/modules/billing`

### ขอบเขต
- **Invoicing**: ออกใบบิลค่าห้อง + รายการบริการเพิ่มเติม
- **Payment Tracking**: บันทึกการชำระ (เงินสด / โอนผ่าน App ธนาคาร / บัตรเครดิต)
- **Tax Calculation**: คำนวณภาษีพื้นฐาน

### Data Model (ร่าง)
| ตาราง | ฟิลด์หลัก |
|-------|-----------|
| `invoices` | id, reservation_id, subtotal, tax_amount, total, status |
| `invoice_items` | id, invoice_id, description, qty, unit_price, amount |
| `payments` | id, invoice_id, method, amount, paid_at |

> สถานะใบบิล: `unpaid` / `partially_paid` / `paid`

### Tasks
- [ ] สร้าง Invoice จากการเข้าพัก (ดึงค่าห้อง × จำนวนคืน + ค่าบริการ)
- [ ] คำนวณภาษีและยอดรวม
- [ ] บันทึกการชำระเงินหลายช่องทาง + ติดตามยอดค้าง
- [ ] พิมพ์/แสดงใบบิล
- [ ] สิทธิ์: Receptionist และ Admin

**Deliverable:** ออกบิล + รับชำระเงิน + คำนวณภาษีได้ครบ

---

## Phase 5 — Basic Reporting (⬜)

โมดูลใหม่: `src/modules/reports` (หรือเสริมใน `dashboard`)

### ขอบเขต
- **Daily Sales Report**: รายรับประจำวัน (จาก payments / invoices)
- **Occupancy Rate**: อัตราการเข้าพัก = ห้องที่มีแขก ÷ ห้องทั้งหมด ตามช่วงเวลา

### Tasks
- [ ] Query สรุปยอดขายรายวัน
- [ ] คำนวณ occupancy rate ตามวัน/ช่วงเวลา
- [ ] แสดงผลด้วย Recharts (กราฟ + การ์ดตัวเลขสรุป)
- [ ] สิทธิ์: Admin (และดูแบบจำกัดสำหรับ Receptionist หากต้องการ)

**Deliverable:** ดูรายรับประจำวันและอัตราการเข้าพักได้

---

## สรุปโมดูลที่ต้องสร้างใหม่ทั้งหมด

| โมดูล | Phase | สถานะ |
|-------|-------|-------|
| `rooms` | 1 | ⬜ |
| `guests` | 2 | ⬜ |
| `reservations` | 2–3 | ⬜ |
| `billing` | 4 | ⬜ |
| `reports` | 5 | ⬜ |

---

## Checklist ภาพรวม MVP (Definition of Done)

- [ ] Phase 0: permission keys + ผูก 3 roles
- [ ] Phase 1: จัดการ Room Types & Rooms + สถานะ real-time
- [ ] Phase 2: Guest Profile + Reservation + Booking Calendar
- [ ] Phase 3: Check-in / Check-out + อัปเดตสถานะห้อง
- [ ] Phase 4: Invoice + Payment + Tax
- [ ] Phase 5: Daily Sales Report + Occupancy Rate
- [ ] ทดสอบสิทธิ์ครบทั้ง 3 roles (Admin / Receptionist / Housekeeping)
