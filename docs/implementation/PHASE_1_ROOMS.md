# Phase 1 — Room Management (โมดูล `rooms`)

> เป้าหมาย: จัดการประเภทห้อง (Room Types) และห้องพัก (Rooms) พร้อมสถานะห้องแบบ real-time
> Dependencies: Phase 0 (มี permission `rooms:*`)
> โมดูลใหม่: `src/modules/rooms`

---

## 1. ขอบเขต

- **Room Types**: ชื่อ, คำอธิบาย, ราคา/คืน, ความจุ
- **Rooms**: เลขห้อง, ชั้น, ผูก room type, สถานะ
- **Room Status**: `available` / `occupied` / `cleaning` / `maintenance`

---

## 2. Database Schema

สร้าง `src/server/platform/db/schema/rooms.ts`:

```ts
import { integer, numeric, pgTable, text } from "drizzle-orm/pg-core";

export const roomType = pgTable("room_type", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  basePrice: numeric("base_price", { precision: 12, scale: 2 }).notNull(),
  capacity: integer("capacity").notNull().default(2),
});

export const room = pgTable("room", {
  id: text("id").primaryKey(),
  roomNumber: text("room_number").notNull().unique(),
  floor: integer("floor"),
  roomTypeId: text("room_type_id")
    .notNull()
    .references(() => roomType.id, { onDelete: "restrict" }),
  // available | occupied | cleaning | maintenance
  status: text("status").notNull().default("available"),
});
```

จากนั้นเพิ่มใน `src/server/platform/db/schema/index.ts`:

```ts
export * from "./rooms";
```

แล้วรัน migration:

```bash
bun run db:generate
bun run db:migrate
```

---

## 3. Domain Layer (`src/modules/rooms/domain`)

### 3.1 contracts/room-type.ts และ contracts/room.ts (Zod)

```ts
// room-type.ts
import { z } from "zod";

export const RoomTypeCreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  basePrice: z.number().nonnegative(),
  capacity: z.number().int().min(1).default(2),
});
export const RoomTypeUpdateSchema = RoomTypeCreateSchema.partial();
export const RoomTypeIdParamSchema = z.object({ id: z.string().min(1) });
export type RoomTypeCreateInput = z.infer<typeof RoomTypeCreateSchema>;
export type RoomTypeUpdateInput = z.infer<typeof RoomTypeUpdateSchema>;
```

```ts
// room.ts
export const RoomStatusSchema = z.enum(["available", "occupied", "cleaning", "maintenance"]);
export const RoomCreateSchema = z.object({
  roomNumber: z.string().min(1),
  floor: z.number().int().optional(),
  roomTypeId: z.string().min(1),
  status: RoomStatusSchema.default("available"),
});
export const RoomUpdateSchema = RoomCreateSchema.partial();
export const RoomStatusUpdateSchema = z.object({ status: RoomStatusSchema });
export const RoomIdParamSchema = z.object({ id: z.string().min(1) });
```

สร้าง `domain/contracts.ts` (barrel) re-export ทั้งสองไฟล์ — เลียนแบบ `roles/domain/contracts.ts`

### 3.2 repo/ (1 ไฟล์ = 1 query, เลียนแบบ `roles/domain/repo/list-roles.ts`)

- `list-room-types.ts`, `get-room-type-by-id.ts`, `create-room-type.ts`, `update-room-type.ts`, `delete-room-type.ts`
- `list-rooms.ts`, `get-room-by-id.ts`, `create-room.ts`, `update-room.ts`, `delete-room.ts`, `update-room-status.ts`
- ใช้ `buildWhere` / `buildOrderBy` จาก `@/shared/db/query` และ return `OffsetPageDTO<Row>` สำหรับ list
- รับ `client: DbTransaction | DbClient`

### 3.3 service/ (เลียนแบบ `roles/domain/service/create.ts`)

- `create-room-type.ts` / `update` / `delete`
- `create-room.ts` / `update` / `delete`
- `set-room-status.ts` — เปลี่ยนสถานะห้อง (จุดนี้จะถูกเรียกซ้ำใน Phase 3 ตอน check-in/out)
- ใช้ `randomUUIDv7()` จาก `bun` สร้าง id

### 3.4 http/rooms.routes.ts (เลียนแบบ `roles/domain/http/rbac.routes.ts`)

| Method | Path | Permission |
|--------|------|-----------|
| GET | `/room-types` | `rooms:read` |
| POST | `/room-types` | `rooms:create` |
| PATCH | `/room-types/:id` | `rooms:update` |
| DELETE | `/room-types/:id` | `rooms:delete` |
| GET | `/rooms` | `rooms:read` |
| GET | `/rooms/:id` | `rooms:read` |
| POST | `/rooms` | `rooms:create` |
| PATCH | `/rooms/:id` | `rooms:update` |
| PATCH | `/rooms/:id/status` | `rooms:status` |
| DELETE | `/rooms/:id` | `rooms:delete` |

ใช้ `.use(serverContext)`, `requirePermission(Permissions.rooms.x)`, validate ด้วย schema ใน `body`/`params`/`query` (`OffsetPageQuerySchema` สำหรับ list)

