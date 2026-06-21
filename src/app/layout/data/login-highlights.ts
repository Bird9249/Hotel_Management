import type { LucideIcon } from "lucide-react";
import {
  BedDouble,
  ChartColumn,
  ConciergeBell,
  Globe2,
  ReceiptText,
} from "lucide-react";

export type LoginHighlight = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export const loginHighlights: LoginHighlight[] = [
  {
    icon: ConciergeBell,
    title: "ໜ້າຮັບແຂກ",
    description: "ຈອງຫ້ອງ, check-in / check-out ແລະ ປະຕິທິນການເຂົ້າພັກ",
  },
  {
    icon: BedDouble,
    title: "ຫ້ອງພັກ ແລະ ອານາໄມ",
    description: "ສະຖານະຫ້ອງ real-time, ຄິວທຳຄວາມສະອາດ ແລະ ກະແມ່ບ້ານ",
  },
  {
    icon: ReceiptText,
    title: "ໃບບິນ ແລະ ກະເງິນສົດ",
    description: "ອອກໃບບິນ, ບັນທຶກການຊຳລະ ແລະ ເປີດ–ປິດກະ Reception",
  },
  {
    icon: Globe2,
    title: "ຊ່ອງທາງຈອງ",
    description: "Direct Booking, OTA ແລະ inventory ລວມທຸກຊ່ອງທາງ",
  },
  {
    icon: ChartColumn,
    title: "ລາຍງານ",
    description: "ລາຍຮັບ, occupancy, ຊ່ອງທາງຈອງ ແລະ export CSV",
  },
];
