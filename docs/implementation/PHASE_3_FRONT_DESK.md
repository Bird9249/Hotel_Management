# Phase 3 — Front Desk Operations (Check-in / Check-out)

> เป้าหมาย: ทำ flow รับแขกเข้าพักและแจ้งออก พร้อมอัปเดตสถานะห้องอัตโนมัติ
> Dependencies: Phase 1 (`set-room-status`), Phase 2 (`reservations`)
> ต่อยอดในโมดูลเดิม: `src/modules/reservations` (เรียก service ของ `rooms`)

---

## 1. ขอบเขต

- **Check-in**: reservation `booked → checked_in`, ห้อง `available → occupied`
- **Check-out**: reservation `checked_in → checked_out`, ห้อง `occupied → cleaning`, แล้วส่งต่อขั้นออกบิล (Phase 4)
- Housekeeping เห็นคิวห้องที่ต้องทำความสะอาด แล้วเปลี่ยน `cleaning → available` (ใช้ `rooms:status` จาก Phase 1)

---

## 2. State Machine

```
Reservation:  booked ──checkin──▶ checked_in ──checkout──▶ checked_out
                 │
                 └──cancel──▶ cancelled

Room:         available ──(checkin)──▶ occupied ──(checkout)──▶ cleaning ──(housekeeping)──▶ available
                                                                    │
                                                       maintenance ◀┘ (manual)
```

> ข้อควรระวัง: การเปลี่ยนสถานะ reservation + room ต้องอยู่ใน **transaction เดียว**
> ใช้ middleware transaction ที่มีอยู่ (`src/server/platform/http/middleware/transaction.ts`) — `db` ใน context เป็น transaction อยู่แล้ว

---

## 3. Domain Layer (เพิ่มใน `reservations`)

### service/check-in.ts
```ts
export async function checkInService(client: DbTransaction, params: { reservationId: string }) {
  const res = await getReservationById(params.reservationId, client);
  if (!res) throw new Error("RESERVATION_NOT_FOUND");
  if (res.status !== "booked") throw new Error("INVALID_STATE");
  await updateReservationStatus(res.id, "checked_in", client);
  await setRoomStatus(res.roomId, "occupied", client);   // reuse service จาก Phase 1
  return { ...res, status: "checked_in" };
}
```

### service/check-out.ts
```ts
export async function checkOutService(client: DbTransaction, params: { reservationId: string }) {
  const res = await getReservationById(params.reservationId, client);
  if (!res) throw new Error("RESERVATION_NOT_FOUND");
  if (res.status !== "checked_in") throw new Error("INVALID_STATE");
  await updateReservationStatus(res.id, "checked_out", client);
  await setRoomStatus(res.roomId, "cleaning", client);
  // hook สำหรับ Phase 4: สร้าง draft invoice ที่นี่ หรือคืนข้อมูลให้ฝั่ง UI ไปสร้างต่อ
  return { ...res, status: "checked_out" };
}
```

> เพิ่ม repo `update-reservation-status.ts` ถ้ายังไม่มี (รับ status เป็น parameter)

### http (เพิ่มใน reservations.routes.ts)
| Method | Path | Permission |
|--------|------|-----------|
| POST | `/reservations/:id/check-in` | `reservations:checkin` |
| POST | `/reservations/:id/check-out` | `reservations:checkout` |

จัดการ error → status code:
- `RESERVATION_NOT_FOUND` → 404
- `INVALID_STATE` → 409

---

## 4. Presentation Layer

### api/queries.ts (เพิ่ม)
- `useCheckIn()` / `useCheckOut()` — mutation เรียก endpoint ใหม่, `onSuccess` invalidate `reservationsKeys.all` + `roomsKeys.all` (ให้สถานะห้องอัปเดต)

### UI
- **หน้า Front Desk** (`FrontDeskPage.tsx`) หรือเพิ่ม action ในหน้า Reservations:
  - ปุ่ม "Check-in" แสดงเมื่อ status = `booked`
  - ปุ่ม "Check-out" แสดงเมื่อ status = `checked_in`
  - ใช้ `confirm` (`src/components/confirm.tsx`) ก่อนยืนยัน
  - ใช้ `toast.promise` แสดงผลลัพธ์ (เลียนแบบใน `RolesPage.tsx`)
- **มุมมอง Today / Arrivals & Departures**: filter reservation ที่ `checkInDate = วันนี้` (รอ check-in) และ `checkOutDate = วันนี้` (รอ check-out)
- **Housekeeping view**: ตารางห้องสถานะ `cleaning` + ปุ่ม "ทำความสะอาดเสร็จ" → `setRoomStatus(available)` (ใช้ `useSetRoomStatus` จาก Phase 1)

---

## 5. Frontend Route + Sidebar

`router.tsx` — เพิ่ม (ถ้าทำหน้า Front Desk แยก):
```tsx
const frontDeskRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/front-desk",
  component: () => (
    <RequirePermissions all={["reservations:read"]} any={["reservations:checkin", "reservations:checkout"]}>
      <LazyPage><FrontDeskPage /></LazyPage>
    </RequirePermissions>
  ),
});
```

`sidebar-data.tsx` (กลุ่ม "ໂຮງແຮມ"):
```tsx
{ title: "ໜ້າຮັບແຂກ", url: "/app/front-desk", icon: ConciergeBell, requiredPermissions: ["reservations:read"] },
```
`route-meta.ts`: `"/app/front-desk": { label: "ໜ້າຮັບແຂກ" }`

---

## 6. Task Checklist

- [ ] repo `update-reservation-status.ts`
- [ ] service `check-in.ts` + `check-out.ts` (เรียก `setRoomStatus` ใน transaction เดียว)
- [ ] http endpoints check-in / check-out + error mapping (404/409)
- [ ] hooks `useCheckIn` / `useCheckOut` + invalidate ทั้ง reservations และ rooms
- [ ] UI ปุ่ม check-in/out ตามสถานะ + confirm dialog
- [ ] มุมมอง Arrivals/Departures วันนี้
- [ ] Housekeeping: คิวห้อง cleaning → available
- [ ] frontend route + sidebar + route-meta
- [ ] `bun run lint`

---

## 7. Acceptance Criteria

- กด Check-in แล้ว reservation = `checked_in` และห้อง = `occupied`
- กด Check-out แล้ว reservation = `checked_out` และห้อง = `cleaning`
- เปลี่ยนสถานะผิดลำดับ (เช่น check-out ห้องที่ยังไม่ check-in) ถูกปฏิเสธด้วย 409
- Housekeeping เปลี่ยนห้อง `cleaning → available` ได้
- การเปลี่ยนสถานะทั้งสองตารางเป็น atomic (rollback พร้อมกันหากเกิด error)
