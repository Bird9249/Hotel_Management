import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
} from "@/components/kit";
import { usePermissions } from "@/modules/auth/presentation/model/usePermissions";
import { useDailySalesQuery } from "@/modules/reports/presentation/api/queries";
import { defaultReportParams } from "@/modules/reports/presentation/ui/DateRangePicker";
import { SalesChart } from "@/modules/reports/presentation/ui/SalesChart";

export function RevenueChart() {
  const { has } = usePermissions();
  const canReadReports = has("reports:read");
  const sales = useDailySalesQuery(defaultReportParams(), canReadReports);

  if (!canReadReports) return null;

  if (sales.isLoading) {
    return (
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>ລາຍຮັບ 7 ວັນຫຼ້າສຸດ</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[260px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (sales.data && sales.data.length > 0) {
    return (
      <div className="lg:col-span-2">
        <SalesChart
          data={sales.data}
          title="ລາຍຮັບ 7 ວັນຫຼ້າສຸດ"
          description="ແຍກຕາມຊ່ອງທາງຊຳລະ"
        />
      </div>
    );
  }

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>ລາຍຮັບ 7 ວັນຫຼ້າສຸດ</CardTitle>
        <CardDescription>ຍັງບໍ່ມີຂໍ້ມູນການຊຳລະ</CardDescription>
      </CardHeader>
    </Card>
  );
}
