# Implementation Plans — ระบบจัดการโรงแรม (MVP)

แผนการ implement แบบลงรายละเอียด แยกตามแต่ละ Phase
อ้างอิงภาพรวมจาก [`../../PROJECT_OVERVIEW.md`](../../PROJECT_OVERVIEW.md) และลำดับงานจาก [`../MODULE_ROADMAP.md`](../MODULE_ROADMAP.md)

## รายการแผนแต่ละ Phase

| Phase | ไฟล์ | ขอบเขต |
|-------|------|--------|
| 0 | [`PHASE_0_FOUNDATION.md`](./PHASE_0_FOUNDATION.md) | Permission keys ของโรงแรม + ผูก 3 roles (Admin / Receptionist / Housekeeping) |
| 1 | [`PHASE_1_ROOMS.md`](./PHASE_1_ROOMS.md) | โมดูล `rooms` — Room Types & Rooms + สถานะห้อง real-time |
| 2 | [`PHASE_2_RESERVATIONS.md`](./PHASE_2_RESERVATIONS.md) | โมดูล `guests` + `reservations` + Booking Calendar |
| 3 | [`PHASE_3_FRONT_DESK.md`](./PHASE_3_FRONT_DESK.md) | Check-in / Check-out + อัปเดตสถานะห้องอัตโนมัติ |
| 4 | [`PHASE_4_BILLING.md`](./PHASE_4_BILLING.md) | โมดูล `billing` — Invoice + Payment + Tax |
| 5 | [`PHASE_5_REPORTING.md`](./PHASE_5_REPORTING.md) | โมดูล `reports` — Daily Sales + Occupancy Rate |
| 6 | [`PHASE_6_CASH_SHIFT.md`](./PHASE_6_CASH_SHIFT.md) | ກະເງິນສົດ Reception — Open/Close Shift + Opening Cash + สรุปส่งมอบ |

> Phase 2 (Post-MVP): [`../../phase-2/ROADMAP.md`](../../phase-2/ROADMAP.md)

---

## ข้อตกลงร่วม (Conventions) ของทุก Phase

แต่ละโมดูลใหม่ทำตามโครงสร้างเดิมที่มีในโปรเจกต์ (อ้างอิงจาก `src/modules/roles`):

```
src/modules/<module>/
├── api/index.ts                 # export <module>Routes (prefix + requireAuth + use(routes))
├── domain/
│   ├── contracts/<name>.ts      # Zod schema + types (Create/Update/IdParam)
│   ├── contracts.ts             # barrel re-export
│   ├── types.ts                 # ServiceResult / Row types
│   ├── repo/<verb>-<entity>.ts  # 1 ไฟล์ = 1 query (Drizzle)
│   ├── service/<verb>.ts        # business logic เรียก repo
│   └── http/<name>.routes.ts    # Elysia routes + requirePermission
└── presentation/
    ├── api/client.ts            # fetcher → REST
    ├── api/queries.ts           # TanStack Query hooks + queryKeys
    ├── pages/*.tsx              # หน้า list / create / edit
    └── ui/*.tsx                 # Table / Form / Toolbar / Filter
```

### Checklist กลางสำหรับ "ทุก" โมดูลใหม่
1. **DB schema** → เพิ่มไฟล์ใน `src/server/platform/db/schema/<name>.ts` แล้ว re-export ใน `src/server/platform/db/schema/index.ts`
2. **Migration** → `bun run db:generate` แล้ว `bun run db:migrate`
3. **Backend route** → ลงทะเบียนใน `src/server/api/rest/index.ts` (`.use(<module>Routes)`)
4. **Frontend route** → เพิ่ม `createRoute` + ใส่ใน `routeTree` ที่ `src/app/router.tsx` (ห่อด้วย `RequirePermissions`)
5. **Sidebar** → เพิ่มเมนูใน `src/app/layout/data/sidebar-data.tsx`
6. **Breadcrumb** → เพิ่ม label ใน `src/app/layout/data/route-meta.ts`
7. **RBAC** → เพิ่ม permission ใน `src/modules/roles/domain/contracts/permissions.ts` แล้วรัน `bun run rbac:sync`
8. **ตรวจสอบ** → `bun run lint` และทดสอบ flow ด้วย role ที่เกี่ยวข้อง

> หมายเหตุภาษา: ข้อความบน UI ของโปรเจกต์นี้ใช้ **ภาษาลาว** (ดูตัวอย่างใน `sidebar-data.tsx`, `permissions.ts`)
> ให้คง convention เดิม คือ label ที่ผู้ใช้เห็นเป็นภาษาลาว ส่วนชื่อโค้ด/ตัวแปรเป็นอังกฤษ
