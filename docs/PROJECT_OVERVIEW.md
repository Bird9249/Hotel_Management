# Project Overview — ระบบจัดการโรงแรม (Hotel Management System)

> เอกสารภาพรวมโปรเจกต์ สำหรับ MVP (Minimum Viable Product)
> เป้าหมาย: ให้โรงแรมสามารถดำเนินงานหลักได้ครบวงจรโดยไม่ติดขัด

---

## 1. วัตถุประสงค์ (Objective)

สร้างระบบจัดการโรงแรมที่เน้นเฉพาะฟังก์ชันที่ "จำเป็นที่สุด" เพื่อให้พนักงานต้อนรับ
แม่บ้าน และเจ้าของกิจการ ใช้งานในงานประจำวันได้จริง ตั้งแต่การจองห้อง เช็คอิน/เช็คเอาท์
จัดการสถานะห้อง ออกบิล/รับชำระเงิน ไปจนถึงดูรายงานสรุปประจำวัน

ขอบเขตของ MVP ตั้งใจให้ "เล็กแต่ใช้งานได้ครบลูป" (end-to-end) ก่อนต่อยอดฟีเจอร์ขั้นสูง

---

## 2. กลุ่มผู้ใช้งานและสิทธิ์ (User Roles)

| Role | ภาษาไทย | ขอบเขตงานหลัก |
|------|---------|----------------|
| **Admin** | เจ้าของ/ผู้ดูแลระบบ | เข้าถึงได้ทุกส่วน ตั้งค่าระบบ จัดการผู้ใช้/สิทธิ์ ดูรายงานทั้งหมด |
| **Receptionist** | พนักงานต้อนรับ | จัดการการจอง เช็คอิน/เช็คเอาท์ ออกบิล รับชำระเงิน ดูปฏิทินห้อง |
| **Housekeeping** | แม่บ้าน | อัปเดตสถานะห้อง (ทำความสะอาด / พร้อมใช้งาน) |

> ระบบใช้ **Role-based Access Control (RBAC)** ที่มีอยู่แล้วในโปรเจกต์ (โมดูล `roles`)
> เป็นฐานในการกำหนดสิทธิ์การเข้าถึงแต่ละหน้า/แต่ละ action

---

## 3. ขอบเขตฟีเจอร์ MVP (Feature Scope)

### 3.1 ระบบจัดการการจอง (Reservation Management) — หัวใจหลัก
- **Check-in / Check-out** — หน้าจอรับแขกเข้าพักและแจ้งออกที่ใช้งานง่าย
- **Booking Calendar** — ปฏิทินแสดงสถานะการจอง เห็นภาพรวมว่าห้องไหนว่าง/เต็ม
- **Guest Profile** — เก็บข้อมูลพื้นฐานลูกค้า (ชื่อ, เบอร์โทร, เลขพาสปอร์ต/บัตรประชาชน)

### 3.2 ระบบจัดการห้องพัก (Room Management)
- **Room Status** — สถานะห้องแบบ Real-time (ว่าง / มีแขกพัก / กำลังทำความสะอาด / ปิดปรับปรุง)
- **Room Types** — กำหนดประเภทห้องและราคา (Standard, Deluxe, Suite ฯลฯ)

### 3.3 ระบบชำระเงินและใบบิล (Billing & Invoicing)
- **Invoicing** — ออกใบบิลค่าห้องพักและค่าบริการอื่นๆ
- **Payment Tracking** — บันทึกการชำระเงิน (เงินสด, โอนผ่าน App ธนาคาร, บัตรเครดิต)
- **Tax Calculation** — คำนวณภาษีอากรพื้นฐานตามระเบียบ

### 3.4 ระบบรายงานพื้นฐาน (Basic Reporting)
- **Daily Sales Report** — รายงานรายรับประจำวัน
- **Occupancy Rate** — อัตราการเข้าพัก เพื่อวัดประสิทธิภาพ

### 3.5 ระบบผู้ใช้และสิทธิ์ (User Roles & Permissions)
- **Role-based Access** — แบ่งสิทธิ์ระหว่าง Admin / Receptionist / Housekeeping

---

## 4. สถาปัตยกรรมและเทคโนโลยี (Tech Stack)

โปรเจกต์ใช้สถาปัตยกรรมแบบ **Modular / Layered** (แยก `domain` ↔ `presentation` ↔ `api`)
ซึ่งสอดคล้องกับโครงสร้างที่มีอยู่เดิมในโฟลเดอร์ `src/modules/`

