export const Permissions = {
  users: {
    create: "users:create",
    read: "users:read",
    update: "users:update",
    delete: "users:delete",
    ban: "users:ban",
  },
  audit: {
    read: "audit:read",
  },
  rooms: {
    read: "rooms:read",
    create: "rooms:create",
    update: "rooms:update",
    delete: "rooms:delete",
    status: "rooms:status",
  },
  guests: {
    read: "guests:read",
    create: "guests:create",
    update: "guests:update",
    delete: "guests:delete",
  },
  reservations: {
    read: "reservations:read",
    create: "reservations:create",
    update: "reservations:update",
    cancel: "reservations:cancel",
    checkin: "reservations:checkin",
    checkout: "reservations:checkout",
  },
  billing: {
    read: "billing:read",
    invoice: "billing:invoice",
    payment: "billing:payment",
    shift: "billing:shift",
  },
  reports: {
    read: "reports:read",
  },
  channels: {
    read: "channels:read",
    manage: "channels:manage",
    sync: "channels:sync",
  },
  housekeeping: {
    read: "housekeeping:read",
    shift: "housekeeping:shift",
    task: "housekeeping:task",
  },
} as const;

export const ALL_PERMISSIONS = Object.entries(Permissions).flatMap(
  ([resource, actions]) =>
    Object.entries(actions).map(([action, id]) => ({ id, resource, action })),
);

export type PermissionId = (typeof ALL_PERMISSIONS)[number]["id"];

// Human-friendly labels for rendering in UI
export const RESOURCE_LABELS: Record<string, string> = {
  users: "ຜູ້ໃຊ້",
  audit: "ບັນທຶກການກວດກາ",
  rooms: "ຫ້ອງພັກ",
  guests: "ລູກຄ້າ",
  reservations: "ການຈອງ",
  billing: "ການເງິນ",
  reports: "ລາຍງານ",
  channels: "ຊ່ອງທາງການຂາຍ",
  housekeeping: "ແມ່ບ້ານ",
};

export const ACTION_LABELS: Record<string, string> = {
  create: "ສ້າງ",
  read: "ເບິ່ງ",
  update: "ແກ້ໄຂ",
  delete: "ລຶບ",
  ban: "ລະງັບ",
  status: "ສະຖານະ",
  cancel: "ຍົກເລີກ",
  checkin: "ເຊັກອິນ",
  checkout: "ເຊັກເອົາ",
  invoice: "ໃບບິນ",
  payment: "ຊຳລະເງິນ",
  shift: "ກະ",
  manage: "ຈັດການ",
  sync: "ຊິງຄ໌",
  task: "ວຽກ",
  all: "ທັງໝົດ",
};

export function getResourceLabel(resource: string): string {
  return RESOURCE_LABELS[resource] ?? resource;
}

export function getActionLabel(action: string): string {
  return ACTION_LABELS[action] ?? action;
}

export function getPermissionLabel(id: PermissionId): string {
  const [resource, action] = (id as string).split(":");
  return `${getActionLabel(action ?? "")} ${getResourceLabel(resource ?? "")}`;
}

export function getPermissionLabels(ids: PermissionId[]): string[] {
  return ids.map((id) => getPermissionLabel(id));
}
