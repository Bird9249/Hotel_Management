import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/kit";
import { ShiftStatusBadge } from "@/modules/billing/presentation/ui/ShiftStatusBadge";
import {
  formatMoney,
  PAYMENT_METHOD_OPTIONS,
} from "@/modules/billing/presentation/ui/invoice-status";
import type { SalesByShiftResult } from "@/modules/reports/domain/types";

type SalesByShiftTableProps = {
  data: SalesByShiftResult;
  description?: string;
};

export function SalesByShiftTable({
  data,
  description,
}: SalesByShiftTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>ຍອດຂາຍຕາມກະ</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ເປີດກະ</TableHead>
              <TableHead>ປິດກະ</TableHead>
              <TableHead>ພະນັກງານ</TableHead>
              {PAYMENT_METHOD_OPTIONS.map((method) => (
                <TableHead key={method.value} className="text-right">
                  {method.label}
                </TableHead>
              ))}
              <TableHead className="text-right">ລວມ</TableHead>
              <TableHead>ສະຖານະ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.shiftId}>
                <TableCell className="whitespace-nowrap text-sm">
                  {format(new Date(row.openedAt), "dd/MM/yyyy HH:mm")}
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm">
                  {row.closedAt
                    ? format(new Date(row.closedAt), "dd/MM/yyyy HH:mm")
                    : "—"}
                </TableCell>
                <TableCell>{row.openedByName}</TableCell>
                {PAYMENT_METHOD_OPTIONS.map((method) => (
                  <TableCell
                    key={method.value}
                    className="text-right tabular-nums"
                  >
                    {formatMoney(row.totalsByMethod[method.value] ?? 0)} ₭
                  </TableCell>
                ))}
                <TableCell className="text-right font-medium tabular-nums">
                  {formatMoney(row.grandTotal)} ₭
                </TableCell>
                <TableCell>
                  <ShiftStatusBadge status={row.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