### 3.5 api/index.ts (เลียนแบบ `roles/api/index.ts`)

```ts
export const roomsRoutes = new Elysia().use(
  new Elysia({ prefix: "/rooms-module" })
    .use(serverContext)
    .onBeforeHandle(requireAuth)
    .use(roomsRoutes_internal),
);
```
> เลือก prefix ที่ไม่ชนกัน เช่น `/inventory` หรือ `/hotel` (เพราะ path `/rooms` ใช้ภายในแล้ว) — แนะนำ prefix `/hotel` แล้ว path เป็น `/hotel/rooms`, `/hotel/room-types`

---

## 4. ลงทะเบียน Backend Route

แก้ `src/server/api/rest/index.ts`:

```ts
import { roomsRoutes } from "@/modules/rooms/api";
// ...
.use(roomsRoutes)
```

---

## 5. Presentation Layer (`src/modules/rooms/presentation`)

### 5.1 api/client.ts + api/queries.ts
เลียนแบบ `roles/presentation/api/client.ts` และ `queries.ts`:
- `roomsApi` / `roomTypesApi` (list/get/create/update/remove + `setStatus`)
- hooks: `useRoomsQuery`, `useRoomQuery`, `useCreateRoom`, `useUpdateRoom`, `useDeleteRoom`, `useSetRoomStatus`, และชุดของ room type
- queryKeys pattern เหมือน `rolesKeys`

### 5.2 ui/
- `RoomsTable.tsx` (TanStack Table — เลียนแบบ `RolesTable`) แสดงเลขห้อง, ประเภท, ชั้น, **badge สถานะ** + ปุ่มเปลี่ยนสถานะ
- `RoomForm.tsx`, `RoomTypeForm.tsx` (react-hook-form + Zod resolver)
- `RoomStatusBadge.tsx` (สี: available=เขียว, occupied=น้ำเงิน, cleaning=เหลือง, maintenance=เทา)
- `RoomsToolbar.tsx`, `RoomsFilter.tsx`

### 5.3 pages/
- `RoomsPage.tsx` (list + filter + toolbar — เลียนแบบ `RolesPage.tsx`)
- `RoomCreatePage.tsx`, `RoomEditPage.tsx`
- `RoomTypesPage.tsx` (+ create/edit อาจทำเป็น dialog ในหน้าเดียว)

---

## 6. ลงทะเบียน Frontend Route

แก้ `src/app/router.tsx` — เพิ่ม lazy import + `createRoute` ห่อด้วย `RequirePermissions`:

```tsx
const roomsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/rooms",
  component: () => (
    <RequirePermissions all={["rooms:read"]}>
      <LazyPage><RoomsPage /></LazyPage>
    </RequirePermissions>
  ),
});
// roomCreate (/rooms/create), roomEdit (/rooms/$id/edit), roomTypes (/room-types)
```
แล้วเพิ่มทุก route เข้า `appRoute.addChildren([...])` ใน `routeTree`

---

## 7. Sidebar + Breadcrumb

`src/app/layout/data/sidebar-data.tsx` — เพิ่ม navGroup ใหม่ "ໂຮງແຮມ":

```tsx
{
  title: "ໂຮງແຮມ",
  items: [
    { title: "ຫ້ອງພັກ", url: "/app/rooms", icon: BedDouble, requiredPermissions: ["rooms:read"] },
    { title: "ປະເພດຫ້ອງ", url: "/app/room-types", icon: Tags, requiredPermissions: ["rooms:read"] },
  ],
}
```

`src/app/layout/data/route-meta.ts` — เพิ่ม label ภาษาลาว:

```ts
"/app/rooms": { label: "ຫ້ອງພັກ" },
"/app/rooms/create": { label: "ເພີ່ມຫ້ອງ", parent: "/app/rooms" },
"/app/rooms/$id/edit": { label: "ແກ້ໄຂຫ້ອງ", parent: "/app/rooms" },
"/app/room-types": { label: "ປະເພດຫ້ອງ" },
```

---

## 8. Task Checklist

- [ ] DB: `schema/rooms.ts` + re-export ใน `schema/index.ts`
- [ ] `db:generate` + `db:migrate`
- [ ] contracts (room-type, room) + barrel
- [ ] repo ครบทุก query
- [ ] service ครบ + `set-room-status`
- [ ] http routes + permission
- [ ] `api/index.ts` + ลงทะเบียนใน `rest/index.ts`
- [ ] presentation: client/queries/ui/pages
- [ ] frontend routes ใน `router.tsx`
- [ ] sidebar + route-meta
- [ ] `bun run lint`

---

## 9. Acceptance Criteria

- สร้าง/แก้ไข/ลบ Room Type ได้ (ชื่อ, ราคา, ความจุ)
- สร้าง/แก้ไข/ลบ Room ได้ และผูกกับ Room Type
- เปลี่ยนสถานะห้องได้ และเห็น badge สถานะอัปเดต
- Housekeeping เปลี่ยนสถานะ (`rooms:status`) ได้ แต่สร้าง/ลบห้องไม่ได้
- Admin จัดการได้ครบ
