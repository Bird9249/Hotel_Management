# Phase 2.2 — Housekeeping Mobile App

> เป้าหมาย: UI มือถือสำหรับแม่บ้าน — อัปเดตสถานะห้องแบบ touch-first
> Dependencies: Phase 2.1 (`housekeeping` shift + tasks API)
> โมดูล: ต่อยอด `src/modules/housekeeping/presentation/mobile/`
> อ้างอิง: [`../ROADMAP.md`](../ROADMAP.md)

---

## 1. ขอบเขต

| Feature | รายละเอียด |
|---------|------------|
| **Mobile UI** | Route `/m/housekeeping` — card ใหญ่, ปุ่มเต็มความกว้าง |
| **Shift integration** | เปิด/ปิดกะ + แสดงงาน pending/in_progress/done |
| **Real-time** | Reception เห็นห้อง `available` เร็วขึ้นหลัง HK ทำเสร็จ |
| **PWA** | manifest + install prompt (ไม่ทำ native app) |

**Deliverable:** แม่บ้านใช้มือถือทำงานได้ครบ · Reception เห็นสถานะห้องอัปเดตภายใน ≤ 15 วินาที

**นอกขอบเขต (Phase 2.2.1):**
- SSE `/api/housekeeping/events` (MVP ใช้ polling 10s ก่อน)
- Offline sync
- Native iOS/Android

---

## 2. แนวทางเทคนิค

| ทางเลือก | รายละเอียด |
|----------|------------|
| **PWA (แนะนำ)** | `/m/housekeeping` + `manifest.webmanifest` |
| **Deep link** | QR login สำหรับ tablet ติดผนังชั้น |

ใช้ API เดียวกับ Phase 2.1 — ไม่สร้าง backend ใหม่

---

## 3. UX หลัก

```
/m/housekeeping
├── Shift bar: [ເປີດກະ] / ກຳລັງເຮັດວຽກ · ห้องเหลือ N
├── Tab: ລໍຖ້າ (pending) | ກຳລັງທຳ (in_progress) | ເສັດແລ້ວ (done)
└── Card ต่อห้อง:
    - เลขห้อง + ชั้น + ประเภท
    - [ເລີ່ມທຳຄວາມສະອາດ] → [ພ້ອມໃຊ້]
    - touch target ≥ 44px, ไม่พึ่ง hover
```

---

## 4. Routing

```
/m/housekeeping     — หน้าหลัก mobile (RequirePermissions housekeeping:task)
```

- Route group `/m/*` — ไม่แสดง sidebar desktop
- Layout `MobileShell` — bottom nav, font ใหญ่
- Link จาก desktop HK page → "ເປີດໃນໂທລະສັບ"

ลงทะเบียนใน `src/app/router.tsx` แยกจาก `/app` layout

---

## 5. Presentation Layer

```
src/modules/housekeeping/presentation/mobile/
├── MobileShell.tsx
├── pages/HkMobilePage.tsx
├── ui/HkTaskCard.tsx
├── ui/HkShiftBarMobile.tsx
└── ui/HkTaskTabs.tsx
```

Reuse hooks จาก `housekeeping/api/queries.ts`

---

## 6. Real-time

**MVP (Phase 2.2):**
- TanStack Query `refetchInterval: 10_000` บน task list

**ถัดไป (2.2.1):**
- SSE push เมื่อ room status เปลี่ยน
- Badge บน Front Desk เมื่อห้องพร้อม check-in

---

## 7. PWA

- [ ] `public/manifest.webmanifest` — name, icons, theme
- [ ] Meta viewport + apple-touch-icon
- [ ] ทดสอบ Chrome Android + Safari iOS
- [ ] Offline banner (read-only) — ไม่ sync offline

---

## 8. Tasks

- [ ] สร้าง `MobileShell` + route group `/m/*`
- [ ] `HkMobilePage` + task cards + tabs
- [ ] Integrate shift bar (open/close)
- [ ] Refetch polling 10s
- [ ] PWA manifest + icons
- [ ] Link จาก desktop → mobile
- [ ] QA กับ `housekeeping@hotel.com` บนมือถือจริง

---

## 9. Definition of Done (Phase 2.2)

- [ ] แม่บ้านเปิดกะ + ทำห้องบนมือถือได้ครบ flow
- [ ] Reception เห็นห้อง `available` ภายใน ≤ 15 วินาที (polling)
- [ ] RBAC: เฉพาะ Housekeeping + Admin เข้า `/m/housekeeping` ได้
- [ ] PWA install ได้บน Android/iOS
