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
| SSR Public Website | `/book/*` render HTML จาก server เพื่อ SEO และ social preview |
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
/book/room-types/:slug       — landing/detail room type สำหรับ SEO
/book/checkout               — ฟอร์ม + hold
/book/confirmation/:code     — สถานะจอง
```

- Routes **นอก** layout `/app` (ไม่มี sidebar admin)
- `/book/*` ใช้ SSR/hybrid public renderer ไม่ใช้ SPA fallback เปล่า ๆ
- API public: rate limit ต่อ IP
- Feature flag: `PUBLIC_BOOKING_ENABLED=true`

---

## 3. SSR / SEO Architecture

Project ปัจจุบันเป็น SPA สำหรับ Admin (`/app/*`) และควรคงไว้แบบเดิม เพื่อลดผลกระทบกับระบบหลังบ้าน

แนวทาง Phase 2.3:

- ทำ SSR เฉพาะ public booking routes (`/book/*`) ผ่าน Bun/Elysia server
- Admin routes (`/app/*`, `/m/*`, `/auth/*`) ยัง serve SPA `index.html` เหมือนเดิม
- ใช้ hybrid rendering: server render HTML/metadata ก่อน แล้ว hydrate เฉพาะส่วน interactive เช่น date picker, search result, hold countdown, checkout form
- เพิ่ม SEO metadata: title, description, canonical, Open Graph, hotel name/logo, room type detail
- เพิ่ม structured data (`Hotel`, `LodgingBusiness`, `Offer`) สำหรับหน้า `/book` และ `/book/room-types/:slug`
- หน้า `/book/confirmation/:code` ควรใส่ `noindex` เพราะเป็นข้อมูลเฉพาะการจอง

โครงสร้าง public SSR ที่แนะนำ:

```
src/modules/booking-engine/
├── api/index.ts
├── domain/
├── presentation/
│   ├── ssr/
│   │   ├── render-book-page.tsx
│   │   ├── render-room-type-page.tsx
│   │   ├── render-confirmation-page.tsx
│   │   └── seo.ts
│   ├── pages/
│   └── ui/
└── public-entry.tsx              # hydrate เฉพาะ booking public UI
```

Server routing:

- Production `index.ts`: route `/book/*` เข้า booking SSR handler ก่อน SPA fallback
- Development `index-dev.ts`: รองรับ `/book/*` SSR หรืออย่างน้อย route ผ่าน dev handler ที่ render HTML เทียบเท่า
- Static assets ยังใช้ build pipeline เดิม แต่เพิ่ม public booking client bundle ถ้าจำเป็น

---

## 4. Domain Layer

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
    ├── ssr/
    │   ├── render-book-page.tsx
    │   ├── render-room-type-page.tsx
    │   └── seo.ts
    ├── pages/BookSearchPage.tsx
    ├── pages/BookCheckoutPage.tsx
    ├── pages/BookConfirmationPage.tsx
    └── ui/RoomTypeCard.tsx
```

---

## 5. Public API

| Method | Path | คำอธิบาย |
|--------|------|----------|
| GET | `/api/public/availability` | ค้นหา room type ว่าง + ราคา |
| POST | `/api/public/holds` | สร้าง inventory hold |
| POST | `/api/public/bookings/confirm` | ยืนยันจอง → reservation |
| GET | `/api/public/bookings/:code` | ดูสถานะจอง |

- Rate limit ต่อ IP
- Honeypot field กัน bot (MVP)

---

## 6. Branding

- ดึง `hotel_settings` (ชื่อ, โลโก้, โทร) — มีจาก MVP
- Embed: `<iframe src="https://hotel.example/book?embed=1">` หรือ link Facebook
- UI ภาษาลาว
- SSR metadata ใช้ข้อมูลโรงแรมจริง เช่น ชื่อโรงแรม, โลโก้, เบอร์โทร, ที่อยู่

---

## 7. Integration กับระบบ Admin

- `reservation.source = direct_web`
- `reservation.channelId` → `sales_channel` code `direct_web`
- Front Desk / Calendar: filter + badge source
- Email confirmation (optional — SMTP env)

---

## 8. Environment & Deploy

```env
PUBLIC_BOOKING_ENABLED=true
BOOKING_HOLD_MINUTES=15

# Optional email
SMTP_HOST=
SMTP_FROM=
```

- Nginx: expose `/book` และ `/api/public/*` ไม่ต้อง auth
- Nginx/cache: ห้าม cache checkout/confirmation ที่มีข้อมูลส่วนบุคคล
- SEO: ตรวจ `robots.txt`, canonical URL, sitemap entry สำหรับ `/book` และ room type pages
- อัปเดต `deploy/group_vars/prod.yml` sync env keys

---

## 9. Tasks

- [x] SSR public booking renderer สำหรับ `/book/*`
- [x] SEO metadata + Open Graph + structured data
- [x] โมดูล `booking-engine` + public routes
- [x] `search-availability` → Phase 2.0 service
- [x] Hold + confirm flow + release hold
- [x] UI `/book`, `/book/checkout`, `/book/confirmation/:code`
- [x] Public booking client hydration สำหรับ interactive form/search
- [x] Rate limit + honeypot
- [x] Seed/migration `sales_channel` `direct_web`
- [x] Badge source บน Front Desk / Calendar
- [ ] Email confirmation (optional)

---

## 10. Definition of Done (Phase 2.3)

- [x] View source ของ `/book` เห็น HTML content + meta/OG โดยไม่ต้องรอ JS
- [x] ลูกค้าจองผ่าน `/book` สำเร็จ → เห็นบน Front Desk + Calendar
- [x] Hold หมดอายุแล้ว slot ว่างอีกครั้ง
- [x] จอง direct ไม่ทำให้ Front Desk overbook (ใช้ inventory เดียวกับ 2.0)
- [x] `PUBLIC_BOOKING_ENABLED=false` แล้วปิด public routes ได้
- [x] `/book/confirmation/:code` เป็น `noindex` และไม่ cache ข้อมูลลูกค้า
