import {
  Banknote,
  BedDouble,
  BrushCleaning,
  CalendarCheck,
  CalendarDays,
  ChartColumn,
  ClipboardList,
  ConciergeBell,
  Globe2,
  Hotel,
  LayoutDashboard,
  ReceiptText,
  ShieldCheck,
  Tags,
  UserCog,
  UserRound,
  Users,
} from "lucide-react";
import type { SidebarData } from "../types";

export const sidebarData: SidebarData = {
  brand: {
    name: "ລະບົບຈັດການໂຮງແຮມ",
    tagline: "Hotel Management",
    logo: Hotel,
  },
  navGroups: [
    {
      title: "ທົ່ວໄປ",
      items: [
        {
          title: "ແຜງຄວບຄຸມ",
          url: "/app/dashboard",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: "ການດຳເນີນງານ",
      items: [
        {
          title: "ໜ້າຮັບແຂກ",
          url: "/app/front-desk",
          icon: ConciergeBell,
          requiredPermissions: ["reservations:read"],
        },
        {
          title: "ການຈອງ",
          url: "/app/reservations",
          icon: CalendarCheck,
          requiredPermissions: ["reservations:read"],
        },
        {
          title: "ປະຕິທິນ",
          url: "/app/calendar",
          icon: CalendarDays,
          requiredPermissions: ["reservations:read"],
        },
        {
          title: "ລູກຄ້າ",
          url: "/app/guests",
          icon: UserRound,
          requiredPermissions: ["guests:read"],
        },
      ],
    },
    {
      title: "ຫ້ອງພັກ",
      items: [
        {
          title: "ຫ້ອງພັກ",
          url: "/app/rooms",
          icon: BedDouble,
          requiredPermissions: ["rooms:read"],
        },
        {
          title: "ປະເພດຫ້ອງ",
          url: "/app/room-types",
          icon: Tags,
          requiredPermissions: ["rooms:read"],
        },
        {
          title: "ອານາໄມ",
          url: "/app/housekeeping",
          icon: BrushCleaning,
          requiredPermissions: ["housekeeping:read"],
        },
        {
          title: "ກະແມ່ບ້ານ",
          url: "/app/hk-shifts",
          icon: ClipboardList,
          requiredPermissions: ["housekeeping:read"],
        },
      ],
    },
    {
      title: "ການເງິນ & ລາຍງານ",
      items: [
        {
          title: "ໃບບິນ",
          url: "/app/invoices",
          icon: ReceiptText,
          requiredPermissions: ["billing:read"],
        },
        {
          title: "ກະເງິນສົດ",
          url: "/app/cash-shifts",
          icon: Banknote,
          requiredPermissions: ["billing:shift"],
        },
        {
          title: "ລາຍງານ",
          url: "/app/reports",
          icon: ChartColumn,
          requiredPermissions: ["reports:read"],
        },
        {
          title: "Channel",
          url: "/app/channels",
          icon: Globe2,
          requiredPermissions: ["channels:read"],
        },
      ],
    },
    {
      title: "ການຄວບຄຸມການເຂົ້າເຖິງ",
      items: [
        {
          title: "ບົດບາດ",
          url: "/app/roles",
          icon: UserCog,
          requiredPermissions: ["users:read"],
        },
        {
          title: "ຜູ້ໃຊ້",
          url: "/app/users",
          icon: Users,
          requiredPermissions: ["users:read"],
        },
        {
          title: "ບັນທຶກການກວດກາ",
          url: "/app/audit",
          icon: ShieldCheck,
          requiredPermissions: ["audit:read"],
        },
      ],
    },
  ],
};
