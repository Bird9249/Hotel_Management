import { Download } from "lucide-react";
import { Button } from "@/components/kit";

type ExportCsvButtonProps = {
  onExport: () => void;
  disabled?: boolean;
};

export function ExportCsvButton({ onExport, disabled }: ExportCsvButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onExport}
      disabled={disabled}
    >
      <Download />
      ສົ່ງອອກ CSV
    </Button>
  );
}
