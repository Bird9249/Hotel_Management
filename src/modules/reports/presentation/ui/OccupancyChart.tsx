import { format, parseISO } from "date-fns";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
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
} from "@/components/kit";
import type { OccupancyResult } from "@/modules/reports/domain/types";

const chartConfig = {
  rate: { label: "ອັດຕາເຂົ້າພັກ (%)", color: "var(--chart-1)" },
} satisfies ChartConfig;

type OccupancyChartProps = {
  data: OccupancyResult;
  title?: string;
  description?: string;
};

export function OccupancyChart({
  data,
  title = "ອັດຕາການເຂົ້າພັກ",
  description,
}: OccupancyChartProps) {
  const chartData = data.map((row) => ({
    day: format(parseISO(row.day), "dd/MM"),
    rate: Math.round(row.rate * 1000) / 10,
    occupiedRooms: row.occupiedRooms,
    totalRooms: row.totalRooms,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <AreaChart data={chartData} margin={{ top: 8, left: 8, right: 8 }}>
            <defs>
              <linearGradient id="fillOccupancy" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-rate)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-rate)"
                  stopOpacity={0.05}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, _name, item) => (
                    <span>
                      {value}% ({item.payload.occupiedRooms}/
                      {item.payload.totalRooms} ຫ້ອງ)
                    </span>
                  )}
                />
              }
            />
            <Area
              dataKey="rate"
              type="monotone"
              fill="url(#fillOccupancy)"
              stroke="var(--color-rate)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
