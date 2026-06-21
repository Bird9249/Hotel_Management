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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/kit";
import { formatMoney } from "@/modules/billing/presentation/ui/invoice-status";
import type { DailyCashSummaryResult } from "@/modules/reports/domain/types";

const chartConfig = {
  cashReceived: { label: "ຮັບເງິນສົດ", color: "var(--chart-1)" },
  expectedCash: { label: "ຄາດຫວັງ", color: "var(--chart-2)" },
  closingCashCounted: { label: "ນັບໄດ້", color: "var(--chart-3)" },
} satisfies ChartConfig;

type DailyCashReportProps = {
  data: DailyCashSummaryResult;
  description?: string;
};

export function DailyCashReport({ data, description }: DailyCashReportProps) {
  const chartData = data.map((row) => ({
    day: format(parseISO(row.day), "dd/MM"),
    cashReceived: row.cashReceived,
    expectedCash: row.expectedCash,
    closingCashCounted: row.closingCashCounted,
  }));

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>ຍອດເງິນສົດປະຈຳວັນ</CardTitle>
          {description ? (
            <CardDescription>{description}</CardDescription>
          ) : null}
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
              <Bar
                dataKey="cashReceived"
                fill="var(--color-cashReceived)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="expectedCash"
                fill="var(--color-expectedCash)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="closingCashCounted"
                fill="var(--color-closingCashCounted)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="p-0">
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ວັນທີ</TableHead>
                <TableHead className="text-right">ຈຳນວນກະ</TableHead>
                <TableHead className="text-right">ເງິນຕັ້ງຕົ້ນ</TableHead>
                <TableHead className="text-right">ຮັບເງິນສົດ</TableHead>
                <TableHead className="text-right">ຄາດຫວັງ</TableHead>
                <TableHead className="text-right">ນັບໄດ້</TableHead>
                <TableHead className="text-right">ຜົນຕ່າງລວມ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.day}>
                  <TableCell className="whitespace-nowrap">
                    {format(parseISO(row.day), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.shiftCount}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatMoney(row.openingCash)} ₭
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatMoney(row.cashReceived)} ₭
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatMoney(row.expectedCash)} ₭
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatMoney(row.closingCashCounted)} ₭
                  </TableCell>
                  <TableCell
                    className={`text-right tabular-nums ${row.totalVariance !== 0 ? "font-medium text-destructive" : ""}`}
                  >
                    {row.totalVariance === 0
                      ? "ກົງກັນ"
                      : `${formatMoney(row.totalVariance)} ₭`}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
