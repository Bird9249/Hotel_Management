import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import {
  Banknote,
  BrushCleaning,
  CalendarCheck,
  CalendarDays,
  ChartColumn,
  ConciergeBell,
  ReceiptText,
  UserRound,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/kit";
import { usePermissions } from "@/modules/auth/presentation/model/usePermissions";
import type { PermissionId } from "@/modules/roles/domain/contracts/permissions";

type QuickAction = {
  title: string;
  description: string;
  url: string;
  icon: LucideIcon;
  requiredPermissions: PermissionId[];
};

const quickActions: QuickAction[] = [
  {
    title: "ໜ້າຮັບແຂກ",
    description: "ເຊັກອິນ / ເຊັກເອົາ",
    url: "/app/front-desk",
    icon: ConciergeBell,
    requiredPermissions: ["reservations:read"],
  },
  {
    title: "ສ້າງການຈອງ",
    description: "ຈອງຫ້ອງໃໝ່",
    url: "/app/reservations/create",
    icon: CalendarCheck,
    requiredPermissions: ["reservations:create"],
  },
  {
    title: "ປະຕິທິນ",
    description: "ມຸມມອງປະຕິທິນ",
    url: "/app/calendar",
    icon: CalendarDays,
    requiredPermissions: ["reservations:read"],
  },
  {
    title: "ເພີ່ມລູກຄ້າ",
    description: "ລົງທະບຽນແຂກ",
    url: "/app/guests/create",
    icon: UserRound,
    requiredPermissions: ["guests:create"],
  },
  {
    title: "ໃບບິນ",
    description: "ຈັດການໃບບິນ",
    url: "/app/invoices",
    icon: ReceiptText,
    requiredPermissions: ["billing:read"],
  },
  {
    title: "ກະເງິນສົດ",
    description: "ເປີດ–ປິດກະ",
    url: "/app/cash-shifts",
    icon: Banknote,
    requiredPermissions: ["billing:shift"],
  },
  {
    title: "ລາຍງານ",
    description: "ລາຍຮັບ & ເຂົ້າພັກ",
    url: "/app/reports",
    icon: ChartColumn,
    requiredPermissions: ["reports:read"],
  },
  {
    title: "ທຳຄວາມສະອາດ",
    description: "ສະຖານະຫ້ອງ",
    url: "/app/housekeeping",
    icon: BrushCleaning,
    requiredPermissions: ["rooms:status"],
  },
];

export function QuickActions() {
  const { hasAll } = usePermissions();
  const visibleActions = quickActions.filter((action) =>
    hasAll(action.requiredPermissions),
  );

  if (visibleActions.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>ການດຳເນີນງານດ່ວນ</CardTitle>
        <CardDescription>ເຂົ້າເຖິງຟັງຊັນທີ່ໃຊ້ບໍ່</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
          {visibleActions.map((action) => (
            <Link
              key={action.url}
              to={action.url}
              className="flex flex-col gap-2 rounded-lg border bg-card p-3 transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <action.icon className="size-5 text-primary" />
              <div>
                <p className="font-medium text-sm">{action.title}</p>
                <p className="text-muted-foreground text-xs">
                  {action.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
