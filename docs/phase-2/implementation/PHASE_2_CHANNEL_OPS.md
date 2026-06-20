# Phase 2 — Channel Management & Operations

> 🚀 **Channel Management & Operations (ເນັ້ນເພີ່ມຍອດຂາຍ ແລະ ງານແມ່ບ້ານ)**
>
> เป้าหมาย: ดึงลูกค้าจากช่องทาง online, ลดค่าคอมมิชชัน OTA ด้วย Direct Booking,
> และให้ทีมแม่บ้านทำงานบนมือถือพร้อมระบบกะส่งมอบ
>
> **Dependencies:** MVP Phase 0–6 ครบ (โดยเฉพาะ `rooms`, `reservations`, `billing`, RBAC 3 roles)
> **อ้างอิง:** [`../ROADMAP.md`](../ROADMAP.md) · [`../../mvp/implementation/PHASE_6_CASH_SHIFT.md`](../../mvp/implementation/PHASE_6_CASH_SHIFT.md)

---

## 1. ขอบเขตและเป้าหมาย

| ฟีเจอร์ | รายละเอียด | Deliverable |
|---------|------------|-------------|
| **Channel Manager** | เชื่อม inventory กับ OTA (Agoda, Booking.com, Expedia) sync real-time กัน overbooking | Admin ตั้งค่า channel + เห็น sync log + จองจาก OTA เข้าระบบอัตโนมัติ |
| **Booking Engine** | จองตรงผ่านเว็บ/โซเชียลของโรงแรม ลด commission | หน้า public `/book` + confirmation + จองเข้า `reservation` |
| **Housekeeping Mobile** | UI มือถือสำหรับอัปเดตสถานะห้อง (`cleaning` → `available`) | PWA `/m/housekeeping` touch-first |
| **Housekeeping Shift** | เปิด/ปิดกะแม่บ้าน สรุปห้องที่ทำ + ส่งมอบ | เหมือน Cash Shift แต่สำหรับ HK team |

### นอกขอบเขต Phase 2 (เลื่อนไป Post-MVP Phase 3)

- Payment Gateway ออนไลน์เต็มรูปแบบ (Stripe / local bank QR auto-verify)
- Dynamic pricing / revenue management
- Multi-property / หลายสาขา
- Native app iOS/Android (Phase 2 ใช้ PWA/responsive ก่อน)
- POS / Mini-bar

---

## 2. Sub-phase 2.0 — Inventory & Channel Foundation

> ทำก่อนทุกอย่าง — เป็น **single source of truth** สำหรับห้องว่าง

### 2.0.1 ปัญหาที่ต้องแก้จาก MVP

MVP ปัจจุบัน:
- กันจองซ้อนเฉพาะ `reservation` ในระบบ (`list-room-availability.ts` + overlap check ตอนสร้างจอง)
- ไม่มี `source` / external booking id
- Availability ระดับ **ห้อง (room)** ไม่ใช่ **room type allotment** ที่ OTA ใช้

OTA และ Direct Booking ต้องการ:
- Allotment ตาม **room type** + optional cap ต่อ channel
- Hold/block inventory ระหว่าง checkout ของ guest กับ sync ไป OTA
- Idempotent import จาก webhook (จองซ้ำจาก retry ไม่สร้าง 2 records)

### 2.0.2 ขยาย Data Model

#### ตาราง `reservation` — เพิ่มคอลัมน์

```ts
// src/server/platform/db/schema/reservations.ts (migration ใหม่)
export const reservation = pgTable("reservation", {
  // ... ฟิลด์เดิม ...
  source: text("source").notNull().default("front_desk"),
  // front_desk | direct_web | agoda | booking_com | expedia | other
  channelId: text("channel_id").references(() => salesChannel.id, {
    onDelete: "set null",
  }),
  externalBookingId: text("external_booking_id"), // id จาก OTA
  externalPayload: jsonb("external_payload"),     // raw snapshot สำหรับ debug
  notes: text("notes"),
});
```

