# Phase 2.3 — Booking Engine (Direct Booking)

> เป้าหมาย: ระบบจองห้องโดยตรงผ่านเว็บ/โซเชียลโรงแรม — ลดค่าคอมมิชชัน OTA
> Dependencies: Phase 2.0 (`channels` inventory + `inventory_hold`)
> โมดูลใหม่: `src/modules/booking-engine`
> อ้างอิง: [`../ROADMAP.md`](../ROADMAP.md)

---

## 1. ขอบเขต

| Feature | รายละเอียด |
|---------|------------|
| ค้นหาห้องว่าง | เลือกวันเข้า/ออก + จำนวนผู้เข้าพัก → room type ว่าง + ราคา |
| ฟอร์มจอง | ชื่อ, โทร, อีเมล (optional), หมายเหตุ |
| Hold + Confirm | `inventory_hold` 15 นาที → `reservation` source=`direct_web` |
| Confirmation | หน้า `/book/confirmation/:code` + รหัสจอง |
| ชำระเงิน | **จ่ายที่โรงแรม** (ยังไม่รับ online payment) |

**Deliverable:** ลูกค้าจองผ่าน `/book` → Reception เห็นบน Front Desk + Calendar

**นอกขอบเขต:**
- Online payment gateway (Post-MVP Phase 3)
- Multi-language (optional EN toggle ภายหลัง)
- CAPTCHA (Phase 2.3.1 — honeypot ก่อน)

---

## 2. Routing & Auth

```
/book                        — ค้นหา + เลือกห้อง (public)
/book/checkout               — ฟอร์ม + hold
/book/confirmation/:code     — สถานะจอง
```

- Routes **นอก** layout `/app` (ไม่มี sidebar admin)
- API public: rate limit ต่อ IP
- Feature flag: `PUBLIC_BOOKING_ENABLED=true`

---

## 3. Domain Layer

```
src/modules/booking-engine/
├── api/index.ts                    # public routes only
├── domain/
│   ├── contracts/
│   │   ├── search-query.ts
│   │   ├── hold-input.ts
│   │   └── confirm-input.ts
│   ├── service/
│   │   ├── search-availability.ts   # → channels.get-room-type-availability
│   │   ├── create-hold.ts
│   │   ├── confirm-booking.ts         # guest upsert + reservation + release hold
│   │   └── get-booking-by-code.ts
│   └── http/public.routes.ts
└── presentation/
    ├── pages/BookSearchPage.tsx
    ├── pages/BookCheckoutPage.tsx
    ├── pages/BookConfirmationPage.tsx
    └── ui/RoomTypeCard.tsx
```

---

## 4. Public API

| Method | Path | คำอธิบาย |
|--------|------|----------|
| GET | `/api/public/availability` | ค้นหา room type ว่าง + ราคา |
| POST | `/api/public/holds` | สร้าง inventory hold |
| POST | `/api/public/bookings/confirm` | ยืนยันจอง → reservation |
| GET | `/api/public/bookings/:code` | ดูสถานะจอง |

- Rate limit ต่อ IP
- Honeypot field กัน bot (MVP)

---

## 5. Branding

- ดึง `hotel_settings` (ชื่อ, โลโก้, โทร) — มีจาก MVP
- Embed: `<iframe src="https://hotel.example/book?embed=1">` หรือ link Facebook
- UI ภาษาลาว

---

## 6. Integration กับระบบ Admin

- `reservation.source = direct_web`
- `reservation.channelId` → `sales_channel` code `direct_web`
- Front Desk / Calendar: filter + badge source
- Email confirmation (optional — SMTP env)

---

## 7. Environment & Deploy

```env
PUBLIC_BOOKING_ENABLED=true
BOOKING_HOLD_MINUTES=15

# Optional email
SMTP_HOST=
SMTP_FROM=
```

- Nginx: expose `/book` และ `/api/public/*` ไม่ต้อง auth
- อัปเดต `deploy/group_vars/prod.yml` sync env keys

---

## 8. Tasks

- [ ] โมดูล `booking-engine` + public routes
- [ ] `search-availability` → Phase 2.0 service
- [ ] Hold + confirm flow + release hold
- [ ] UI `/book`, `/book/checkout`, `/book/confirmation/:code`
- [ ] Rate limit + honeypot
- [ ] Seed/migration `sales_channel` `direct_web`
- [ ] Badge source บน Front Desk / Calendar
- [ ] Email confirmation (optional)

---

## 9. Definition of Done (Phase 2.3)

- [ ] ลูกค้าจองผ่าน `/book` สำเร็จ → เห็นบน Front Desk + Calendar
- [ ] Hold หมดอายุแล้ว slot ว่างอีกครั้ง
- [ ] จอง direct ไม่ทำให้ Front Desk overbook (ใช้ inventory เดียวกับ 2.0)
- [ ] `PUBLIC_BOOKING_ENABLED=false` แล้วปิด public routes ได้
