# Phase 2 — Guest & Reservation (โมดูล `guests` + `reservations`)

> เป้าหมาย: เก็บข้อมูลลูกค้า, สร้างการจอง, และแสดง Booking Calendar
> Dependencies: Phase 1 (มีตาราง `room` / `room_type`), Phase 0 (permission `guests:*`, `reservations:*`)
> โมดูลใหม่: `src/modules/guests`, `src/modules/reservations`

---

## 1. ขอบเขต

- **Guest Profile**: ชื่อ, เบอร์โทร, เลขพาสปอร์ต/บัตรประชาชน, สัญชาติ
- **Reservation**: ผูก guest + room, วันที่เข้า/ออก, จำนวนผู้เข้าพัก, สถานะ
- **Booking Calendar**: ปฏิทินแสดงห้องว่าง/เต็มตามช่วงวันที่
- **ป้องกันการจองซ้อน** (overlap) ของห้องเดียวกัน

---

## 2. Database Schema

สร้าง `src/server/platform/db/schema/hotel-guests.ts`:

```ts
import { pgTable, text } from "drizzle-orm/pg-core";

export const guest = pgTable("guest", {
  id: text("id").primaryKey(),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  idDocument: text("id_document"),   // passport / national id
  nationality: text("nationality"),
});
```

สร้าง `src/server/platform/db/schema/reservations.ts`:

```ts
import { date, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { guest } from "./hotel-guests";
import { room } from "./rooms";

export const reservation = pgTable("reservation", {
  id: text("id").primaryKey(),
  guestId: text("guest_id").notNull().references(() => guest.id, { onDelete: "restrict" }),
  roomId: text("room_id").notNull().references(() => room.id, { onDelete: "restrict" }),
  checkInDate: date("check_in_date").notNull(),
  checkOutDate: date("check_out_date").notNull(),
  guestsCount: integer("guests_count").notNull().default(1),
  // booked | checked_in | checked_out | cancelled
  status: text("status").notNull().default("booked"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
```

เพิ่มใน `src/server/platform/db/schema/index.ts`:

```ts
export * from "./hotel-guests";
export * from "./reservations";
```

แล้ว `bun run db:generate` + `bun run db:migrate`

---

## 3. โมดูล `guests`

ทำตามโครงสร้าง CRUD เดียวกับ `roles` (contracts → repo → service → http → presentation)

### contracts
```ts
export const GuestCreateSchema = z.object({
  fullName: z.string().min(1),
  phone: z.string().optional(),
  idDocument: z.string().optional(),
  nationality: z.string().optional(),
});
export const GuestUpdateSchema = GuestCreateSchema.partial();
```

### http/guests.routes.ts
| Method | Path | Permission |
|--------|------|-----------|
| GET | `/guests` | `guests:read` |
| GET | `/guests/lookup` | `guests:read` (สำหรับ combobox ตอนจอง) |
| GET | `/guests/:id` | `guests:read` |
| POST | `/guests` | `guests:create` |
| PATCH | `/guests/:id` | `guests:update` |
| DELETE | `/guests/:id` | `guests:delete` |

> เพิ่ม endpoint `/guests/lookup` แบบเดียวกับ `roles/lookup` เพื่อใช้กับ `FormInfiniteCombobox` (`src/components/form/FormInfiniteCombobox.tsx`) ตอนเลือกลูกค้าในฟอร์มจอง

### presentation
- `GuestsPage`, `GuestCreatePage`, `GuestEditPage`, `GuestsTable`, `GuestForm`
- `guestsApi` + hooks เลียนแบบ roles

---

## 4. โมดูล `reservations`

### 4.1 contracts/reservation.ts
```ts
export const ReservationStatusSchema = z.enum(["booked", "checked_in", "checked_out", "cancelled"]);
export const ReservationCreateSchema = z.object({
  guestId: z.string().min(1),
  roomId: z.string().min(1),
  checkInDate: z.string(),   // ISO date
  checkOutDate: z.string(),
  guestsCount: z.number().int().min(1).default(1),
}).refine((v) => v.checkOutDate > v.checkInDate, { message: "checkOutDate ต้องมากกว่า checkInDate", path: ["checkOutDate"] });
export const ReservationUpdateSchema = z.object({ /* partial fields ที่อนุญาตให้แก้ */ });
export const AvailabilityQuerySchema = z.object({ from: z.string(), to: z.string() });
```