| ชั้น (Layer) | เทคโนโลยี |
|---------------|-----------|
| **Runtime** | [Bun](https://bun.sh) |
| **Frontend** | React 19, TanStack Router, TanStack Query, TanStack Table/Virtual |
| **UI** | shadcn/ui (`@devhop/ui`), Radix UI, Tailwind CSS v4, lucide-react |
| **Forms** | react-hook-form + Zod |
| **Backend / API** | ElysiaJS |
| **Database** | PostgreSQL ผ่าน Drizzle ORM (+ drizzle-kit migrations) |
| **Auth** | Better Auth |
| **Charts** | Recharts (ใช้ในรายงาน) |
| **Storage** | AWS S3 (อัปโหลดไฟล์/เอกสาร) |

### โครงสร้างของแต่ละโมดูล (Module Convention)
```
src/modules/<module>/
├── api/                 # การเชื่อมต่อ/ลงทะเบียน API ของโมดูล
├── domain/
│   ├── contracts/       # type / schema (Zod) สัญญาข้อมูล
│   ├── service/         # business logic
│   ├── repo/            # data access (Drizzle)
│   └── http/            # route handlers (Elysia)
└── presentation/
    ├── api/             # client-side data hooks (TanStack Query)
    ├── pages/           # หน้าจอ (route pages)
    ├── ui/              # components ของโมดูล
    └── tour/            # onboarding tour (react-joyride)
```

---

## 5. โมดูลที่มีอยู่แล้ว (Existing Foundation)

ฐานระบบส่วนกลางพร้อมใช้งานแล้ว ทำให้โฟกัสไปที่ business modules ของโรงแรมได้ทันที:

| โมดูล | สถานะ | หน้าที่ |
|-------|-------|--------|
| `auth` | ✅ พร้อม | เข้าสู่ระบบ / จัดการ session (Better Auth) |
| `users` | ✅ พร้อม | จัดการผู้ใช้งาน |
| `roles` | ✅ พร้อม | RBAC — บทบาทและสิทธิ์ |
| `settings` | ✅ พร้อม | ตั้งค่าระบบ |
| `audit` | ✅ พร้อม | บันทึก audit log |
| `upload` | ✅ พร้อม | อัปโหลดไฟล์ (S3) |
| `dashboard` | ✅ พร้อม | หน้าแดชบอร์ดกลาง |

> โมดูลใหม่ที่ต้องสร้างสำหรับ MVP โรงแรม: `rooms`, `reservations`, `guests`, `billing`, `reports`
> รายละเอียดดูใน [`mvp/MODULE_ROADMAP.md`](./mvp/MODULE_ROADMAP.md)

---

## 6. นิยามความสำเร็จของ MVP (Definition of Done)

MVP ถือว่าสำเร็จเมื่อสามารถทำ flow นี้ได้ครบจาก UI จริง:

1. สร้าง Room Type และ Room ได้
2. สร้าง Guest Profile + ทำการจอง (Reservation) ได้
3. เห็นการจองบน Booking Calendar และสถานะห้องอัปเดตถูกต้อง
4. ทำ Check-in → Check-out ได้
5. ออก Invoice + บันทึก Payment + คำนวณภาษีได้
6. ดู Daily Sales Report และ Occupancy Rate ได้
7. สิทธิ์การเข้าถึงทำงานถูกต้องตาม Role (Admin / Receptionist / Housekeeping)

---

## 7. นอกขอบเขต MVP (Out of Scope)

เพื่อรักษาขนาดของ MVP รายการต่อไปนี้ "ยังไม่ทำ" ในเฟสแรก — **มีแผน Post-MVP แล้ว** สำหรับรายการที่ทำต่อใน Phase 2:

| ฟีเจอร์ | สถานะ MVP | แผนถัดไป |
|---------|-----------|-----------|
| Online Booking / Channel Manager (Agoda, Booking.com, Expedia) | นอก MVP | [`phase-2/ROADMAP.md`](./phase-2/ROADMAP.md) · [`phase-2/implementation/PHASE_2_4_CHANNEL_MANAGER.md`](./phase-2/implementation/PHASE_2_4_CHANNEL_MANAGER.md) |
| Direct Booking (เว็บ/โซเชียลโรงแรม) | นอก MVP | [`phase-2/implementation/PHASE_2_3_BOOKING_ENGINE.md`](./phase-2/implementation/PHASE_2_3_BOOKING_ENGINE.md) |
| Housekeeping Mobile + กะแม่บ้าน | นอก MVP | [`phase-2/implementation/PHASE_2_1_HK_SHIFT.md`](./phase-2/implementation/PHASE_2_1_HK_SHIFT.md) · [`phase-2/implementation/PHASE_2_2_HK_MOBILE.md`](./phase-2/implementation/PHASE_2_2_HK_MOBILE.md) |

**ยังไม่มีแผน (Post-MVP Phase 3+):**

- Payment Gateway online แบบเชื่อม API ธนาคารโดยตรง
- ระบบสมาชิก/สะสมแต้ม (Loyalty)
- POS ร้านอาหาร / Mini-bar แบบละเอียด
- รายงานเชิงวิเคราะห์ขั้นสูง / forecast
- Multi-property (หลายสาขาในระบบเดียว)
