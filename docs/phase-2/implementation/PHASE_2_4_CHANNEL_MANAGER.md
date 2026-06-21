# Phase 2.4 — Channel Manager (OTA Integration)

> เป้าหมาย: เชื่อม inventory กับ OTA (Agoda, Booking.com, Expedia) sync real-time กัน overbooking
> Dependencies: Phase 2.0 (`channels` schema + inventory service), Phase 2.3 แนะนำทำก่อน (ทดสอบ inventory ครบ)
> โมดูล: ต่อยอด `src/modules/channels`
> อ้างอิง: [`../ROADMAP.md`](../ROADMAP.md)

---

## 1. ขอบเขต

| Feature | รายละเอียด |
|---------|------------|
| **Adapter pattern** | interface รองรับหลาย OTA / middleware |
| **Webhook inbound** | จองจาก OTA → `reservation` idempotent |
| **Push outbound** | inventory เปลี่ยน → sync ไป OTA |
| **Sync log + retry** | audit + manual retry บน Admin UI |
| **Overbooking guard** | reject OTA ถ้าเต็ม · upsert ถ้า retry |

**Deliverable:** Admin ตั้งค่า OTA + เห็น sync log + จองจาก OTA เข้าระบบอัตโนมัติ อย่างน้อย 1 แพลตฟอร์ม

---

## 2. กลยุทธ์การ integrate

| แนวทาง | ข้อดี | ข้อเสีย |
|--------|------|--------|
| **A. Channel Manager Middleware** (Channex, SiteMinder) | 1 API → หลาย OTA | ค่าบริการรายเดือน |
| **B. Direct OTA API** (Booking.com, Expedia, Agoda) | ไม่ผ่านคนกลาง | certification ยาว |

**แนะนำ:** Adapter pattern + **1 ช่องทางก่อน**
- มี budget CM → Channex / SiteMinder
- ไม่มี → mock adapter + manual CSV import แล้วค่อยต่อ API จริง

---

## 3. Adapter Interface

```ts
// src/modules/channels/domain/adapters/types.ts
export interface ChannelAdapter {
  code: SalesChannelCode;
  pushAvailability(input: PushAvailabilityInput): Promise<void>;
  pullReservations(since: Date): Promise<ExternalReservation[]>;
  acknowledgeReservation(externalId: string): Promise<void>;
}
```

Implementations:
- `adapters/channex.adapter.ts` หรือ `adapters/mock-ota.adapter.ts`

---

## 4. Webhook Inbound

```
POST /api/webhooks/channels/:channelCode
1. verify signature / API key
2. parse → ExternalReservation DTO
3. idempotent upsert (channelId, externalBookingId)
4. map room type → assign room อัตโนมัติ หรือ unassigned queue
5. reserveInventoryService — ถ้าเต็ม reject + log failed
6. insert channel_sync_log success
7. (optional) notify Reception dashboard badge
```

---

## 5. Push Outbound

Trigger เมื่อ:
- สร้าง/ยกเลิก/เปลี่ยนวันที่ reservation
- ห้อง → `maintenance`
- ปิด channel mapping

```
async function onInventoryChanged(roomTypeId, dateRange) {
  for (const channel of activeChannels) {
    await enqueue({ type: "push_availability", channelId, roomTypeId, dateRange });
  }
}
```

**MVP sync:** cron ทุก 5 นาที + ปุ่ม "Sync now"
**2.4.1:** real-time push หลัง transaction commit

---

## 6. กัน Overbooking

```
รับจอง OTA:
- ใช้ reserveInventoryService เดียวกับ front desk
- เต็ม → reject webhook + log + alert Admin
- retry ซ้ำ → upsert ด้วย external id

จองในระบบ:
- push availability ลด count ไป OTA (cron หรือ real-time)
```

---

## 7. Admin UI

| Route | ฟังก์ชัน |
|-------|----------|
| `/app/channels` | รายการ OTA, สถานะ, last sync |
| `/app/channels/:id` | mapping, credentials, test connection |
| `/app/channels/:id/logs` | sync log + retry failed |

(ขยายจาก Phase 2.0 — เพิ่ม sync controls + log viewer)

---

## 8. Environment & Deploy

```env
CHANNEX_API_KEY=
CHANNEX_PROPERTY_ID=
WEBHOOK_SECRET_CHANNELS=
```

- Webhook URL ต้อง **HTTPS public**
- Nginx route `/api/webhooks/channels/*`
- Runbook setup credential ใน Admin UI / `.env`

### Demo webhook (Booking.com)

```bash
curl -X POST http://localhost:3000/api/webhooks/channels/booking_com \
  -H "Authorization: Bearer dev-channel-webhook-secret" \
  -H "Content-Type: application/json" \
  -d '{
    "externalBookingId": "BDC-DEMO-001",
    "externalRoomTypeId": "BDC-STD-001",
    "guestName": "Booking Guest",
    "phone": "02012345678",
    "checkInDate": "2026-08-10",
    "checkOutDate": "2026-08-12",
    "guestsCount": 2,
    "status": "booked"
  }'
```

### Demo webhook (mock Agoda)

```bash
curl -X POST http://localhost:3000/api/webhooks/channels/agoda \
  -H "Authorization: Bearer dev-channel-webhook-secret" \
  -H "Content-Type: application/json" \
  -d '{
    "externalBookingId": "AGD-DEMO-001",
    "externalRoomTypeId": "AGD-DLX-001",
    "guestName": "OTA Guest",
    "phone": "02012345678",
    "checkInDate": "2026-08-01",
    "checkOutDate": "2026-08-03",
    "guestsCount": 2,
    "status": "booked"
  }'
```

- Admin sync: `/app/channels/{id}` → **Sync now**
- Logs + retry: `/app/channels/{id}/logs`

---

## 9. Tasks

- [x] Adapter interface + mock adapter + tests
- [x] Webhook endpoint + signature verification
- [x] Import reservation service (idempotent)
- [x] Push availability job (cron / Bun scheduler)
- [x] Sync log UI + manual retry
- [x] Integrate OTA จริง 1 แพลตฟอร์ม (mock Agoda adapter สำหรับ demo)
- [x] Runbook + demo seed channel records
- [x] Alert Admin เมื่อ sync failed ติดต่อกัน

---

## 10. Definition of Done (Phase 2.4)

- [x] จอง OTA webhook 1 ครั้ง → reservation เดียว; retry ไม่ซ้ำ
- [x] จองห้องสุดท้ายในระบบ → OTA ไม่รับจองซ้ำ (ภายใน sync window)
- [x] Sync log ครบ push/pull + retry failed ได้
- [x] OTA จริง 1 แพลตฟอร์ม (mock Agoda + webhook demo)
