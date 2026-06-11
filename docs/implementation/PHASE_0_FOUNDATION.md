# Phase 0 — Foundation (RBAC สำหรับโรงแรม)

> เป้าหมาย: เตรียม permission keys และ roles ของโรงแรมให้พร้อม ก่อนสร้าง business module
> Dependencies: ไม่มี (ใช้โครงสร้าง `auth` / `roles` / `users` ที่มีอยู่แล้ว)

---

## 1. ภาพรวมงาน

โปรเจกต์มีระบบ RBAC อยู่แล้ว (`src/modules/roles`) โดย:
- รายการ permission ถูกประกาศใน `src/modules/roles/domain/contracts/permissions.ts`
- role `admin` ได้รับทุก permission อัตโนมัติ (`src/modules/roles/api/... → Roles` ใน `roles.ts` contract)
- มี script `bun run rbac:sync` (`src/modules/roles/domain/scripts/sync.ts`) สำหรับ sync จาก code → DB

เฟสนี้แค่ "เพิ่ม permission ใหม่" และ "เตรียม role ของพนักงาน" ยังไม่มีตาราง business ใหม่

---

## 2. เพิ่ม Permission Keys ของโรงแรม

แก้ `src/modules/roles/domain/contracts/permissions.ts` — เพิ่ม resource ใหม่ใน object `Permissions`:

```ts
export const Permissions = {
  users: { create: "users:create", read: "users:read", update: "users:update", delete: "users:delete", ban: "users:ban" },
  audit: { read: "audit:read" },
  // === Hotel ===
  rooms:        { read: "rooms:read", create: "rooms:create", update: "rooms:update", delete: "rooms:delete", status: "rooms:status" },
  guests:       { read: "guests:read", create: "guests:create", update: "guests:update", delete: "guests:delete" },
  reservations: { read: "reservations:read", create: "reservations:create", update: "reservations:update", cancel: "reservations:cancel", checkin: "reservations:checkin", checkout: "reservations:checkout" },
  billing:      { read: "billing:read", invoice: "billing:invoice", payment: "billing:payment" },
  reports:      { read: "reports:read" },
} as const;
```

> `ALL_PERMISSIONS` และ type `PermissionId` คำนวณจาก object นี้อัตโนมัติ ไม่ต้องแก้เพิ่ม

เพิ่ม label ภาษาลาวใน `RESOURCE_LABELS` และ `ACTION_LABELS` (ไฟล์เดียวกัน) เช่น:

```ts
export const RESOURCE_LABELS: Record<string, string> = {
  users: "ຜູ້ໃຊ້",
  audit: "ບັນທຶກການກວດກາ",
  rooms: "ຫ້ອງພັກ",
  guests: "ລູກຄ້າ",
  reservations: "ການຈອງ",
  billing: "ການເງິນ",
  reports: "ລາຍງານ",
};
// เพิ่ม action: status/checkin/checkout/cancel/invoice/payment ตามต้องการ
```

---

## 3. กำหนด Roles ของพนักงาน

จับคู่ permission ให้แต่ละ role ตามตารางนี้ (เป็น mapping ระดับนโยบาย):

| Permission group | Admin | Receptionist | Housekeeping |
|------------------|:-----:|:------------:|:------------:|
| `rooms:read` | ✓ | ✓ | ✓ |
| `rooms:create/update/delete` | ✓ | — | — |
| `rooms:status` | ✓ | ✓ | ✓ |
| `guests:*` | ✓ | ✓ | — |
| `reservations:read/create/update/cancel` | ✓ | ✓ | — |
| `reservations:checkin/checkout` | ✓ | ✓ | — |
| `billing:*` | ✓ | ✓ | — |
| `reports:read` | ✓ | (อ่านอย่างเดียว ถ้าต้องการ) | — |
| `users:*`, `audit:read` | ✓ | — | — |

แนวทาง implement (เลือกอย่างใดอย่างหนึ่ง):
- **ทางที่แนะนำ:** สร้าง role `receptionist` และ `housekeeping` ผ่านหน้า UI จัดการ Role ที่มีอยู่ (`/app/roles/create`) แล้วติ๊ก permission ตามตาราง — ไม่ต้องแก้โค้ด
- **ทางแบบ code-defined:** ถ้าต้องการให้ role ถูก sync จาก code ให้เพิ่มใน mapping `Roles` (ดู `src/modules/roles/domain/contracts/roles.ts`) แล้วรัน `bun run rbac:sync`

```ts
// ตัวอย่างถ้าทำแบบ code-defined ใน roles.ts
export const Roles: Record<string, PermissionId[]> = {
  admin: ALL_PERMISSIONS.map((p) => p.id),
  receptionist: [
    "rooms:read", "rooms:status",
    "guests:read", "guests:create", "guests:update", "guests:delete",
    "reservations:read", "reservations:create", "reservations:update", "reservations:cancel",
    "reservations:checkin", "reservations:checkout",
    "billing:read", "billing:invoice", "billing:payment",
  ],
  housekeeping: ["rooms:read", "rooms:status"],
};
```

---

## 4. Task Checklist

- [ ] เพิ่ม resource `rooms / guests / reservations / billing / reports` ใน `permissions.ts`
- [ ] เพิ่ม `RESOURCE_LABELS` / `ACTION_LABELS` ภาษาลาวให้ครบ
- [ ] เลือกแนวทาง role (UI หรือ code-defined) แล้วสร้าง `receptionist` + `housekeeping`
- [ ] รัน `bun run rbac:sync` (กรณี code-defined) และตรวจ drift
- [ ] ตรวจว่า `bun run lint` ผ่าน

---

## 5. Acceptance Criteria

- มี permission ครบทุก resource ของโรงแรมในระบบ
- มี role `admin`, `receptionist`, `housekeeping` พร้อม permission ตามตาราง
- เข้าหน้า `/app/roles` แล้วเห็น role และ permission ใหม่แสดงผล (พร้อม label ภาษาลาว)

---

## 6. หมายเหตุสำหรับ Phase ถัดไป

ทุก backend route ของ business module จะใช้ `requirePermission(Permissions.<resource>.<action>)`
(`src/modules/roles/domain/http/middleware.ts`) และทุก frontend route จะห่อด้วย
`<RequirePermissions all={[...]}>` (`src/modules/auth/presentation/ui/RequirePermissions`)
โดยอ้างอิง permission keys ที่สร้างในเฟสนี้