### 4.2 repo/
- `list-reservations.ts` (join guest + room เพื่อแสดงชื่อ)
- `get-reservation-by-id.ts`, `create-reservation.ts`, `update-reservation.ts`, `cancel-reservation.ts`
- `find-overlapping.ts` — เช็คว่า `roomId` มี reservation อื่นที่ทับช่วง `[from, to)` และ status ∈ (`booked`, `checked_in`) หรือไม่
- `list-room-availability.ts` — คืนสถานะว่าง/เต็มของห้องตามช่วงวันที่ (ใช้กับ calendar)

> เงื่อนไข overlap: `existing.checkInDate < newCheckOut AND existing.checkOutDate > newCheckIn`

### 4.3 service/
- `create-reservation.ts` — เรียก `find-overlapping` ก่อน ถ้าทับให้ throw `"ROOM_NOT_AVAILABLE"`
- `update-reservation.ts`, `cancel-reservation.ts` (set status = `cancelled`)
- `get-availability.ts` — รวมข้อมูลห้อง + การจองในช่วงเวลา

### 4.4 http/reservations.routes.ts
| Method | Path | Permission |
|--------|------|-----------|
| GET | `/reservations` | `reservations:read` |
| GET | `/reservations/:id` | `reservations:read` |
| GET | `/availability` | `reservations:read` |
| POST | `/reservations` | `reservations:create` |
| PATCH | `/reservations/:id` | `reservations:update` |
| POST | `/reservations/:id/cancel` | `reservations:cancel` |

> หมายเหตุ: check-in / check-out จะเพิ่มใน **Phase 3** (เลี่ยงทำในเฟสนี้)
> ตอน POST สร้างการจองถ้าทับช่วง ให้ route ตอบ `409 { error: "ROOM_NOT_AVAILABLE" }`

### 4.5 api/index.ts + ลงทะเบียน
เพิ่ม `guestsRoutes`, `reservationsRoutes` ใน `src/server/api/rest/index.ts`

---

## 5. Booking Calendar (Presentation)

- ใช้ `react-day-picker` (มีใน deps) หรือ render grid ของวันที่ × ห้อง
- `BookingCalendar.tsx`: เลือกช่วงวันที่ → เรียก `useAvailabilityQuery({from, to})` → ระบายสีห้องว่าง/เต็ม
- คลิกช่องว่าง → เปิด `ReservationForm` (prefill room + วันที่)
- `ReservationForm.tsx`: เลือกลูกค้าด้วย `FormInfiniteCombobox` (เรียก `/guests/lookup`), เลือกห้อง, วันที่ (DateRange), จำนวนคน
- หน้า `ReservationsPage.tsx`: สลับมุมมอง Calendar / Table

---

## 6. Frontend Routes + Sidebar

`src/app/router.tsx` — เพิ่ม:
- `/guests`, `/guests/create`, `/guests/$id/edit` → `RequirePermissions all={["guests:read"]}`
- `/reservations`, `/reservations/create`, `/reservations/$id/edit` → `RequirePermissions all={["reservations:read"]}`
- `/calendar` (Booking Calendar) → `RequirePermissions all={["reservations:read"]}`

`sidebar-data.tsx` (กลุ่ม "ໂຮງແຮມ") — เพิ่ม:
```tsx
{ title: "ການຈອງ", url: "/app/reservations", icon: CalendarCheck, requiredPermissions: ["reservations:read"] },
{ title: "ປະຕິທິນ", url: "/app/calendar", icon: CalendarDays, requiredPermissions: ["reservations:read"] },
{ title: "ລູກຄ້າ", url: "/app/guests", icon: UserRound, requiredPermissions: ["guests:read"] },
```

`route-meta.ts` — เพิ่ม label ภาษาลาวของทุก path ข้างต้น

---

## 7. Task Checklist

- [ ] DB: `hotel-guests.ts` + `reservations.ts` + re-export + migrate
- [ ] โมดูล `guests` ครบ (contracts/repo/service/http/presentation) + `/guests/lookup`
- [ ] โมดูล `reservations` contracts/repo/service/http
- [ ] logic ป้องกันจองซ้อน (`find-overlapping`) + ตอบ 409
- [ ] availability endpoint + `BookingCalendar`
- [ ] `ReservationForm` ใช้ combobox เลือกลูกค้า
- [ ] frontend routes + sidebar + route-meta
- [ ] `bun run lint`

---

## 8. Acceptance Criteria

- สร้าง/แก้ไข Guest Profile ได้
- สร้างการจองได้ และระบบ "ปฏิเสธ" การจองห้องเดียวกันที่ช่วงเวลาทับกัน
- Booking Calendar แสดงห้องว่าง/เต็มตามช่วงวันที่ที่เลือก
- ยกเลิกการจองได้ (status → `cancelled`)
- Receptionist และ Admin จัดการได้; Housekeeping เข้าไม่ได้