สร้าง unique index: `(channel_id, external_booking_id)` where external_booking_id is not null

#### ตารางใหม่ `sales_channel`

```ts
// src/server/platform/db/schema/channels.ts
export const salesChannel = pgTable("sales_channel", {
  id: text("id").primaryKey(),
  code: text("code").notNull().unique(), // direct_web | agoda | booking_com | expedia
  name: text("name").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  // credentials เก็บ encrypted JSON หรือ reference env — ไม่เก็บ plain secret ใน DB
  config: jsonb("config"),
  lastSyncAt: timestamp("last_sync_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
```

#### ตาราง `channel_room_mapping`

```ts
export const channelRoomMapping = pgTable("channel_room_mapping", {
  id: text("id").primaryKey(),
  channelId: text("channel_id").notNull().references(() => salesChannel.id),
  roomTypeId: text("room_type_id").notNull().references(() => roomType.id),
  externalRoomTypeId: text("external_room_type_id").notNull(),
  allotment: integer("allotment"), // null = ใช้จำนวนห้องจริงทั้งหมดของ type
});
```

#### ตาราง `inventory_hold` (optional แต่แนะนำ)

```ts
// hold ชั่วคราวตอน guest กำลังจองบนเว็บ (15 นาที) ก่อนยืนยัน
export const inventoryHold = pgTable("inventory_hold", {
  id: text("id").primaryKey(),
  roomTypeId: text("room_type_id").notNull(),
  checkInDate: date("check_in_date").notNull(),
  checkOutDate: text("check_out_date").notNull(),
  quantity: integer("quantity").notNull().default(1),
  source: text("source").notNull(), // direct_web
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
```

#### ตาราง `channel_sync_log`

```ts
export const channelSyncLog = pgTable("channel_sync_log", {
  id: text("id").primaryKey(),
  channelId: text("channel_id").notNull(),
  direction: text("direction").notNull(), // push | pull
  operation: text("operation").notNull(), // availability | reservation | rate
  status: text("status").notNull(), // success | failed | partial
  requestSummary: jsonb("request_summary"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
```

### 2.0.3 Domain Layer — โมดูล `channels`

```
src/modules/channels/
├── api/index.ts
├── domain/
│   ├── contracts/
│   │   ├── sales-channel.ts
│   │   ├── room-mapping.ts
│   │   └── sync-log.ts
│   ├── repo/
│   │   ├── get-channel-by-code.ts
│   │   ├── list-channels.ts
│   │   ├── upsert-room-mapping.ts
│   │   └── insert-sync-log.ts
│   ├── service/
│   │   ├── get-room-type-availability.ts   # core — ใช้ร่วมกับ booking engine + OTA
│   │   ├── reserve-inventory.ts            # atomic decrement + overlap check
│   │   └── release-hold.ts
│   └── http/
│       └── channels.routes.ts
└── presentation/
    ├── pages/ChannelsSettingsPage.tsx
    └── ui/ChannelMappingTable.tsx
```

### 2.0.4 กฎธุรกิจ Availability (รวมทุกช่องทาง)

```
availableCount(roomType, dateRange) =
  physicalRooms(roomType)
  - activeReservations(roomType, range, statuses: booked|checked_in)
  - activeHolds(roomType, range, not expired)
  - channelBlocked(roomType, range)   // optional per-channel cap

การจองใหม่ (ทุก source):
1. lock ระดับ transaction (SELECT ... FOR UPDATE บน summary หรือ advisory lock ต่อ roomType+dates)
2. ตรวจ availableCount >= 1 (หรือ qty ที่ขอ)
3. insert reservation + audit
4. enqueue push availability ไป OTA (async)
```

**แก้** `src/modules/reservations/domain/service/create-reservation.ts` ให้เรียก `reserveInventoryService` แทน overlap check แยก

**แก้** `list-room-availability.ts` ให้รองรับ filter by `roomTypeId` สำหรับ Booking Engine

