import type { LinkProps } from "@tanstack/react-router";

export type RouteMeta = {
  /** Display label shown in the breadcrumb trail. */
  label: string;
  /** Parent route id used to build the breadcrumb chain. */
  parent?: string;
};

/**
 * Maps a TanStack route id (the `path` pattern) to breadcrumb metadata.
 * `parent` references another concrete route id so we can build a trail even
 * for routes that are not physically nested (e.g. `/app/users/$id/edit`).
 */
export const routeMeta: Record<string, RouteMeta> = {
  "/app/dashboard": { label: "ແຜງຄວບຄຸມ" },
  "/app/roles": { label: "ບົດບາດ" },
  "/app/roles/create": { label: "ສ້າງບົດບາດ", parent: "/app/roles" },
  "/app/roles/$id/edit": { label: "ແກ້ໄຂບົດບາດ", parent: "/app/roles" },
  "/app/users": { label: "ຜູ້ໃຊ້" },
  "/app/users/create": { label: "ສ້າງຜູ້ໃຊ້", parent: "/app/users" },
  "/app/users/$id/edit": { label: "ແກ້ໄຂຜູ້ໃຊ້", parent: "/app/users" },
  "/app/audit": { label: "ບັນທຶກການກວດກາ" },
  "/app/audit/$id": { label: "ລາຍລະອຽດການກວດກາ", parent: "/app/audit" },
  "/app/rooms": { label: "ຫ້ອງພັກ" },
  "/app/rooms/create": { label: "ເພີ່ມຫ້ອງ", parent: "/app/rooms" },
  "/app/rooms/$id/edit": { label: "ແກ້ໄຂຫ້ອງ", parent: "/app/rooms" },
  "/app/room-types": { label: "ປະເພດຫ້ອງ" },
  "/app/guests": { label: "ລູກຄ້າ" },
  "/app/guests/create": { label: "ເພີ່ມລູກຄ້າ", parent: "/app/guests" },
  "/app/guests/$id/edit": { label: "ແກ້ໄຂລູກຄ້າ", parent: "/app/guests" },
  "/app/front-desk": { label: "ໜ້າຮັບແຂກ" },
  "/app/reservations": { label: "ການຈອງ" },
  "/app/reservations/create": {
    label: "ສ້າງການຈອງ",
    parent: "/app/reservations",
  },
  "/app/reservations/$id/edit": {
    label: "ແກ້ໄຂການຈອງ",
    parent: "/app/reservations",
  },
  "/app/calendar": { label: "ປະຕິທິນການຈອງ", parent: "/app/reservations" },
  "/app/housekeeping": { label: "ຄິວທຳຄວາມສະອາດ" },
  "/app/invoices": { label: "ໃບບິນ" },
  "/app/invoices/$id": {
    label: "ລາຍລະອຽດໃບບິນ",
    parent: "/app/invoices",
  },
  "/app/cash-shifts": { label: "ກະເງິນສົດ" },
  "/app/reports": { label: "ລາຍງານ" },
  "/app/profile": { label: "ໂປຣໄຟລ໌" },
  "/app/settings": { label: "ການຕັ້ງຄ່າ" },
};

export const HOME_ROUTE = "/app/dashboard" satisfies LinkProps["to"];
