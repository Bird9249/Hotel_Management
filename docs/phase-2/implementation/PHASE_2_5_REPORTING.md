# Phase 2.5 — Reporting Extensions (ຂະຫຍາຍລາຍງານ)

> เป้าหมาย: ขยายโมดูล `reports` ให้สะท้อนข้อมูลจาก Phase 2 — ช่องทางจอง (Direct / OTA) และผลงานแม่บ้าน (HK Shift)
> Dependencies: MVP Phase 5 (`reports`), Phase 2.0 (`reservation.source` + `sales_channel`), Phase 2.1 (`hk_shift` / `hk_room_task`), Phase 2.3 + 2.4 (ข้อมูลจองจาก Direct Web / OTA)
> โมดูล: ต่อยอด `src/modules/reports` (ไม่มีตาราง DB ใหม่ — read-only aggregation)
> อ้างอิง: [`../ROADMAP.md`](../ROADMAP.md) · MVP [`../../mvp/implementation/PHASE_5_REPORTING.md`](../../mvp/implementation/PHASE_5_REPORTING.md)

> **ทำหลัง Phase 2.0 + 2.1 อย่างน้อย** — รายงานช่องทางจองได้ประโยชน์มากขึ้นเมื่อมีข้อมูลจาก 2.3/2.4 แล้ว แต่ implement ได้ทันทีหลัง 2.0

---

## 1. ขอบเขต

| Feature | รายละเอียด |
|---------|------------|
| **Bookings by Source** | จำนวนการจองต่อวัน แยกตาม `reservation.source` / channel |
| **Revenue by Source** | รายรับต่อวัน แยกตามช่องทางจอง (join `payment` → `invoice` → `reservation`) |
| **HK Productivity** | ห้องที่ทำเสร็จ / ค้าง / เวลาเฉลี่ยต่อห้อง ตามกะและวัน |
| **Dashboard Summary** | ขยาย `/reports/summary` — จองวันนี้แยก source + HK ห้องเสร็จวันนี้ |
| **Export CSV** | ทุกแท็บใหม่ใช้ date range + export เหมือนรายงานเดิม |

**Deliverable:** Admin/Reception ดูสัดส่วน Direct vs OTA และผลงาน HK ใน `/app/reports` ได้

**นอกขอบเขต (Phase 2.5.1+):**
- Occupancy filter ตาม room type
- Channel sync health summary (success/fail rate) — คงอยู่ที่ `/app/channels/:id/logs`
- Forecast / RevPAR / ADR
- รายงาน PDF / scheduled email

**ย้ายจาก Phase 2.1.1:**
- รายงาน HK ใน reports (เดิมระบุเป็น out-of-scope ใน [`PHASE_2_1_HK_SHIFT.md`](./PHASE_2_1_HK_SHIFT.md)) → รวมในเฟสนี้

---

## 2. ไม่มี Schema ใหม่

เฟสนี้ aggregate จากตารางที่มีแล้ว:

| ตาราง | ใช้สำหรับ |
|-------|-----------|
| `reservation` | `source`, `channelId`, `createdAt`, `checkInDate`, `status` |
| `sales_channel` | label ชื่อ channel (join กับ `channelId`) |
| `payment` → `invoice` → `reservation` | revenue by source |
| `hk_shift`, `hk_room_task` | HK productivity |
| `user` | ชื่อแม่บ้านที่ทำห้องเสร็จ |

> ไม่ต้อง `db:generate` / `db:migrate`

---

## 3. กฎธุรกิจ / นิยามตัวเลข

### 3.1 ช่องทางจอง (Source dimension)

ใช้ key เดียวกับ UI ที่มีแล้วใน `reservation-sources.ts`:

```
sourceKey =
  reservation.channelId ?? reservation.source   // front_desk | direct_web | agoda | ...

label =
  sales_channel.name (ถ้ามี channelId)
  หรือ RESERVATION_SOURCE_LABELS[source]
```

**Bookings by source** — นับจาก `reservation.createdAt` ในช่วง `[from, to)`:
- รวม status: `booked`, `checked_in`, `checked_out`
- **ไม่**นับ `cancelled`

