import { useNavigate, useParams } from "@tanstack/react-router";
import { format } from "date-fns";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { Header } from "@/app/layout/Header";
import { Main } from "@/app/layout/Main";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/kit";
import { useActionPermission } from "@/modules/auth/presentation/model/useActionPermission";
import {
  useChannelLogsQuery,
  useChannelsQuery,
  useRetrySyncLog,
} from "../api/queries";

function formatDateTime(value: Date | string | null) {
  if (!value) return "—";
  try {
    return format(new Date(value), "dd/MM/yyyy HH:mm");
  } catch {
    return String(value);
  }
}

function statusVariant(status: string) {
  if (status === "success") return "default" as const;
  if (status === "failed") return "destructive" as const;
  return "secondary" as const;
}

export function ChannelLogsPage() {
  const nav = useNavigate({ from: "/app/channels/$id/logs" });
  const { id } = useParams({ from: "/app/channels/$id/logs" });
  const canSync = useActionPermission(["channels:sync"]);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "success" | "failed" | "partial"
  >("all");
  const channels = useChannelsQuery();
  const logs = useChannelLogsQuery(id, {
    limit: 20,
    offset: 0,
    status: statusFilter === "all" ? undefined : statusFilter,
  });
  const retryLog = useRetrySyncLog(id);

  const channel = useMemo(
    () => channels.data?.find((row) => row.id === id) ?? null,
    [channels.data, id],
  );

  return (
    <>
      <Header />
      <Main>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <Button
            variant="outline"
            onClick={() => nav({ to: "/app/channels/$id", params: { id } })}
          >
            <ArrowLeft data-icon="inline-start" />
            ກັບ channel
          </Button>
          <Select
            value={statusFilter}
            onValueChange={(value) =>
              setStatusFilter(value as "all" | "success" | "failed" | "partial")
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">ທັງໝົດ</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sync Logs · {channel?.name ?? "Channel"}</CardTitle>
            <CardDescription>
              push/pull history สำหรับ channel นี้ · retry ได้เฉพาะ failed logs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ເວລາ</TableHead>
                  <TableHead>Direction</TableHead>
                  <TableHead>Operation</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Summary</TableHead>
                  <TableHead className="w-[120px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.data?.data.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{formatDateTime(log.createdAt)}</TableCell>
                    <TableCell>{log.direction}</TableCell>
                    <TableCell>{log.operation}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(log.status)}>
                        {log.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[320px] truncate">
                      {log.errorMessage ??
                        JSON.stringify(log.requestSummary ?? {})}
                    </TableCell>
                    <TableCell>
                      {log.status === "failed" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={!canSync || retryLog.isPending}
                          onClick={() => retryLog.mutate(log.id)}
                        >
                          <RotateCcw data-icon="inline-start" />
                          Retry
                        </Button>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {!logs.data?.data.length ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-8 text-center text-muted-foreground"
                    >
                      ຍັງບໍ່ມີ sync log
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Main>
    </>
  );
}
