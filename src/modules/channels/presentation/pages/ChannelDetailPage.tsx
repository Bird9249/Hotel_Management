import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { format } from "date-fns";
import { ArrowLeft, History, RefreshCw, Webhook } from "lucide-react";
import { useMemo } from "react";
import { Header } from "@/app/layout/Header";
import { Main } from "@/app/layout/Main";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
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
import { useDevLoginEnabled } from "@/modules/auth/presentation/api/useDevLoginEnabled";
import { useActionPermission } from "@/modules/auth/presentation/model/useActionPermission";
import {
  useChannelMappingsQuery,
  useChannelsQuery,
  useSyncChannel,
  useTestChannelWebhook,
} from "../api/queries";

function formatDateTime(value: Date | string | null) {
  if (!value) return "—";
  try {
    return format(new Date(value), "dd/MM/yyyy HH:mm");
  } catch {
    return String(value);
  }
}

function getConsecutiveFailures(config: unknown) {
  if (!config || typeof config !== "object") return 0;
  return Number(
    (config as { consecutiveFailures?: number }).consecutiveFailures ?? 0,
  );
}

export function ChannelDetailPage() {
  const nav = useNavigate({ from: "/app/channels/$id" });
  const { id } = useParams({ from: "/app/channels/$id" });
  const canSync = useActionPermission(["channels:sync"]);
  const devToolsEnabled = useDevLoginEnabled();
  const channels = useChannelsQuery();
  const mappings = useChannelMappingsQuery(id);
  const syncChannel = useSyncChannel(id);
  const testWebhook = useTestChannelWebhook(id);

  const channel = useMemo(
    () => channels.data?.find((row) => row.id === id) ?? null,
    [channels.data, id],
  );
  const failures = getConsecutiveFailures(channel?.config);

  return (
    <>
      <Header />
      <Main>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <Button
            variant="outline"
            onClick={() => nav({ to: "/app/channels" })}
          >
            <ArrowLeft data-icon="inline-start" />
            ກັບຄືນ
          </Button>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link to="/app/channels/$id/logs" params={{ id }}>
                <History data-icon="inline-start" />
                Sync logs
              </Link>
            </Button>
            {devToolsEnabled.data ? (
              <Button
                disabled={
                  !canSync ||
                  !channel?.isActive ||
                  !mappings.data?.length ||
                  testWebhook.isPending
                }
                variant="secondary"
                onClick={() => testWebhook.mutate()}
              >
                <Webhook data-icon="inline-start" />
                Test webhook
              </Button>
            ) : null}
            <Button
              disabled={!canSync || !channel?.isActive || syncChannel.isPending}
              onClick={() => syncChannel.mutate({})}
            >
              <RefreshCw data-icon="inline-start" />
              Sync now
            </Button>
          </div>
        </div>

        {failures >= 3 ? (
          <Alert className="mb-4" variant="destructive">
            <AlertTitle>Sync failed ຕิดต่อกัน {failures} ຄັ້ງ</AlertTitle>
            <AlertDescription>
              ກະລຸນາກວດ mapping/credentials ແລະ retry จาก sync logs.
            </AlertDescription>
          </Alert>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <Card>
            <CardHeader>
              <CardTitle>{channel?.name ?? "Channel"}</CardTitle>
              <CardDescription>
                ລາຍລະອຽດ channel ແລະ sync status.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Code</span>
                <span className="font-medium">{channel?.code ?? "—"}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">ສະຖານະ</span>
                <Badge variant={channel?.isActive ? "default" : "outline"}>
                  {channel?.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Last sync</span>
                <span>{formatDateTime(channel?.lastSyncAt ?? null)}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Webhook</span>
                <code className="rounded bg-muted px-2 py-1 text-xs">
                  /api/webhooks/channels/{channel?.code ?? ":code"}
                </code>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Room Type Mapping</CardTitle>
              <CardDescription>
                external room type ที่เชื่อมกับ inventory ภายใน.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Room type</TableHead>
                    <TableHead>External ID</TableHead>
                    <TableHead>Allotment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mappings.data?.map((mapping) => (
                    <TableRow key={mapping.id}>
                      <TableCell>{mapping.roomTypeName}</TableCell>
                      <TableCell>{mapping.externalRoomTypeId}</TableCell>
                      <TableCell>{mapping.allotment ?? "ທັງໝົດ"}</TableCell>
                    </TableRow>
                  ))}
                  {!mappings.data?.length ? (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="py-8 text-center text-muted-foreground"
                      >
                        ຍັງບໍ່ມີ mapping
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </Main>
    </>
  );
}
