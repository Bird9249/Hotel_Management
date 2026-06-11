import { Link } from "@tanstack/react-router";
import { CalendarDays, PlusIcon } from "lucide-react";
import { Button } from "@/components/kit";

type ReservationsToolbarProps = {
  canManage: boolean;
  onCreate: () => void;
};

export function ReservationsToolbar({
  canManage,
  onCreate,
}: ReservationsToolbarProps) {
  return (
    <div className="mb-2 flex flex-wrap items-center justify-between gap-2 space-y-2">
      <div>
        <h2 className="font-bold text-2xl tracking-tight">ການຈອງ</h2>
        <p className="text-muted-foreground">ຈັດການການຈອງຫ້ອງພັກໃນໂຮງແຮມ.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" asChild>
          <Link to="/app/calendar">
            <CalendarDays className="h-4 w-4" />
            ປະຕິທິນ
          </Link>
        </Button>
        {canManage && (
          <Button onClick={onCreate}>
            <PlusIcon className="h-4 w-4" />
            ສ້າງການຈອງ
          </Button>
        )}
      </div>
    </div>
  );
}
