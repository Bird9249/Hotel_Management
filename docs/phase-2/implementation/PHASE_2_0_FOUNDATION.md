# Phase 2.0 — Inventory & Channel Foundation

> เป้าหมาย: สร้าง **single source of truth** สำหรับห้องว่าง — ใช้ร่วม Front Desk, Direct Booking และ OTA
> Dependencies: MVP Phase 0–6 (โดยเฉพาะ `rooms`, `reservations`)
> โมดูลใหม่: `src/modules/channels` (+ ขยาย `reservations`)
> อ้างอิง: [`../ROADMAP.md`](../ROADMAP.md)

> **ทำก่อนทุก sub-phase อื่น** — Booking Engine (2.3) และ Channel Manager (2.4) ต้องพึ่ง inventory layer นี้

---

## 1. ขอบเขต

| Feature | รายละเอียด |
|---------|------------|
| **Reservation source** | บันทึกช่องทางจอง (`front_desk`, `direct_web`, OTA codes) |
| **Sales channel** | ตาราง channel + mapping room type กับ OTA |
| **Inventory hold** | block ชั่วคราวตอน guest กำลัง checkout บนเว็บ |
| **Availability service** | คำนวณห้องว่างตาม room type รวมทุกช่องทาง |
| **Sync log** | audit push/pull ไป OTA |

**Deliverable:** Admin ตั้งค่า channel + mapping ได้ · จองในระบบกันซ้อนรวม hold · แสดง `source` บน Front Desk / Calendar

---

## 2. ปัญหาที่ต้องแก้จาก MVP

MVP ปัจจุบัน:
- กันจองซ้อนเฉพาะ `reservation` ในระบบ (`list-room-availability.ts` + overlap check ตอนสร้างจอง)
- ไม่มี `source` / external booking id
- Availability ระดับ **ห้อง (room)** ไม่ใช่ **room type allotment** ที่ OTA ใช้

OTA และ Direct Booking ต้องการ:
- Allotment ตาม **room type** + optional cap ต่อ channel
- Hold/block inventory ระหว่าง checkout ของ guest กับ sync ไป OTA
- Idempotent import จาก webhook (จองซ้ำจาก retry ไม่สร้าง 2 records)

---

## 3. Database Schema

### 3.1 ขยาย `reservation`

```ts
// src/server/platform/db/schema/reservations.ts (migration ใหม่)
export const reservation = pgTable("reservation", {
  // ... ฟิลด์เดิม ...
  source: text("source").notNull().default("front_desk"),
  // front_desk | direct_web | agoda | booking_com | expedia | other
  channelId: text("channel_id").references(() => salesChannel.id, {
    onDelete: "set null",
  }),
  externalBookingId: text("external_booking_id"),
  externalPayload: jsonb("external_payload"),
  notes: text("notes"),
});
```

สร้าง unique index: `(channel_id, external_booking_id)` where external_booking_id is not null

### 3.2 ตารางใหม่ `sales_channel`

```ts
// src/server/platform/db/schema/channels.ts
export const salesChannel = pgTable("sales_channel", {
  id: text("id").primaryKey(),
  code: text("code").notNull().unique(), // direct_web | agoda | booking_com | expedia
  name: text("name").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  config: jsonb("config"),
  lastSyncAt: timestamp("last_sync_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
```

### 3.3 `channel_room_mapping`

```ts
export const channelRoomMapping = pgTable("channel_room_mapping", {
  id: text("id").primaryKey(),
  channelId: text("channel_id").notNull().references(() => salesChannel.id),
  roomTypeId: text("room_type_id").notNull().references(() => roomType.id),
  externalRoomTypeId: text("external_room_type_id").notNull(),
  allotment: integer("allotment"), // null = ใช้จำนวนห้องจริงทั้งหมดของ type
});
```

### 3.4 `inventory_hold`

```ts
export const inventoryHold = pgTable("inventory_hold", {
  id: text("id").primaryKey(),
  roomTypeId: text("room_type_id").notNull(),
  checkInDate: date("check_in_date").notNull(),
  checkOutDate: date("check_out_date").notNull(),
  quantity: integer("quantity").notNull().default(1),
  source: text("source").notNull(), // direct_web
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
```

### 3.5 `channel_sync_log`

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

รัน `bun run db:generate` แล้ว `bun run db:migrate`

---

## 4. Domain Layer — โมดูล `channels`

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
│   │   ├── get-room-type-availability.ts
│   │   ├── reserve-inventory.ts
│   │   └── release-hold.ts
│   └── http/
│       └── channels.routes.ts
└── presentation/
    ├── pages/ChannelsSettingsPage.tsx
    └── ui/ChannelMappingTable.tsx
```

---

## 5. กฎธุรกิจ Availability

```
availableCount(roomType, dateRange) =
  physicalRooms(roomType)
  - activeReservations(roomType, range, statuses: booked|checked_in)
  - activeHolds(roomType, range, not expired)
  - channelBlocked(roomType, range)

การจองใหม่ (ทุก source):
1. lock ระดับ transaction
2. ตรวจ availableCount >= 1
3. insert reservation + audit
4. enqueue push availability ไป OTA (async — Phase 2.4)
```

**แก้** `create-reservation.ts` ให้เรียก `reserveInventoryService` แทน overlap check แยก

**แก้** `list-room-availability.ts` ให้รองรับ filter by `roomTypeId`

---

## 6. Permission (RBAC)

```ts
channels: {
  read: "channels:read",
  manage: "channels:manage",
  sync: "channels:sync",
},
```

| Role | channels:read | channels:manage | channels:sync |
|------|:-------------:|:---------------:|:-------------:|
| Admin | ✓ | ✓ | ✓ |
| Receptionist | ✓ | — | — |
| Housekeeping | — | — | — |

รัน `bun run rbac:sync`

---

## 7. API & UI

| Method | Path | Permission | คำอธิบาย |
|--------|------|------------|----------|
| GET | `/api/hotel/channels` | channels:read | รายการ channel |
| PATCH | `/api/hotel/channels/:id` | channels:manage | ตั้งค่า channel |
| GET/PUT | `/api/hotel/channels/:id/mappings` | channels:manage | room type mapping |

- หน้า `/app/channels` — รายการ channel + mapping
- แสดง badge `source` ในตารางจอง / Front Desk / Calendar

---

## 8. Tasks

- [x] Schema + migration (`channels.ts`, ขยาย `reservations.ts`)
- [x] `get-room-type-availability` service
- [ ] Unit test overlap scenarios
- [x] `reserve-inventory` + `release-hold` services
- [x] Refactor create/update reservation ให้ใช้ inventory service
- [ ] Refactor cancel reservation ให้ trigger inventory recalc / sync event (Phase 2.4)
- [x] Permissions `channels:*` + migration update role seed
- [ ] รัน `bun run rbac:sync` บนฐานข้อมูลจริงหลัง deploy
- [x] Admin UI `/app/channels`
- [x] แสดง `source` ในตารางจอง / Front Desk / Calendar
- [x] Seed `sales_channel` records (`direct_web`, `agoda`, `booking_com`, `expedia`)
- [x] Seed channel room mappings สำหรับ demo data

---

## 9. Definition of Done (Phase 2.0)

- [ ] จองห้องสุดท้ายของ room type ผ่าน Front Desk แล้ว `availableCount` = 0 — QA ด้วยมือ
- [x] Hold หมดอายุแล้วไม่นับใน inventory (`expires_at > now()` filter)
- [ ] Admin ตั้ง mapping room type กับ channel ได้ — QA ด้วยมือบน UI
