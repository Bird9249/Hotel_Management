/** ບັນຊີ seed ຈາກ migration 0000_happy_celestials.sql — ໃຊ້ໃນ development ເທົ່ານັ້ນ */
export const DEV_LOGIN_ROLES = [
  {
    id: "admin",
    label: "ຜູ້ດູແລລະບົບ",
    email: "admin@hotel.com",
    password: "123456",
  },
  {
    id: "receptionist",
    label: "ພ/ງ.ຕ້ອນຮັບ",
    email: "receptionist@hotel.com",
    password: "123456",
  },
  {
    id: "housekeeping",
    label: "ແມ່ບ້ານ",
    email: "housekeeping@hotel.com",
    password: "123456",
  },
] as const;

export type DevLoginRoleId = (typeof DEV_LOGIN_ROLES)[number]["id"];
