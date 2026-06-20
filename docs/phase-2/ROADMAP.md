# Phase 2 Roadmap — Channel Management & Operations

> แผนพัฒนาหลัง MVP (Phase 0–6 ใน [`../mvp/MODULE_ROADMAP.md`](../mvp/MODULE_ROADMAP.md) เสร็จแล้ว)
> อ้างอิงภาพรวมจาก [`../PROJECT_OVERVIEW.md`](../PROJECT_OVERVIEW.md)
> แผน implement ละเอียด: [`implementation/README.md`](./implementation/README.md)

สัญลักษณ์สถานะ: ✅ พร้อมแล้ว · 🚧 กำลังทำ · ⬜ ยังไม่เริ่ม

> **หมายเหตุเรื่องชื่อ Phase:** MVP ใช้ Phase 0–6 · Post-MVP ใช้ **Phase 2.x** (2.0–2.4)

---

## ภาพรวมลำดับ

```
MVP (Phase 0–6)  ✅  ฐานระบบ + จอง + Front Desk + Billing + Cash Shift + Reports
   │
Phase 2.0        ⬜  Inventory & Channel Foundation
   ├── Phase 2.1 ⬜  Housekeeping Shift
   │      └── Phase 2.2 ⬜  HK Mobile (PWA)
   ├── Phase 2.3 ⬜  Booking Engine (Direct Booking)
   └── Phase 2.4 ⬜  Channel Manager (OTA)
```

---

## Sub-phase 2.0 — Inventory & Channel Foundation (⬜)

โมดูล: `channels` + ขยาย `reservations`

### ขอบเขต
- Reservation `source` + external booking id
- Sales channel + room type mapping
- Inventory hold + availability service (single source of truth)
- Sync log schema

### Tasks
- [ ] Schema + migration
- [ ] `get-room-type-availability` + `reserve-inventory`
- [ ] Refactor create/cancel reservation
- [ ] Admin `/app/channels` + badge source บน Front Desk

**Deliverable:** กันจองซ้อนรวมทุกช่องทาง · Admin ตั้ง channel/mapping ได้

→ [`implementation/PHASE_2_0_FOUNDATION.md`](./implementation/PHASE_2_0_FOUNDATION.md)

---

## Sub-phase 2.1 — Housekeeping Shift (⬜)

โมดูล: `housekeeping`

### ขอบเขต
- Open / Close shift + handover note
- Task queue (`pending` → `in_progress` → `done`)
- ผูก `hk_shift_id` เมื่อ mark ห้องพร้อมใช้

### Tasks
- [ ] Schema `hk_shift` + `hk_room_task`
- [ ] Permissions `housekeeping:*`
- [ ] Shift bar + `/app/hk-shifts` history

**Deliverable:** เปิดกะ → ทำห้อง → ปิดกะส่งมอบ

→ [`implementation/PHASE_2_1_HK_SHIFT.md`](./implementation/PHASE_2_1_HK_SHIFT.md) · อ้างอิง [`../mvp/implementation/PHASE_6_CASH_SHIFT.md`](../mvp/implementation/PHASE_6_CASH_SHIFT.md)

---

## Sub-phase 2.2 — Housekeeping Mobile App (⬜)

โมดูล: `housekeeping` (mobile UI)

### ขอบเขต
- PWA `/m/housekeeping` touch-first
- Shift + task tabs บนมือถือ
- Polling 10s (SSE ใน 2.2.1)

### Tasks
- [ ] `MobileShell` + route `/m/*`
- [ ] Task cards + PWA manifest
- [ ] QA บนมือถือจริง

**Deliverable:** แม่บ้านอัปเดตสถานะบนมือถือ · Reception เห็น `available` ≤ 15s

→ [`implementation/PHASE_2_2_HK_MOBILE.md`](./implementation/PHASE_2_2_HK_MOBILE.md)

---

## Sub-phase 2.3 — Booking Engine (⬜)

โมดูล: `booking-engine`

### ขอบเขต
- Public `/book` — ค้นหา + hold + confirm
- `reservation.source = direct_web`
- จ่ายที่โรงแรม (ยังไม่รับ online payment)

### Tasks
- [ ] Public API + rate limit
- [ ] UI search / checkout / confirmation
- [ ] Badge source บน Front Desk / Calendar

**Deliverable:** ลูกค้าจองตรงผ่านเว็บโรงแรม

→ [`implementation/PHASE_2_3_BOOKING_ENGINE.md`](./implementation/PHASE_2_3_BOOKING_ENGINE.md)

---

## Sub-phase 2.4 — Channel Manager (⬜)

โมดูล: `channels` (OTA adapter)

### ขอบเขต
- Adapter pattern + webhook inbound
- Push availability + sync log + retry
- OTA จริง ≥ 1 แพลตฟอร์ม (หรือ mock + CSV)

### Tasks
- [ ] Webhook + idempotent import
- [ ] Push job (cron 5 นาที)
- [ ] Sync log UI + runbook

**Deliverable:** จอง OTA เข้าระบบอัตโนมัติ · กัน overbooking

→ [`implementation/PHASE_2_4_CHANNEL_MANAGER.md`](./implementation/PHASE_2_4_CHANNEL_MANAGER.md)

---

## สรุปโมดูลใหม่

| โมดูล | Sub-phase |
|-------|-----------|
| `channels` | 2.0, 2.4 |
| `booking-engine` | 2.3 |
| `housekeeping` | 2.1, 2.2 |

---

## ลำดางานแนะนำ (Sprint)

| Sprint | งาน | ประมาณ |
|--------|-----|--------|
| S1 | 2.0 Foundation | 1–2 สัปดาห์ |
| S2 | 2.1 HK Shift | 1 สัปดาห์ |
| S3 | 2.2 HK Mobile | 1 สัปดาห์ |
| S4 | 2.3 Booking Engine | 1–2 สัปดาห์ |
| S5 | 2.4 Channel Manager | 2–3 สัปดาห์ |
| S6 | QA + demo seed | 1 สัปดาห์ |

---

## Definition of Done — Phase 2 รวม

- [ ] **Overbooking:** จองห้องสุดท้ายในระบบ → OTA/direct จองซ้ำไม่ได้
- [ ] **Direct Booking:** `/book` → Front Desk + Calendar (source `direct_web`)
- [ ] **OTA:** webhook 1 ครั้ง = 1 reservation; retry ไม่ซ้ำ
- [ ] **HK Shift:** เปิดกะ → 3 ห้อง → ปิดกะ → ตัวเลขถูก
- [ ] **HK Mobile:** อัปเดตบนมือถือ → Reception เห็น `available` ≤ 15s
- [ ] **RBAC:** Housekeeping เข้า `/m/housekeeping` · Receptionist เปิดกะ HK ไม่ได้
- [ ] **Audit:** sync log + reservation source ครบ

---

## นอกขอบเขต Phase 2 (Phase 3+)

- Payment Gateway online
- Dynamic pricing / revenue management
- Multi-property
- Native iOS/Android
- POS / Mini-bar

---

## เอกสารที่เกี่ยวข้อง

| เอกสาร | เนื้อหา |
|--------|---------|
| [`implementation/README.md`](./implementation/README.md) | Index แผน implement 2.0–2.4 |
| [`../mvp/MODULE_ROADMAP.md`](../mvp/MODULE_ROADMAP.md) | MVP Phase 0–6 |
| [`../mvp/implementation/PHASE_6_CASH_SHIFT.md`](../mvp/implementation/PHASE_6_CASH_SHIFT.md) | Pattern กะ Reception |
