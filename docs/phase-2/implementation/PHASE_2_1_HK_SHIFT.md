# Phase 2.1 — Housekeeping Shift (ກະແມ່ບ້ານ)

> เป้าหมาย: ระบบเปิด–ปิดกะแม่บ้าน + task queue + สรุปส่งมอบ
> Dependencies: MVP Phase 1 (`rooms:status`), MVP Phase 3 (`/app/housekeeping`)
> อ้างอิง pattern: [`../../mvp/implementation/PHASE_6_CASH_SHIFT.md`](../../mvp/implementation/PHASE_6_CASH_SHIFT.md)
> โมดูลใหม่: `src/modules/housekeeping`
> อ้างอิง: [`../ROADMAP.md`](../ROADMAP.md)

> **ขนานได้กับ Phase 2.0** — ไม่พึ่ง OTA / Booking Engine

---

## 1. ขอบเขต

| Feature | รายละเอียด |
|---------|------------|
| **Open Shift** | แม่บ้าน/login เปิดกะ — บันทึกผู้รับผิดชอบ + เวลา |
| **งานในกะ** | ทุกครั้งที่ mark ห้อง `cleaning → available` ผูก `hk_shift_id` |
| **Close Shift** | สรุปจำนวนห้องที่ทำเสร็จ + ห้องค้าง + หมายเหตุส่งมอบ |
| **ประวัติกะ** | Admin / supervisor ดูย้อนหลัง |

**Deliverable:** เปิดกะ → ทำห้อง → ปิดกะส่งมอบ พร้อม snapshot ตัวเลข

**นอกขอบเขต (Phase 2.1.1):**
- รายงาน HK ใน reports (ห้อง/กะ/วัน)
- Manager sign-off ข้ามกะ

---

## 2. Database Schema

```ts
// src/server/platform/db/schema/housekeeping.ts
export const hkShift = pgTable("hk_shift", {
  id: text("id").primaryKey(),
  status: text("status").notNull().default("open"), // open | closed
  openedByUserId: text("opened_by_user_id").notNull().references(() => user.id),
  openedAt: timestamp("opened_at").notNull().defaultNow(),
  closedByUserId: text("closed_by_user_id").references(() => user.id),
  closedAt: timestamp("closed_at"),
  roomsCompleted: integer("rooms_completed"),
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

รัน `bun run db:generate` แล้ว `bun run db:migrate`

---

## 3. กฎธุรกิจ

```
1. มี hk_shift open ได้หลายกะพร้อมกัน (หลายคนทำงาน) — ต่างจาก Cash Shift ทีละ 1
2. เปิดกะ → ดึงห้อง status=cleaning เป็น tasks อัตโนมัติ
3. กด "เริ่มทำ" → task in_progress
4. กด "ทำเสร็จ" → room available + task done + ผูก shiftId
5. ปิดกะ → snapshot roomsCompleted / roomsPending + handoverNote
6. ไม่มีกะ open → ยังเปลี่ยนสถานะห้องได้ (warn) เหมือน payment ไม่มี cash shift
```

---

## 4. Permission (RBAC)

```ts
housekeeping: {
  read: "housekeeping:read",
  shift: "housekeeping:shift",
  task: "housekeeping:task",
},
```

| Role | housekeeping:read | housekeeping:shift | housekeeping:task |
|------|:-----------------:|:------------------:|:-----------------:|
| Admin | ✓ | ✓ | ✓ |
| Housekeeping | ✓ | ✓ | ✓ |
| Receptionist | ✓ (ดูสถานะ) | — | — |

รัน `bun run rbac:sync`

---

## 5. Domain Layer

```
src/modules/housekeeping/
├── api/index.ts
├── domain/
│   ├── contracts/hk-shift.ts
│   ├── contracts/hk-task.ts
│   ├── repo/
│   │   ├── get-open-shifts.ts
│   │   ├── list-tasks.ts
│   │   ├── insert-shift.ts
│   │   ├── close-shift.ts
│   │   └── upsert-task.ts
│   ├── service/
│   │   ├── open-shift.ts
│   │   ├── close-shift.ts
│   │   ├── list-tasks.ts
│   │   └── complete-task.ts
│   └── http/housekeeping.routes.ts
└── presentation/
    ├── pages/HkShiftsPage.tsx
    ├── ui/HkShiftBar.tsx
    └── api/queries.ts
```

### แก้ `set-room-status` (โมดูล `rooms`)

เมื่อมี shift open → บันทึก/อัปเดต `hk_room_task` อัตโนมัติ

---

## 6. API Endpoints

| Method | Path | Permission |
|--------|------|------------|
| GET | `/api/housekeeping/shifts/current` | housekeeping:read |
| POST | `/api/housekeeping/shifts/open` | housekeeping:shift |
| POST | `/api/housekeeping/shifts/:id/close` | housekeeping:shift |
| GET | `/api/housekeeping/shifts` | housekeeping:read |
| GET | `/api/housekeeping/tasks` | housekeeping:read |
| PATCH | `/api/housekeeping/tasks/:id` | housekeeping:task |
| PATCH | `/api/rooms/:id/status` | rooms:status (เดิม — เพิ่ม shiftId) |

---

## 7. UI (Desktop)

| Route | ฟังก์ชัน |
|-------|----------|
| `/app/housekeeping` | task list + shift bar (ปรับจาก MVP) |
| `/app/hk-shifts` | ประวัติกะ (Admin) |

- แถบสถานะกะเหมือน `CashShiftBar` บน Front Desk
- ปรับ `HousekeepingPage.tsx`: ปุ่มเริ่ม/เสร็จ แทน confirm dialog อย่างเดียว

---

## 8. Migration จาก MVP

| MVP ปัจจุบัน | Phase 2.1 |
|--------------|-----------|
| `/app/housekeeping` — รายการ cleaning + ปุ่มพร้อมใช้ | + task workflow + shift bar |
| `HousekeepingPage.tsx` | คงเป็น desktop / supervisor view |

---

## 9. Tasks

- [x] Schema `housekeeping.ts` + migration
- [x] Permissions + rbac:sync
- [x] Services: open/close shift, list tasks, complete task
- [x] แก้ `set-room-status` ให้บันทึก `hk_room_task`
- [x] `HkShiftBar` + ปรับ `HousekeepingPage.tsx`
- [x] หน้า `/app/hk-shifts` ประวัติกะ
- [x] Sidebar + breadcrumb + route registration

---

## 10. Definition of Done (Phase 2.1)

- [ ] เปิดกะ → ทำห้อง 3 ห้อง → ปิดกะ → ตัวเลข `roomsCompleted` ถูกต้อง
- [ ] Housekeeping เปิด/ปิดกะได้ · Receptionist เปิดกะไม่ได้
- [ ] ห้อง `cleaning` จาก check-out ปรากฏเป็น task อัตโนมัติ
