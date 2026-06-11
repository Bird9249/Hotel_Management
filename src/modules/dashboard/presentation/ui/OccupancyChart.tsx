import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  Skeleton,
} from "@/components/kit";
import { usePermissions } from "@/modules/auth/presentation/model/usePermissions";
import { useOccupancyQuery } from "@/modules/reports/presentation/api/queries";
import { defaultReportParams } from "@/modules/reports/presentation/ui/DateRangePicker";
import { OccupancyChart as ReportOccupancyChart } from "@/modules/reports/presentation/ui/OccupancyChart";
import { occupancyData } from "../data/mock";

const chartConfig = {
  occupied: { label: "ເຂົ້າພັກ (%)", color: "var(--chart-1)" },
  available: { label: "ຫວ່າງ (%)", color: "var(--chart-3)" },
} satisfies ChartConfig;

export function OccupancyChart() {
  const { has } = usePermissions();
  const canReadReports = has("reports:read");
  const occupancy = useOccupancyQuery(defaultReportParams());

  if (canReadReports) {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>ອັດຕາການເຂົ້າພັກ</CardTitle>
        <CardDescription>ລາຍອາທິດນີ້ (ຕົວຢ່າງ)</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[260px] w-full">
          <BarChart data={occupancyData} margin={{ top: 8 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="occupied"
              stackId="a"
              fill="var(--color-occupied)"
              radius={[0, 0, 4, 4]}
            />
            <Bar
              dataKey="available"
              stackId="a"
              fill="var(--color-available)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