**Revenue by source** — รวมจาก `payment.paidAt` ในช่วง `[from, to)`:
- join ไป `reservation.source` / `channelId` ผ่าน invoice
- payment ที่ไม่มี reservation (ถ้ามีในอนาคต) → bucket `other`

### 3.2 HK Productivity

**ต่อกะ (shift row):**
- `roomsCompleted`, `roomsPending` — จาก snapshot ตอนปิดกะ (`hk_shift`)
- `avgMinutesPerRoom` — เฉลี่ย `completedAt - startedAt` ของ tasks ที่ `status = done` ในกะนั้น

**สรุปต่อวัน (daily rollup):**
- `roomsCompleted` = SUM จากกะที่ `closedAt` อยู่ในวันนั้น
- `shiftsClosed` = จำนวนกะที่ปิดในวันนั้น
- `avgMinutesPerRoom` — weighted average จาก tasks ที่เสร็จในวันนั้น

**Filter ช่วงเวลา:** ใช้ `hk_shift.closedAt` สำหรับกะที่ปิดแล้ว · กะ `open` ไม่เข้ารายงาน daily rollup (แสดงใน real-time ที่ `/app/hk-shifts` แทน)

---

## 4. Domain Layer — ต่อยอด `reports`

```
src/modules/reports/
├── domain/
│   ├── contracts/
│   │   └── report.ts              # DateRangeQuerySchema (เดิม)
│   ├── repo/
│   │   ├── bookings-by-source.ts  # ใหม่
│   │   ├── revenue-by-source.ts   # ใหม่
│   │   ├── hk-productivity.ts     # ใหม่
│   │   └── summary.ts             # ขยาย queryTodayBookingsBySource, queryTodayHkCompleted
│   ├── service/
│   │   ├── get-bookings-by-source.ts
│   │   ├── get-revenue-by-source.ts
│   │   ├── get-hk-productivity.ts
│   │   └── get-summary.ts         # ขยาย response
│   └── http/reports.routes.ts     # เพิ่ม 3 endpoints
└── presentation/
    ├── pages/ReportsPage.tsx       # แท็บใหม่ 2–3 แท็บ
    ├── ui/
    │   ├── BookingsBySourceChart.tsx
    │   ├── RevenueBySourceChart.tsx
    │   └── HkProductivityTable.tsx
    └── lib/export-csv.ts           # export 3 รายงานใหม่
```

### 4.1 Response shapes (แนวคิด)

```ts
// bookings-by-source
type BookingsBySourceRow = {
  day: string;                    // YYYY-MM-DD
  totalsBySource: Record<string, number>;  // sourceKey → count
  grandTotal: number;
};

// revenue-by-source
type RevenueBySourceRow = {
  day: string;
  totalsBySource: Record<string, number>;  // sourceKey → amount
  grandTotal: number;
};

// hk-productivity (mode: "daily" | "shift")
type HkProductivityDailyRow = {
  day: string;
  shiftsClosed: number;
  roomsCompleted: number;
  roomsPending: number;
  avgMinutesPerRoom: number | null;
};

type HkProductivityShiftRow = {
  shiftId: string;
  openedAt: string;
  closedAt: string | null;
  openedByName: string;
  roomsCompleted: number;
  roomsPending: number;
  avgMinutesPerRoom: number | null;
};
```

### 4.2 Query ตัวอย่าง — revenue by source

```sql
-- แนวคิด
SELECT date_trunc('day', p.paid_at)::date AS day,
       coalesce(r.channel_id, r.source) AS source_key,
       sum(p.amount) AS total
FROM payment p
JOIN invoice i ON i.id = p.invoice_id
JOIN reservation r ON r.id = i.reservation_id
WHERE p.paid_at >= :from AND p.paid_at < :to
GROUP BY day, source_key
ORDER BY day;
```

### 4.3 Query ตัวอย่าง — bookings by source

