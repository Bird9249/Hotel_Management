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
import { formatMoney } from "@/modules/billing/presentation/ui/invoice-status";
import type {
  BookingsBySourceResult,
  RevenueBySourceResult,
} from "@/modules/reports/domain/types";
import {
  buildSourceChartConfig,
  collectSourceKeys,
} from "../lib/source-report";

type SourceChartProps<T extends BookingsBySourceResult> = {
  data: T;
  channels: Array<{ id: string; name: string }>;
  title?: string;
  description?: string;
};

export function BookingsBySourceChart({
  data,
  channels,
  title = "ການຈອງຕາມຊ່ອງທາງ",
  description,
}: SourceChartProps<BookingsBySourceResult>) {
  const sourceKeys = collectSourceKeys(data);
  const chartConfig = buildSourceChartConfig(sourceKeys, channels);

  const chartData = data.map((row) => {
    const point: Record<string, string | number> = {
      day: format(parseISO(row.day), "dd/MM"),
      total: row.grandTotal,
    };
    for (const key of sourceKeys) {
      point[key] = row.totalsBySource[key] ?? 0;
    }
    return point;
  });

  return (
    <SourceStackedBarChart
      chartConfig={chartConfig}
      chartData={chartData}
      sourceKeys={sourceKeys}
      title={title}
      description={description}
      valueFormatter={(value) => String(value)}
    />
  );
}

export function RevenueBySourceChart({
  data,
  channels,
  title = "ລາຍຮັບຕາມຊ່ອງທາງ",
  description,
}: SourceChartProps<RevenueBySourceResult>) {
  const sourceKeys = collectSourceKeys(data);
  const chartConfig = buildSourceChartConfig(sourceKeys, channels);

  const chartData = data.map((row) => {
    const point: Record<string, string | number> = {
      day: format(parseISO(row.day), "dd/MM"),
      total: row.grandTotal,
    };
    for (const key of sourceKeys) {
      point[key] = row.totalsBySource[key] ?? 0;
    }
    return point;
  });

  return (
    <SourceStackedBarChart
      chartConfig={chartConfig}
      chartData={chartData}
      sourceKeys={sourceKeys}
      title={title}
      description={description}
      valueFormatter={(value) => `${formatMoney(Number(value))} ₭`}
    />
  );
}

type SourceStackedBarChartProps = {
  chartConfig: ChartConfig;
  chartData: Record<string, string | number>[];
  sourceKeys: string[];
  title: string;
  description?: string;
  valueFormatter: (value: number) => string;
};

function SourceStackedBarChart({
  chartConfig,
  chartData,
  sourceKeys,
  title,
  description,
  valueFormatter,
}: SourceStackedBarChartProps) {
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
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => {
                    const sourceKey = String(name ?? "");
                    const label =
                      chartConfig[sourceKey]?.label ?? sourceKey;
                    return (
                      <div className="flex w-full min-w-32 items-center justify-between gap-4">
                        <span className="text-muted-foreground">{label}</span>
                        <span className="font-mono font-medium tabular-nums">
                          {valueFormatter(Number(value))}
                        </span>
                      </div>
                    );
                  }}
                />
              }
            />
            <ChartLegend content={<ChartLegendContent />} />
            {sourceKeys.map((key) => (
              <Bar
                key={key}
                dataKey={key}
                stackId="source"
                fill={`var(--color-${key})`}
                radius={[0, 0, 0, 0]}
              />
            ))}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
