# Implementation Plans — Phase 2 (Channel Management & Operations)

แผนการ implement แบบลงรายละเอียด แยกตามแต่ละ Sub-phase
อ้างอิงภาพรวมจาก [`../../PROJECT_OVERVIEW.md`](../../PROJECT_OVERVIEW.md) และ [`../ROADMAP.md`](../ROADMAP.md)

**Prerequisite:** MVP Phase 0–6 ครบ — [`../../mvp/MODULE_ROADMAP.md`](../../mvp/MODULE_ROADMAP.md)

---

## รายการแผนแต่ละ Sub-phase

| Sub-phase | ไฟล์ | ขอบเขต |
|-----------|------|--------|
| 2.0 | [`PHASE_2_0_FOUNDATION.md`](./PHASE_2_0_FOUNDATION.md) | Inventory layer + `channels` + ขยาย `reservations` |
| 2.1 | [`PHASE_2_1_HK_SHIFT.md`](./PHASE_2_1_HK_SHIFT.md) | ກະແມ່ບ້ານ — Open/Close Shift + task queue |
| 2.2 | [`PHASE_2_2_HK_MOBILE.md`](./PHASE_2_2_HK_MOBILE.md) | PWA `/m/housekeeping` — mobile UI แม่บ้าน |
| 2.3 | [`PHASE_2_3_BOOKING_ENGINE.md`](./PHASE_2_3_BOOKING_ENGINE.md) | Direct Booking — หน้า public `/book` |
| 2.4 | [`PHASE_2_4_CHANNEL_MANAGER.md`](./PHASE_2_4_CHANNEL_MANAGER.md) | OTA sync — webhook + push availability |

> MVP: [`../../mvp/implementation/README.md`](../../mvp/implementation/README.md)

---

## ลำดับการ implement

```
2.0  Foundation  ──►  2.3  Booking Engine
        │                      │
        │                      └──►  2.4  Channel Manager (OTA)
        │
        ├──►  2.1  HK Shift  ──►  2.2  HK Mobile
```

---

## ข้อตกลงร่วม (Conventions)

ใช้โครงสร้างโมดูลและ checklist เดียวกับ MVP — อ้างอิง [`../../mvp/implementation/README.md`](../../mvp/implementation/README.md)

> หมายเหตุภาษา: label บน UI เป็นภาษาลาว · ชื่อโค้ด/ตัวแปรเป็นภาษาอังกฤษ

---

## เอกสารที่เกี่ยวข้อง

| เอกสาร | เนื้อหา |
|--------|---------|
| [`../ROADMAP.md`](../ROADMAP.md) | Roadmap + checklist ภาพรวม + Definition of Done |
| [`../../mvp/implementation/PHASE_6_CASH_SHIFT.md`](../../mvp/implementation/PHASE_6_CASH_SHIFT.md) | Pattern กะ Reception → กะแม่บ้าน (2.1) |
