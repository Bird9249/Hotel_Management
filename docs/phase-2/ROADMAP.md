# Phase 2 Roadmap — Channel Management & Operations

> แผนพัฒนาหลัง MVP (Phase 0–6 ใน [`../mvp/MODULE_ROADMAP.md`](../mvp/MODULE_ROADMAP.md) เสร็จแล้ว)
> อ้างอิงภาพรวมจาก [`../PROJECT_OVERVIEW.md`](../PROJECT_OVERVIEW.md)

สัญลักษณ์สถานะ: ✅ พร้อมแล้ว · 🚧 กำลังทำ · ⬜ ยังไม่เริ่ม

> **หมายเหตุเรื่องชื่อ Phase:** ใน MVP ใช้ Phase 0–6 (Guest & Reservation = MVP Phase 2)
> ใน Post-MVP ใช้เลข Phase ใหม่เริ่มจาก **Post-MVP Phase 2** ตามแผนการตลาด/โปรดักต์

---

## ภาพรวมลำดับ Post-MVP

```
MVP (Phase 0–6)  ✅  ฐานระบบ + จอง + Front Desk + Billing + Cash Shift + Reports
   │
Post-MVP Phase 2  ⬜  Channel Management & Operations
   │                 (OTA sync · Direct Booking · HK Mobile · HK Shift)
   │
Post-MVP Phase 3  ⬜  (วางแผนถัดไป — Payment Gateway, Loyalty, Multi-property ฯลฯ)
```

---

## Post-MVP Phase 2 — Channel Management & Operations

> 🚀 **ເນັ້ນເພີ່ມຍອດຂາຍ ແລະ ງານແມ່ບ້ານ**
> ດຶງລູກຄ້າຈາກຊ່ອງທາງ online ແລະ ເຊື່ອມງານພາຍໃນໂຮງແຮມໃຫ້ໄຫຼລຽບ

| ฟีเจอร์ | สถานะ | โมดูลหลัก | แผน implement |
|---------|-------|-----------|----------------|
| **Inventory & Channel Foundation** | ⬜ | `channels` (ใหม่) + ขยาย `reservations` | [`implementation/PHASE_2_CHANNEL_OPS.md`](./implementation/PHASE_2_CHANNEL_OPS.md) §2 |
| **Booking Engine (Direct Booking)** | ⬜ | `booking-engine` (public) | §3 |
| **Channel Manager (OTA Sync)** | ⬜ | `channels` + adapter | §4 |
| **Housekeeping Shift** | ⬜ | `housekeeping` (ใหม่) | §5 |
| **Housekeeping Mobile App** | ⬜ | `housekeeping` (PWA/mobile UI) | §6 |

### ลำดับการ implement ภายใน Phase 2

```
2.0  Foundation     inventory calendar + reservation.source + channel allotment
        │
        ├──► 2.1  Housekeeping Shift      (ขนานได้ — ไม่พึ่ง OTA)
        │         │
        │         └──► 2.2  HK Mobile App  (UI มือถือ + real-time queue)
        │
        ├──► 2.3  Booking Engine          (public /book — ใช้ inventory เดียวกัน)
        │
        └──► 2.4  Channel Manager       (ซับซ้อนสุด — sync OTA หลัง inventory พร้อม)
```

**เหตุผล:** ทั้ง OTA และ Direct Booking ต้องใช้ **แหล่งความจริงเดียว (single source of truth)** เรื่องห้องว่าง
→ ต้องมี inventory layer ก่อน จึงกัน overbooking ได้จริง
Housekeeping Shift/Mobile ต่อยอดจาก MVP Phase 3 (`/app/housekeeping`) ได้โดยไม่รอ OTA

---

## สรุปโมดูลใหม่ (Post-MVP Phase 2)

| โมดูล | หน้าที่ |
|-------|---------|
| `channels` | ตั้งค่า OTA, mapping room type, sync log, webhook |
| `booking-engine` | หน้าจองสาธารณะ + embed widget + confirmation |
| `housekeeping` | กะแม่บ้าน, task queue, mobile UI, สรุปส่งมอบ |

---

## Checklist ภาพรวม Post-MVP Phase 2

- [ ] 2.0 — ขยาย schema `reservation` (source, external refs) + inventory by room type
- [ ] 2.0 — service กันจองซ้อนรวมทุกช่องทาง (internal + direct + OTA hold)
- [ ] 2.1 — Housekeeping Shift: เปิด/ปิดกะ + สรุปห้องที่ทำความสะอาด
- [ ] 2.2 — Mobile UI แม่บ้าน (PWA) + อัปเดตสถานะห้องแบบ touch-first
- [ ] 2.3 — Booking Engine: หน้า `/book` + จองโดยตรง + email/confirmation
- [ ] 2.4 — Channel Manager: เชื่อม OTA อย่างน้อย 1 แพลตฟอร์ม (หรือ middleware)
- [ ] 2.4 — Push/Pull inventory real-time + retry + audit log
- [ ] QA — ทดสอบ overbooking scenario + HK shift handover + direct booking flow

---

## เอกสารที่เกี่ยวข้อง

| เอกสาร | เนื้อหา |
|--------|---------|
| [`implementation/PHASE_2_CHANNEL_OPS.md`](./implementation/PHASE_2_CHANNEL_OPS.md) | แผน implement ละเอียด Phase 2 |
| [`../mvp/MODULE_ROADMAP.md`](../mvp/MODULE_ROADMAP.md) | MVP Phase 0–6 (เสร็จแล้ว) |
| [`../mvp/implementation/PHASE_6_CASH_SHIFT.md`](../mvp/implementation/PHASE_6_CASH_SHIFT.md) | อ้างอิง pattern กะ Reception → กะแม่บ้าน |
