import {
  AudioWaveform,
  BedDouble,
  CalendarCheck,
  CalendarDays,
  Command,
  GalleryVerticalEnd,
  LayoutDashboard,
  ShieldCheck,
  Tags,
  UserCog,
  UserRound,
  Users,
} from "lucide-react";
import type { SidebarData } from "../types";

export const sidebarData: SidebarData = {
  teams: [
    {
      name: "Shadcn Admin",
      logo: Command,
      plan: "Vite + ShadcnUI",
    },
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
  ],
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
      title: "ໂຮງແຮມ",
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
