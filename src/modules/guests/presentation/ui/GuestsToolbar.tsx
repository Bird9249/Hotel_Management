import { PlusIcon } from "lucide-react";
import { Button } from "@/components/kit";

type GuestsToolbarProps = {
  canManage: boolean;
  onCreate: () => void;
};

export function GuestsToolbar({ canManage, onCreate }: GuestsToolbarProps) {
  return (
    <div className="mb-2 flex flex-wrap items-center justify-between space-y-2">
      <div>
        <h2 className="font-bold text-2xl tracking-tight">ລູກຄ້າ</h2>
        <p className="text-muted-foreground">ຈັດການໂປຣໄຟລ໌ລູກຄ້າໂຮງແຮມ.</p>
      </div>
      {canManage && (
        <Button onClick={onCreate}>
          <PlusIcon className="h-4 w-4" />
          ເພີ່ມລູກຄ້າ
        </Button>
      )}
    </div>
  );
}