### 2.0.5 Permission (RBAC)

```ts
channels: {
  read: "channels:read",
  manage: "channels:manage",   // ตั้งค่า mapping + credentials
  sync: "channels:sync",       // manual sync / retry
},
```

| Role | channels:read | channels:manage | channels:sync |
|------|:-------------:|:---------------:|:-------------:|
| Admin | ✓ | ✓ | ✓ |
| Receptionist | ✓ | — | — |
| Housekeeping | — | — | — |

### 2.0.6 Tasks

- [ ] Schema + migration (`channels.ts`, ขยาย `reservations.ts`)
- [ ] `get-room-type-availability` service + unit test overlap scenarios
- [ ] Refactor create/cancel reservation ให้ trigger inventory recalc
- [ ] Admin UI: หน้า `/app/channels` — รายการ channel + mapping room type
- [ ] แสดง `source` ในตารางจอง / Front Desk / Calendar

---

## 3. Sub-phase 2.3 — Booking Engine (Direct Booking)

> ทำหลัง 2.0 — ไม่ต้องรอ OTA

### 3.1 ขอบเขต MVP ของ Booking Engine

| Feature | รายละเอียด |
|---------|------------|
| ค้นหาห้องว่าง | เลือกวันเข้า/ออก + จำนวนผู้เข้าพัก → แสดง room type ที่ว่าง + ราคา |
| ฟอร์มจอง | ชื่อ, โทร, อีเมล (optional), หมายเหตุ |
| Hold + Confirm | สร้าง `inventory_hold` 15 นาที → ยืนยัน → `reservation` source=`direct_web` |
| Confirmation | หน้า `/book/confirmation/:id` + รหัสจอง |
| ชำระเงิน | MVP: **จ่ายที่โรงแรม** (ยังไม่รับ online payment) |

### 3.2 Routing & Auth

```
/book              — หน้าค้นหา + เลือกห้อง (public, ไม่ require auth)
/book/checkout     — ฟอร์ม + hold
/book/confirmation/:code — สถานะจอง
```

- ลงทะเบียน routes ใน `src/app/router.tsx` **นอก** layout `/app` (ไม่มี sidebar admin)
- API public ใน `src/modules/booking-engine/domain/http/public.routes.ts`
  - rate limit ต่อ IP
  - CAPTCHA/honeypot (Phase 2.3.1) กัน bot

### 3.3 โมดูล `booking-engine`

```
src/modules/booking-engine/
├── domain/
│   ├── service/
│   │   ├── search-availability.ts      # เรียก channels.get-room-type-availability
│   │   ├── create-hold.ts
│   │   ├── confirm-booking.ts          # guest upsert + reservation + release hold
│   │   └── get-booking-by-code.ts
│   └── http/public.routes.ts
└── presentation/
    ├── pages/BookSearchPage.tsx
    ├── pages/BookCheckoutPage.tsx
    ├── pages/BookConfirmationPage.tsx
    └── ui/RoomTypeCard.tsx
```

### 3.4 Branding

- ดึง `hotel_settings` (ชื่อโรงแรม, โลโก้, โทร) — มีอยู่แล้วจาก MVP
- รองรับ embed: `<iframe src="https://hotel.example/book?embed=1">` หรือ link ใน Facebook

### 3.5 Tasks

- [ ] Public API: `GET /api/public/availability`, `POST /api/public/holds`, `POST /api/public/bookings/confirm`
- [ ] UI ภาษาลาว (+ optional EN toggle ภายหลัง)
- [ ] สร้าง `sales_channel` record `direct_web` อัตโนมัติใน migration/seed
- [ ] Reception เห็นจอง direct บน Front Desk (filter source)
- [ ] Email confirmation (optional — ใช้ SMTP env; ถ้าไม่มีแสดง confirmation page อย่างเดียว)

---

## 4. Sub-phase 2.4 — Channel Manager (OTA Integration)

> ซับซ้อนสุด — ทำหลัง inventory + direct booking พร้อม

