import { format, parseISO } from "date-fns";
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
} from "@/components/kit";
import { PAYMENT_METHOD_OPTIONS } from "@/modules/billing/presentation/ui/invoice-status";
import type { DailySalesResult } from "@/modules/reports/domain/types";

const chartConfig = {
  cash: { label: "ເງິນສົດ", color: "var(--chart-1)" },
  bank_transfer: { label: "ໂອນເງິນ", color: "var(--chart-2)" },
  credit_card: { label: "ບັດເຄຣດິດ", color: "var(--chart-3)" },
  total: { label: "ລວມ", color: "var(--chart-4)" },
} satisfies ChartConfig;

type SalesChartProps = {
  data: DailySalesResult;
  title?: string;
  description?: string;
};

export function SalesChart({
  data,
  title = "ລາຍຮັບປະຈຳວັນ",
  description,
}: SalesChartProps) {
  const chartData = data.map((row) => {
    const point: Record<string, string | number> = {
      day: format(parseISO(row.day), "dd/MM"),
      total: row.grandTotal,
    };
    for (const method of PAYMENT_METHOD_OPTIONS) {
      point[method.value] = row.totalsByMethod[method.value] ?? 0;
    }
    return point;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart data={chartData} margin={{ top: 8, left: 8, right: 8 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            {PAYMENT_METHOD_OPTIONS.map((method) => (
              <Bar
                key={method.value}
                dataKey={method.value}
                stackId="sales"
                fill={`var(--color-${method.value})`}
                radius={[0, 0, 0, 0]}
              />
            ))}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