```sql
SELECT date_trunc('day', r.created_at)::date AS day,
       coalesce(r.channel_id, r.source) AS source_key,
       count(*) AS total
FROM reservation r
WHERE r.created_at >= :from AND r.created_at < :to
  AND r.status <> 'cancelled'
GROUP BY day, source_key
ORDER BY day;
```

---

## 5. API Endpoints

| Method | Path | Permission | คำอธิบาย |
|--------|------|------------|----------|
| GET | `/reports/bookings-by-source?from&to` | `reports:read` | จำนวนจองต่อวันแยก source |
| GET | `/reports/revenue-by-source?from&to` | `reports:read` | รายรับต่อวันแยก source |
| GET | `/reports/hk-productivity?from&to&mode=daily\|shift` | `reports:read` | ผลงาน HK ต่อวันหรือต่อกะ |
| GET | `/reports/summary` | `reports:read` | **ขยาย** — เพิ่ม `bookingsBySource`, `hkRoomsCompletedToday` |

ลงทะเบียนใน `reports.routes.ts` + `api/index.ts` (pattern เดิม)

---

## 6. Permission (RBAC)

ใช้ permission เดิม — **ไม่เพิ่ม key ใหม่**

| Role | `reports:read` |
|------|:--------------:|
| Admin | ✓ |
| Receptionist | ✓ |
| Housekeeping | — |

---

## 7. Presentation Layer

### 7.1 หน้า `/app/reports` — แท็บใหม่

| แท็บ (label ລາວ) | เนื้อหา |
|------------------|---------|
| **ຊ່ອງທາງຈອງ** | Stacked bar — จำนวนจองต่อวันแยก source + StatCard สัดส่วน Direct vs OTA |
| **ລາຍຮັບຕາມຊ່ອງທາງ** | Stacked bar — รายรับต่อวันแยก source |
| **ຜົນງານແມ່ບ້ານ** | ตาราง daily (default) + toggle ดูรายกะ · StatCard ห้องเสร็จรวม |

- ใช้ `DateRangePicker` + `ExportCsvButton` เดิม
- Label source ใช้ `getReservationSourceLabel()` + ดึง channels list (cache จาก query เดิมหรือ embed ใน API response)
- สีกราฟ: map source คงที่ (front_desk, direct_web, agoda, …) เพื่อไม่สลับสีทุก refresh

### 7.2 อัปเดต subtitle หน้ารายงาน

```
เดิม: ລາຍຮັບ, ການເຂົ້າພັກ ແລະ ກະເງິນສົດ
ใหม่: ລາຍຮັບ, ການເຂົ້າພັກ, ຊ່ອງທາງຈອງ ແລະ ຜົນງານແມ່ບ້ານ
```

### 7.3 Dashboard (`/app/dashboard`)

ขยายการ์ดจาก `/reports/summary`:
- จองวันนี้แยก source (mini breakdown หรือ badge row)
- ห้อง HK เสร็จวันนี้ (`hkRoomsCompletedToday`)

---

## 8. Export CSV

| รายงาน | คอลัมน์หลัก |
|--------|-------------|
| `bookings-by-source` | day, source, count |
| `revenue-by-source` | day, source, amount |
| `hk-productivity-daily` | day, shiftsClosed, roomsCompleted, roomsPending, avgMinutesPerRoom |
| `hk-productivity-shift` | shiftId, openedAt, closedAt, openedBy, roomsCompleted, roomsPending, avgMinutesPerRoom |

ชื่อไฟล์: `{key}_{from}_{to}.csv` (pattern เดิมใน `export-csv.ts`)

---

## 9. Migration จาก MVP Reports

| MVP / Phase 2.1 ปัจจุบัน | Phase 2.5 |
|--------------------------|-----------|
| 5 แท็บ: sales, occupancy, cash shift | +3 แท็บ: source bookings, source revenue, HK |
| `/reports/summary` — revenue, occupancy, arrivals, departures | +bookingsBySource, hkRoomsCompletedToday |
| `/app/hk-shifts` — ประวัติกะรายรายการ | HK report = สรุป aggregate ข้ามกะ/วัน |
| Badge source บน Front Desk / Calendar | รายงาน aggregate จาก field เดียวกัน |

