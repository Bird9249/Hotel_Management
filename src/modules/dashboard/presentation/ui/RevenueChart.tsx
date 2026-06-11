import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  Skeleton,
} from "@/components/kit";
import { usePermissions } from "@/modules/auth/presentation/model/usePermissions";
import { useDailySalesQuery } from "@/modules/reports/presentation/api/queries";
import { defaultReportParams } from "@/modules/reports/presentation/ui/DateRangePicker";
import { SalesChart } from "@/modules/reports/presentation/ui/SalesChart";
import { revenueData } from "../data/mock";

const chartConfig = {
  revenue: { label: "ລາຍຮັບ (ລ້ານກີບ)", color: "var(--chart-1)" },
  bookings: { label: "ການຈອງ", color: "var(--chart-2)" },
} satisfies ChartConfig;

export function RevenueChart() {
  const { has } = usePermissions();
  const canReadReports = has("reports:read");
  const sales = useDailySalesQuery(defaultReportParams());

  if (canReadReports) {
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

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>ພາບລວມລາຍຮັບ</CardTitle>
        <CardDescription>6 ເດືອນຫຼ້າສຸດ (ຕົວຢ່າງ)</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[260px] w-full">
          <AreaChart data={revenueData} margin={{ left: 8, right: 8, top: 8 }}>
            <defs>
              <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-revenue)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-revenue)"
                  stopOpacity={0.05}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Area
              dataKey="revenue"
              type="natural"
              fill="url(#fillRevenue)"
              stroke="var(--color-revenue)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
