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
import { formatMoney } from "@/modules/billing/presentation/ui/invoice-status";
import { ShiftStatusBadge } from "@/modules/billing/presentation/ui/ShiftStatusBadge";
import { ShiftVarianceBadge } from "@/modules/billing/presentation/ui/ShiftVarianceBadge";
import type { ShiftReconciliationResult } from "@/modules/reports/domain/types";

type ShiftReconciliationTableProps = {
  data: ShiftReconciliationResult;
  description?: string;
};

export function ShiftReconciliationTable({
  data,
  description,
}: ShiftReconciliationTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>ລາຍງານກະເງິນສົດ</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ເປີດກະ</TableHead>
              <TableHead>ປິດກະ</TableHead>
              <TableHead>ພະນັກງານ</TableHead>
              <TableHead className="text-right">ຕັ້ງຕົ້ນ</TableHead>
              <TableHead className="text-right">ເງິນສົດ</TableHead>
              <TableHead className="text-right">ໂອນ</TableHead>
              <TableHead className="text-right">ບັດ</TableHead>
              <TableHead className="text-right">ຄາດຫວັງ</TableHead>
              <TableHead className="text-right">ນັບໄດ້</TableHead>
              <TableHead>ຜົນຕ່າງ</TableHead>
              <TableHead>ສະຖານະ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="whitespace-nowrap text-sm">
                  {format(new Date(row.openedAt), "dd/MM/yyyy HH:mm")}
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm">
                  {row.closedAt
                    ? format(new Date(row.closedAt), "dd/MM/yyyy HH:mm")
                    : "—"}
                </TableCell>
                <TableCell>{row.openedByName}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatMoney(row.openingCash)} ₭
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {row.cashReceived != null
                    ? `${formatMoney(row.cashReceived)} ₭`
                    : "—"}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {row.transferReceived != null
                    ? `${formatMoney(row.transferReceived)} ₭`
                    : "—"}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {row.cardReceived != null
                    ? `${formatMoney(row.cardReceived)} ₭`
                    : "—"}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {row.expectedCash != null
                    ? `${formatMoney(row.expectedCash)} ₭`
                    : "—"}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {row.closingCashCounted != null
                    ? `${formatMoney(row.closingCashCounted)} ₭`
                    : "—"}
                </TableCell>
                <TableCell>
                  {row.variance != null ? (
                    <ShiftVarianceBadge variance={row.variance} />
                  ) : (
                    "—"
                  )}
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
