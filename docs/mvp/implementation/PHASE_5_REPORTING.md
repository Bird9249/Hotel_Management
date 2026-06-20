# Phase 5 — Basic Reporting (โมดูล `reports`)

> เป้าหมาย: รายงานรายรับประจำวัน (Daily Sales) และอัตราการเข้าพัก (Occupancy Rate)
> Dependencies: Phase 4 (`payment` / `invoice`), Phase 1–3 (`room` / `reservation`), Phase 0 (`reports:read`)
> โมดูลใหม่: `src/modules/reports` (ไม่มีตาราง DB ใหม่ — เป็น read-only/aggregation)

---

## 1. ขอบเขต

- **Daily Sales Report**: รายรับรวมต่อวัน (จากตาราง `payment`) + แยกตามช่องทางชำระ
- **Occupancy Rate**: อัตราการเข้าพัก = ห้องที่มีแขก ÷ ห้องทั้งหมด ตามวัน/ช่วงเวลา
- หน้าสรุปการ์ดตัวเลข + กราฟ (ใช้ `recharts` ที่มีใน deps)

---

## 2. ไม่มี Schema ใหม่

เฟสนี้ query รวม (aggregate) จากตารางเดิม:
- `payment.paidAt`, `payment.amount`, `payment.method` → รายรับ
- `reservation.checkInDate / checkOutDate / status` + `room` → occupancy

> ไม่ต้อง `db:generate` / `db:migrate`

---

## 3. Domain Layer (`src/modules/reports/domain`)

### contracts/report.ts
```ts
export const DateRangeQuerySchema = z.object({
  from: z.string(),  // ISO date (YYYY-MM-DD)
  to: z.string(),
});
```

### repo (raw aggregation ด้วย Drizzle)

`daily-sales.ts`:
```sql
-- แนวคิด query
SELECT date_trunc('day', paid_at) AS day,
       SUM(amount) AS total,
       method
FROM payment
WHERE paid_at >= :from AND paid_at < :to
GROUP BY day, method
ORDER BY day;
```
คืน `{ day, totalsByMethod, grandTotal }[]`

`occupancy.ts`:
```
สำหรับแต่ละวัน d ในช่วง [from, to):
  occupiedRooms(d) = COUNT(DISTINCT room_id) FROM reservation
                     WHERE status IN ('checked_in','checked_out','booked')
                       AND check_in_date <= d AND check_out_date > d
  totalRooms = COUNT(*) FROM room WHERE status != 'maintenance'
  rate(d) = occupiedRooms(d) / totalRooms
```
คืน `{ day, occupiedRooms, totalRooms, rate }[]`

> ใช้ `sql` helper ของ drizzle-orm สำหรับ date_trunc / generate_series ตามต้องการ

### service
- `get-daily-sales.ts`, `get-occupancy.ts` — เรียก repo + จัดรูปข้อมูลให้พร้อม render
- (option) `get-summary.ts` — ตัวเลขสรุปวันนี้: รายรับวันนี้, occupancy วันนี้, จำนวน check-in/out วันนี้ (ใช้บน Dashboard)

### http/reports.routes.ts
| Method | Path | Permission |
|--------|------|-----------|
| GET | `/reports/daily-sales?from&to` | `reports:read` |
| GET | `/reports/occupancy?from&to` | `reports:read` |
| GET | `/reports/summary` | `reports:read` |

`api/index.ts` → `reportsRoutes` + ลงทะเบียนใน `rest/index.ts`

---

## 4. Presentation Layer

- `api/client.ts` + `queries.ts`: `useDailySalesQuery({from,to})`, `useOccupancyQuery({from,to})`, `useReportSummaryQuery()`
- ui:
  - `DateRangePicker.tsx` (react-day-picker) เลือกช่วงเวลา
  - `SalesChart.tsx` (recharts `BarChart` / `LineChart`) — รายรับรายวัน
  - `OccupancyChart.tsx` (recharts `LineChart` / `AreaChart`) — % การเข้าพัก
  - `StatCard.tsx` — การ์ดตัวเลขสรุป
- pages: `ReportsPage.tsx` (แท็บ Sales / Occupancy + ตัวเลือกช่วงเวลา)

### เสริม Dashboard
เพิ่มการ์ดสรุปใน `src/modules/dashboard/presentation/pages/DashboardPage.tsx`
(ดึง `/reports/summary`): รายรับวันนี้, occupancy วันนี้, arrivals/departures วันนี้

---

## 5. Frontend Route + Sidebar

`router.tsx`:
```tsx
const reportsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/reports",
  component: () => (
    <RequirePermissions all={["reports:read"]}>
      <LazyPage><ReportsPage /></LazyPage>
    </RequirePermissions>
  ),
});
```

`sidebar-data.tsx` (กลุ่ม "ໂຮງແຮມ" หรือกลุ่มใหม่ "ລາຍງານ"):
```tsx
{ title: "ລາຍງານ", url: "/app/reports", icon: ChartColumn, requiredPermissions: ["reports:read"] },
```
`route-meta.ts`: `"/app/reports": { label: "ລາຍງານ" }`

---

## 6. Task Checklist

- [ ] contracts `DateRangeQuerySchema`
- [ ] repo `daily-sales.ts` + `occupancy.ts` (aggregate query)
- [ ] service daily-sales / occupancy / summary
- [ ] http routes + permission `reports:read`
- [ ] `api/index.ts` + ลงทะเบียน
- [ ] presentation: DateRangePicker, charts (recharts), stat cards, ReportsPage
- [ ] เสริม summary cards ใน Dashboard
- [ ] frontend route + sidebar + route-meta
- [ ] `bun run lint`

---

## 7. Acceptance Criteria

- เลือกช่วงวันที่แล้วเห็นรายรับรวมต่อวัน + แยกตามช่องทางชำระ
- เห็นอัตราการเข้าพัก (%) ต่อวันในช่วงที่เลือก เป็นกราฟ
- ยอดรวมในรายงานตรงกับข้อมูล payment/reservation จริง
- เฉพาะ role ที่มี `reports:read` (Admin) เข้าถึงได้

---

## 8. ปิดงาน MVP

เมื่อจบ Phase 5 ให้ตรวจ Definition of Done ทั้งหมดใน [`../MODULE_ROADMAP.md`](../MODULE_ROADMAP.md):
flow ครบ สร้างห้อง → จอง → check-in → check-out → ออกบิล/รับชำระ → ดูรายงาน
และทดสอบสิทธิ์ครบ 3 roles (Admin / Receptionist / Housekeeping)
