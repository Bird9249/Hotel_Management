import { format, parseISO } from "date-fns";
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
import type { HkProductivityResult } from "@/modules/reports/domain/types";

type HkProductivityTableProps = {
  data: HkProductivityResult;
  description?: string;
};

function formatMinutes(value: number | null): string {
  if (value == null) return "—";
  return `${value} ນາທີ`;
}

export function HkProductivityTable({
  data,
  description,
}: HkProductivityTableProps) {
  if (data.mode === "daily") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>ຜົນງານແມ່ບ້ານຕາມວັນ</CardTitle>
          {description ? (
            <CardDescription>{description}</CardDescription>
          ) : null}
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ວັນທີ</TableHead>
                <TableHead className="text-right">ຈຳນວນກະ</TableHead>
                <TableHead className="text-right">ຫ້ອງເສັດ</TableHead>
                <TableHead className="text-right">ຫ້ອງຄ້າງ</TableHead>
                <TableHead className="text-right">ເວລາສະເລ່ຍ/ຫ້ອງ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.rows.map((row) => (
                <TableRow key={row.day}>
                  <TableCell className="whitespace-nowrap">
                    {format(parseISO(row.day), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.shiftsClosed}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.roomsCompleted}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.roomsPending}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatMinutes(row.avgMinutesPerRoom)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>ຜົນງານແມ່ບ້ານຕາມກະ</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ເປີດກະ</TableHead>
              <TableHead>ປິດກະ</TableHead>
              <TableHead>ພະນັກງານ</TableHead>
              <TableHead className="text-right">ຫ້ອງເສັດ</TableHead>
              <TableHead className="text-right">ຫ້ອງຄ້າງ</TableHead>
              <TableHead className="text-right">ເວລາສະເລ່ຍ/ຫ້ອງ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.rows.map((row) => (
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
                <TableCell className="text-right tabular-nums">
                  {row.roomsCompleted}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {row.roomsPending}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatMinutes(row.avgMinutesPerRoom)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
