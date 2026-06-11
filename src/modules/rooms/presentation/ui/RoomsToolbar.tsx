import { PlusIcon } from "lucide-react";
import { Button } from "@/components/kit";

type RoomsToolbarProps = {
  canManage: boolean;
  onCreate: () => void;
};

export function RoomsToolbar({ canManage, onCreate }: RoomsToolbarProps) {
  return (
    <div className="mb-2 flex flex-wrap items-center justify-between space-y-2">
      <div>
        <h2 className="font-bold text-2xl tracking-tight">ຫ້ອງພັກ</h2>
        <p className="text-muted-foreground">
          ຈັດການຫ້ອງພັກແລະສະຖານະຫ້ອງໃນໂຮງແຮມ.
        </p>
      </div>
      {canManage && (
        <Button onClick={onCreate}>
          <PlusIcon className="h-4 w-4" />
          ເພີ່ມຫ້ອງ
        </Button>
      )}
    </div>
  );
}