### 4.1 กลยุทธ์การ integrate (แนะนำ)

| แนวทาง | ข้อดี | ข้อเสีย |
|--------|------|--------|
| **A. Channel Manager Middleware** (SiteMinder, Channex, Cloudbeds CM) | 1 API → หลาย OTA, มาตรฐาน industry | ค่าบริการรายเดือน |
| **B. Direct OTA API** (Booking.com Connectivity, Expedia Rapid, Agoda YCS API) | ไม่ผ่านคนกลาง | ต่อทีละแพลตฟอร์ม, certification ยาว |

**แนะนำ Phase 2:** เริ่ม **Adapter pattern** + implement **1 ช่องทางก่อน**
- ถ้ามี budget CM → **Channex** หรือ **SiteMinder** (มี REST webhook ชัด)
- ถ้าไม่มี → mock adapter + **manual CSV import** เป็น stepping stone แล้วค่อยต่อ API จริง

### 4.2 Adapter Interface

```ts
// src/modules/channels/domain/adapters/types.ts
export interface ChannelAdapter {
  code: SalesChannelCode;
  pushAvailability(input: PushAvailabilityInput): Promise<void>;
  pullReservations(since: Date): Promise<ExternalReservation[]>;
  acknowledgeReservation(externalId: string): Promise<void>;
}
```

Implementations:
- `adapters/direct-web.adapter.ts` — no-op push (inventory อยู่ในระบบแล้ว)
- `adapters/channex.adapter.ts` หรือ `adapters/mock-ota.adapter.ts`

### 4.3 Webhook Inbound (จองจาก OTA → ระบบ)

```
POST /api/webhooks/channels/:channelCode
1. verify signature / API key
2. parse payload → ExternalReservation DTO
3. idempotent upsert ด้วย (channelId, externalBookingId)
4. map room type → assign room อัตโนมัติ (ห้องว่างแรกของ type) หรือ unassigned queue
5. insert sync_log success
6. (optional) notify Reception via dashboard badge
```

### 4.4 Push Outbound (inventory เปลี่ยน → OTA)

Trigger เมื่อ:
- สร้าง/ยกเลิก/เปลี่ยนวันที่ reservation
- เปลี่ยนสถานะห้อง `maintenance` (ลด allotment)
- ปิด channel mapping

```
async function onInventoryChanged(roomTypeId, dateRange) {
  for (const channel of activeChannels) {
    await jobQueue.enqueue({ type: "push_availability", channelId, roomTypeId, dateRange });
  }
}
```

**MVP sync:** cron ทุก 5 นาที + manual button "Sync now" บนหน้า Admin
**Phase 2.4.1:** real-time push หลัง transaction commit

### 4.5 กัน Overbooking

```
เมื่อรับจอง OTA:
- ใช้ reserveInventoryService เดียวกับ front desk
- ถ้าเต็ม → reject webhook + log failed + alert Admin (ไม่สร้าง reservation)
- ถ้า OTA ส่งซ้ำ (retry) → upsert ด้วย external id (ไม่ double book)

เมื่อจองในระบบ:
- push availability ลด count ไป OTA ทันที (หรือภายใน cron window)
```

### 4.6 Admin UI

| หน้า | ฟังก์ชัน |
|------|----------|
| `/app/channels` | รายการ OTA, สถานะเชื่อมต่อ, last sync |
| `/app/channels/:id` | mapping room type, ทดสอบ connection, credentials |
| `/app/channels/:id/logs` | sync log + retry failed |

### 4.7 Tasks

- [ ] Adapter interface + mock adapter + tests
- [ ] Webhook endpoint + signature verification
- [ ] Import reservation service (idempotent)
- [ ] Push availability job (cron หรือ in-process scheduler บน Bun)
- [ ] UI settings + sync log
- [ ] Integrate OTA จริง 1 แพลตฟอร์ม (ตามที่โรงแรมเลือก)
- [ ] Runbook เอกสาร setup credential ใน `.env` / Admin UI