**รายงานเดิมไม่ breaking change** — เพิ่มแท็บและขยาย summary เท่านั้น

---

## 10. Tasks

### Backend
- [ ] Repo `bookings-by-source.ts` + service
- [ ] Repo `revenue-by-source.ts` + service
- [ ] Repo `hk-productivity.ts` (daily + shift mode) + service
- [ ] ขยาย `summary.ts` + `get-summary.ts`
- [ ] Routes 3 endpoints + types ใน `domain/types.ts`
- [ ] Unit test aggregation edge cases (cancelled reservation, open shift, payment without channel)

### Frontend
- [ ] API client + query keys ใน `queries.ts`
- [ ] `BookingsBySourceChart`, `RevenueBySourceChart`, `HkProductivityTable`
- [ ] แท็บใหม่ใน `ReportsPage.tsx` + subtitle
- [ ] Export CSV 3 รายงาน
- [ ] ขยาย Dashboard summary cards

### Docs / QA
- [ ] อัปเดต [`../ROADMAP.md`](../ROADMAP.md) — เพิ่ม Sub-phase 2.5 + DoD
- [ ] อัปเดต [`README.md`](./README.md) index
- [ ] ลบ/อัปเดตข้อความ "นอกขอบเขต 2.1.1" ใน `PHASE_2_1_HK_SHIFT.md` → ชี้มา 2.5
- [ ] Seed demo: จอง mixed source + HK shifts ข้ามหลายวัน → ตรวจตัวเลขมือ

---

## 11. Definition of Done (Phase 2.5)

- [ ] จองผ่าน Front Desk + Direct Web + OTA (mock) → แท็บ **ຊ່ອງທາງຈອງ** แสดงจำนวนถูกต้อง
- [ ] รับชำระจากจองหลาย source → แท็บ **ລາຍຮັບຕາມຊ່ອງທາງ** ตรงกับ payment จริง
- [ ] ปิด HK shift 2 กะในวันเดียว → รายงาน HK รวม `roomsCompleted` ถูกต้อง
- [ ] Export CSV ทุกแท็บใหม่ใช้ filter วันที่เดียวกับหน้าจอ
- [ ] Dashboard แสดง breakdown source วันนี้
- [ ] Housekeeping ไม่มี `reports:read` → เข้า `/app/reports` ไม่ได้
- [ ] `bun run lint` ผ่าน

---

## 12. Acceptance / Demo Scenario

```
1. seed: 3 จอง front_desk, 2 direct_web, 1 agoda (webhook) ในช่วง 7 วัน
2. check-out + รับชำระครบ
3. เปิด-ปิด HK shift → ทำห้อง 5 ห้อง
4. /app/reports:
   - ຊ່ອງທາງຈອງ: stacked bar แสดง 3 source
   - ລາຍຮັບຕາມຊ່ອງທາງ: ยอดรวม = Daily Sales ในเดือนเดียวกัน (ต่าง dimension)
   - ຜົນງານແມ່ບ້ານ: roomsCompleted = 5
5. Export CSV → เปิดใน spreadsheet ตรวจ column
```

---

## 13. เอกสารที่เกี่ยวข้อง

| เอกสาร | เนื้อหา |
|--------|---------|
| [`PHASE_2_0_FOUNDATION.md`](./PHASE_2_0_FOUNDATION.md) | `reservation.source`, `sales_channel` |
| [`PHASE_2_1_HK_SHIFT.md`](./PHASE_2_1_HK_SHIFT.md) | `hk_shift`, `hk_room_task` |
| [`PHASE_2_3_BOOKING_ENGINE.md`](./PHASE_2_3_BOOKING_ENGINE.md) | จอง `direct_web` |
| [`PHASE_2_4_CHANNEL_MANAGER.md`](./PHASE_2_4_CHANNEL_MANAGER.md) | จอง OTA |
| [`../../mvp/implementation/PHASE_5_REPORTING.md`](../../mvp/implementation/PHASE_5_REPORTING.md) | Pattern รายงาน MVP |
