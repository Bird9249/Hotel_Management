import { Badge } from "@/components/kit";

export function ShiftStatusBadge({ status }: { status: string }) {
  if (status === "open") {
    return (
      <Badge variant="secondary" className="text-emerald-700">
        ເປີດ
      </Badge>
    );
  }
  return <Badge variant="outline">ປິດ</Badge>;
}