---

## 5. Sub-phase 2.1 — Housekeeping Shift (ກະແມ່ບ້ານ)

> อ้างอิง pattern จาก [`../../mvp/implementation/PHASE_6_CASH_SHIFT.md`](../../mvp/implementation/PHASE_6_CASH_SHIFT.md)
> ต่อยอดโมดูล `housekeeping` ใหม่ (แยกจาก `rooms` presentation)

### 5.1 ขอบเขต

| Feature | รายละเอียด |
|---------|------------|
| **Open Shift** | แม่บ้าน/login เปิดกะ — บันทึกผู้รับผิดชอบ + เวลา |
| **งานในกะ** | ทุกครั้งที่ mark ห้อง `cleaning → available` ผูก `hk_shift_id` |
| **Close Shift** | สรุปจำนวนห้องที่ทำเสร็จ + ห้องค้าง + หมายเหตุส่งมอบ |
| **ประวัติกะ** | Admin / supervisor ดูย้อนหลัง |

### 5.2 Database Schema

```ts
// src/server/platform/db/schema/housekeeping.ts
export const hkShift = pgTable("hk_shift", {
  id: text("id").primaryKey(),
  status: text("status").notNull().default("open"), // open | closed
  openedByUserId: text("opened_by_user_id").notNull().references(() => user.id),
  openedAt: timestamp("opened_at").notNull().defaultNow(),
  closedByUserId: text("closed_by_user_id").references(() => user.id),
  closedAt: timestamp("closed_at"),
  roomsCompleted: integer("rooms_completed"),       // snapshot ตอนปิด
  roomsPending: integer("rooms_pending"),
  handoverNote: text("handover_note"),
});

export const hkRoomTask = pgTable("hk_room_task", {
  id: text("id").primaryKey(),
  shiftId: text("shift_id").references(() => hkShift.id),
  roomId: text("room_id").notNull().references(() => room.id),
  status: text("status").notNull(), // pending | in_progress | done
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  completedByUserId: text("completed_by_user_id").references(() => user.id),
});
```

**ขยาย** `room` status transition log (optional): เก็บใน `hk_room_task` แทน audit แยก

### 5.3 กฎธุรกิจ

```
1. มี hk_shift open ได้หลายกะพร้อมกันได้ (หลายคนทำงาน) — ต่างจาก Cash Shift ที่ทีละ 1
   หรือ MVP: ทีละ 1 shift ต่อ "ทีม" ถ้าโรงแรมเล็ก → ตั้ง config ได้
2. เปิดกะ → ดึงรายการห้อง status=cleaning เป็น tasks อัตโนมัติ
3. กด "เริ่มทำ" → task in_progress
4. กด "ทำเสร็จ" → room available + task done + ผูก shiftId
5. ปิดกะ → snapshot จำนวนห้อง done/pending + handover note
6. ถ้าไม่มีกะ open → ยังเปลี่ยนสถานะห้องได้ (warn) เหมือน payment ไม่มี cash shift
```

### 5.4 Permission

```ts
housekeeping: {
  read: "housekeeping:read",
  shift: "housekeeping:shift",     // เปิด/ปิดกะ
  task: "housekeeping:task",     // อัปเดตงาน/สถานะห้อง
},
```

| Role | housekeeping:read | housekeeping:shift | housekeeping:task |
|------|:-----------------:|:------------------:|:-----------------:|
| Admin | ✓ | ✓ | ✓ |
| Housekeeping | ✓ | ✓ | ✓ |
| Receptionist | ✓ (ดูสถานะ) | — | — |

### 5.5 API Endpoints

| Method | Path | Permission |
|--------|------|------------|
| GET | `/api/housekeeping/shifts/current` | housekeeping:read |
| POST | `/api/housekeeping/shifts/open` | housekeeping:shift |
| POST | `/api/housekeeping/shifts/:id/close` | housekeeping:shift |
| GET | `/api/housekeeping/tasks` | housekeeping:read |
| PATCH | `/api/housekeeping/tasks/:id` | housekeeping:task |
| PATCH | `/api/rooms/:id/status` | rooms:status (เดิม — เพิ่ม shiftId ใน service) |

