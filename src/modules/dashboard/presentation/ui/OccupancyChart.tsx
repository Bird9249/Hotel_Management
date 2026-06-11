import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
} from "@/components/kit";
import { usePermissions } from "@/modules/auth/presentation/model/usePermissions";
import { useOccupancyQuery } from "@/modules/reports/presentation/api/queries";
import { defaultReportParams } from "@/modules/reports/presentation/ui/DateRangePicker";
import { OccupancyChart as ReportOccupancyChart } from "@/modules/reports/presentation/ui/OccupancyChart";

export function OccupancyChart() {
  const { has } = usePermissions();
  const canReadReports = has("reports:read");
  const occupancy = useOccupancyQuery(defaultReportParams(), canReadReports);

  if (!canReadReports) return null;

  if (occupancy.isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>ອັດຕາເຂົ້າພັກ 7 ວັນ</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[260px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (occupancy.data && occupancy.data.length > 0) {
    return (
      <ReportOccupancyChart data={occupancy.data} title="ອັດຕາເຂົ້າພັກ 7 ວັນ" />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>ອັດຕາເຂົ້າພັກ 7 ວັນ</CardTitle>
        <CardDescription>ຍັງບໍ່ມີຂໍ້ມູນ</CardDescription>
      </CardHeader>
    </Card>
  );
}