### 5.6 UI (Desktop — ใน `/app`)

- `/app/hk-shifts` — ประวัติกะ (Admin)
- แถบสถานะกะบน `/app/housekeeping` (เหมือน CashShiftBar บน Front Desk)
- ปรับ `HousekeepingPage.tsx` ให้แสดง tasks + ปุ่มเริ่ม/เสร็จ แทน confirm dialog อย่างเดียว

### 5.7 Tasks

- [ ] Schema `housekeeping.ts` + migration
- [ ] Permissions + rbac:sync
- [ ] Services: open/close shift, list tasks, complete task
- [ ] แก้ `set-room-status` ให้บันทึก hk_room_task เมื่อมี shift open
- [ ] UI shift bar + history page
- [ ] รายงาน HK ใน reports (optional 2.1.1): ห้อง/กะ/วัน

---

## 6. Sub-phase 2.2 — Housekeeping Mobile App

> UI มือถือสำหรับแม่บ้าน — ใช้ API เดียวกับ 2.1

### 6.1 แนวทางเทคนิค

| ทางเลือก | รายละเอียด |
|----------|------------|
| **PWA (แนะนำ)** | Route `/m/housekeeping` responsive + `manifest.webmanifest` + install prompt |
| **Deep link** | QR login สำหรับ tablet ติดผนังชั้น |

ไม่สร้าง native app ใน Phase 2 — ใช้ React route เดิม + mobile layout

### 6.2 UX หลัก

```
/m/housekeeping
├── Shift bar: [ເປີດກະ] / ກຳລັງເຮັດວຽກ · ห้องเหลือ N
├── Tab: ລໍຖ້າ (pending) | ກຳລັງທຳ (in_progress) | ເສັດແລ້ວ (done)
└── Card ใหญ่ต่อห้อง:
    - เลขห้อง + ชั้น + ประเภท
    - ปุ่มเต็มความกว้าง: [ເລີ່ມທຳຄວາມສະອາດ] → [ພ້ອມໃຊ້]
    - swipe หรือ tap อย่างเดียว (ไม่มี hover)
```

### 6.3 Real-time (Reception เห็นเร็วขึ้น)

MVP mobile: **TanStack Query refetchInterval 10s** บน task list
Phase 2.2.1: **SSE** `/api/housekeeping/events` push เมื่อ room status เปลี่ยน

Reception `/app/front-desk` — แสดง badge "ห้องพร้อม check-in" เมื่อ `available` หลัง HK ทำเสร็จ

### 6.4 Mobile-specific

- [ ] Layout `MobileShell` — bottom nav, font ใหญ่, touch target ≥ 44px
- [ ] Route group `/m/*` ไม่แสดง sidebar desktop
- [ ] `viewport` + PWA manifest + icons
- [ ] ทดสอบบน Chrome Android + Safari iOS
- [ ] Offline banner (read-only) — ไม่ sync offline ใน Phase 2

### 6.5 Tasks

- [ ] สร้าง `src/modules/housekeeping/presentation/mobile/` pages
- [ ] Router `/m/housekeeping` + RequirePermissions housekeeping:task
- [ ] Reuse hooks จาก `housekeeping/api/queries.ts`
- [ ] Link จาก desktop HK page → "ເປີດໃນໂທລະສັບ"
- [ ] QA กับ role housekeeping@hotel.com บนมือถือจริง

---

## 7. ลำดับงานแนะนำ (Sprint-style)

| Sprint | งาน | ประมาณ |
|--------|-----|--------|
| **S1** | 2.0 Schema + availability service + refactor reservation | 1–2 สัปดาห์ |
| **S2** | 2.1 HK Shift backend + desktop UI | 1 สัปดาห์ |
| **S3** | 2.2 Mobile PWA + task flow | 1 สัปดาห์ |
| **S4** | 2.3 Booking Engine public | 1–2 สัปดาห์ |
| **S5** | 2.4 Channel adapter + webhook + 1 OTA | 2–3 สัปดาห์ |
| **S6** | QA end-to-end + runbook + demo seed อัปเดต | 1 สัปดาห์ |

---

## 8. Definition of Done — Post-MVP Phase 2

1. **Overbooking:** จองห้องสุดท้ายผ่าน Front Desk แล้ว OTA/direct ไม่สามารถจองซ้ำได้
2. **Direct Booking:** ลูกค้าจองผ่าน `/book` → เห็นบน Front Desk + Calendar ด้วย source `direct_web`
3. **OTA:** จองเข้า webhook 1 ครั้ง → reservation เดียว; retry ไม่ซ้ำ
4. **HK Shift:** เปิดกะ → ทำห้อง 3 ห้อง → ปิดกะ → สรุปตัวเลขถูกต้อง
5. **HK Mobile:** แม่บ้านอัปเดตสถานะบนมือถือ → Reception เห็นห้อง `available` ภายใน ≤ 15 วินาที
6. **RBAC:** Housekeeping เข้า `/m/housekeeping` ได้; Receptionist ไม่เปิดกะ HK ได้
7. **Audit:** channel sync log + reservation source ครบสำหรับ debug

---

## 9. Environment & Deploy เพิ่มเติม

```env
# Channel Manager (ตัวอย่าง Channex)
CHANNEX_API_KEY=
CHANNEX_PROPERTY_ID=
WEBHOOK_SECRET_CHANNELS=

# Booking Engine
PUBLIC_BOOKING_ENABLED=true
BOOKING_HOLD_MINUTES=15

# Optional email
SMTP_HOST=
SMTP_FROM=
```

- Nginx: expose `/book` และ `/api/public/*` ไม่ต้อง auth
- Webhook URL ต้อง HTTPS public สำหรับ OTA
- อัปเดต `deploy/group_vars/prod.yml` sync env keys ใหม่

---

## 10. Migration จาก MVP UI เดิม

| MVP ปัจจุบัน | Phase 2 |
|--------------|---------|
| `/app/housekeeping` — รายการห้อง cleaning + ปุ่มพร้อมใช้ | เพิ่ม task workflow + shift bar; mobile ที่ `/m/housekeeping` |
| `HousekeepingPage.tsx` | คงไว้เป็น desktop view / supervisor |
| `reservations` ไม่มี source | แสดง badge source ทุกที่ที่มี reservation |
| `/api/reservations/availability` | ขยาย + ใช้ร่วม public booking |

---

## 11. Checklist รวม (copy ไปติดตาม)

### 2.0 Foundation
- [ ] `channels` schema + migration
- [ ] ขยาย `reservation.source` + external ids
- [ ] `get-room-type-availability` + transactional reserve
- [ ] Refactor create/cancel reservation
- [ ] Admin `/app/channels`

### 2.1 Housekeeping Shift
- [ ] `hk_shift` + `hk_room_task` schema
- [ ] Permissions `housekeeping:*`
- [ ] Open/close shift services
- [ ] HK shift UI + history

### 2.2 Mobile
- [ ] `/m/housekeeping` PWA
- [ ] Task cards + shift integration
- [ ] Refetch / SSE สำหรับ Reception

### 2.3 Booking Engine
- [ ] Public routes + rate limit
- [ ] Hold + confirm flow
- [ ] Confirmation page + branding

### 2.4 Channel Manager
- [ ] Adapter interface + 1 implementation
- [ ] Webhook inbound
- [ ] Push availability job
- [ ] Sync log UI + manual retry
- [ ] OTA จริง 1 แพลตฟอร์ม

### QA
- [ ] Overbooking scenario tests
- [ ] 3 roles RBAC regression
- [ ] Demo seed รองรับ channel + HK shift
