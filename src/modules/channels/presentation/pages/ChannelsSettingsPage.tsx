import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { ExternalLink, RefreshCw } from "lucide-react";
import { type FormEvent, useEffect, useMemo, useState } from "react";
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
  DatePicker,
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLayout,
  Input,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/kit";
import { useActionPermission } from "@/modules/auth/presentation/model/useActionPermission";
import { useRoomTypesQuery } from "@/modules/rooms/presentation/api/queries";
import {
  useChannelMappingsQuery,
  useChannelsQuery,
  useRoomTypeAvailabilityQuery,
  useUpdateChannel,
  useUpsertChannelMapping,
} from "../api/queries";

function formatDateTime(value: Date | string | null) {
  if (!value) return "—";
  try {
    return format(new Date(value), "dd/MM/yyyy HH:mm");
  } catch {
    return String(value);
  }
}

function toDateInput(date: Date) {
  return format(date, "yyyy-MM-dd");
}

function dateFromInput(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

export function ChannelsSettingsPage() {
  const canManage = useActionPermission(["channels:manage"]);
  const channels = useChannelsQuery();
  const roomTypes = useRoomTypesQuery({ limit: 100, offset: 0 });
  const updateChannel = useUpdateChannel();

  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(
    null,
  );
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState("");
  const [externalRoomTypeId, setExternalRoomTypeId] = useState("");
  const [allotment, setAllotment] = useState("");
  const [from, setFrom] = useState(() => toDateInput(new Date()));
  const [to, setTo] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return toDateInput(d);
  });

  const channelRows = channels.data ?? [];
  const selectedChannel = useMemo(
    () => channelRows.find((row) => row.id === selectedChannelId) ?? null,
    [channelRows, selectedChannelId],
  );
  const mappings = useChannelMappingsQuery(selectedChannelId);
  const upsertMapping = useUpsertChannelMapping(selectedChannelId);
  const availability = useRoomTypeAvailabilityQuery({ from, to });

  useEffect(() => {
    if (!selectedChannelId && channelRows.length > 0) {
      setSelectedChannelId(channelRows[0].id);
    }
  }, [channelRows, selectedChannelId]);

  useEffect(() => {
    const firstRoomTypeId = roomTypes.data?.data[0]?.id;
    if (!selectedRoomTypeId && firstRoomTypeId) {
      setSelectedRoomTypeId(firstRoomTypeId);
    }
  }, [roomTypes.data?.data, selectedRoomTypeId]);

  const handleSubmitMapping = async (event: FormEvent) => {
    event.preventDefault();
    await upsertMapping.mutateAsync({
      roomTypeId: selectedRoomTypeId,
      externalRoomTypeId,
      allotment: allotment ? Number(allotment) : null,
    });
    setExternalRoomTypeId("");
    setAllotment("");
  };

  return (
    <>
      <Header />
      <Main>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-2xl tracking-tight">ຊ່ອງທາງການຂາຍ</h2>
            <p className="text-muted-foreground">
              ຕັ້ງຄ່າ channel, mapping ປະເພດຫ້ອງ ແລະ inventory foundation.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              channels.refetch();
              availability.refetch();
              mappings.refetch();
            }}
          >
            <RefreshCw data-icon="inline-start" />
            ໂຫຼດໃໝ່
          </Button>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <Card>
            <CardHeader>
              <CardTitle>Channel</CardTitle>
              <CardDescription>ສະຖານະ channel ແລະ last sync.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ຊື່</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>ສະຖານະ</TableHead>
                    <TableHead>Last sync</TableHead>
                    <TableHead className="w-[120px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {channelRows.map((channel) => (
                    <TableRow
                      key={channel.id}
                      className="cursor-pointer"
                      data-state={
                        channel.id === selectedChannelId
                          ? "selected"
                          : undefined
                      }
                      onClick={() => setSelectedChannelId(channel.id)}
                    >
                      <TableCell className="font-medium">
                        {channel.name}
                      </TableCell>
                      <TableCell>{channel.code}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={channel.isActive}
                            disabled={!canManage || updateChannel.isPending}
                            onCheckedChange={(checked) =>
                              updateChannel.mutate({
                                id: channel.id,
                                input: { isActive: checked },
                              })
                            }
                          />
                          <Badge
                            variant={channel.isActive ? "default" : "outline"}
                          >
                            {channel.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatDateTime(channel.lastSyncAt)}
                      </TableCell>
                      <TableCell>
                        <Button asChild size="sm" variant="outline">
                          <Link
                            to="/app/channels/$id"
                            params={{ id: channel.id }}
                            onClick={(event) => event.stopPropagation()}
                          >
                            <ExternalLink data-icon="inline-start" />
                            ຈັດການ
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!channelRows.length && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-8 text-center">
                        <Empty>
                          <EmptyHeader>
                            <EmptyTitle>ຍັງບໍ່ມີ channel</EmptyTitle>
                            <EmptyDescription>
                              channel ເລີ່ມຕົ້ນຈະຖືກ seed ໃນ migration.
                            </EmptyDescription>
                          </EmptyHeader>
                        </Empty>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Room Type Mapping</CardTitle>
              <CardDescription>
                ຜູກ room type ໃນລະບົບກັບ external room type id.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <form onSubmit={handleSubmitMapping}>
                <FieldGroup>
                  <FieldLayout>
                    <FieldLabel>Channel</FieldLabel>
                    <Select
                      value={selectedChannelId ?? ""}
                      onValueChange={setSelectedChannelId}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="ເລືອກ channel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {channelRows.map((channel) => (
                            <SelectItem key={channel.id} value={channel.id}>
                              {channel.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FieldLayout>
                  <FieldLayout>
                    <FieldLabel>Room type</FieldLabel>
                    <Select
                      value={selectedRoomTypeId}
                      onValueChange={setSelectedRoomTypeId}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="ເລືອກ room type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {roomTypes.data?.data.map((rt) => (
                            <SelectItem key={rt.id} value={rt.id}>
                              {rt.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FieldLayout>
                  <FieldLayout>
                    <FieldLabel htmlFor="external-room-type-id">
                      External room type id
                    </FieldLabel>
                    <Input
                      id="external-room-type-id"
                      value={externalRoomTypeId}
                      onChange={(e) => setExternalRoomTypeId(e.target.value)}
                      placeholder="OTA-ROOM-TYPE-ID"
                    />
                  </FieldLayout>
                  <FieldLayout>
                    <FieldLabel htmlFor="channel-allotment">
                      Allotment
                    </FieldLabel>
                    <Input
                      id="channel-allotment"
                      type="number"
                      min={1}
                      value={allotment}
                      onChange={(e) => setAllotment(e.target.value)}
                      placeholder="ປ່ອຍວ່າງ = ໃຊ້ຈຳນວນຫ້ອງຈິງ"
                    />
                    <FieldDescription>
                      ປ່ອຍວ່າງເພື່ອໃຊ້ຈຳນວນຫ້ອງຈິງທັງໝົດຂອງ room type.
                    </FieldDescription>
                  </FieldLayout>
                  <Button
                    type="submit"
                    disabled={
                      !canManage ||
                      !selectedChannel ||
                      !selectedRoomTypeId ||
                      !externalRoomTypeId ||
                      upsertMapping.isPending
                    }
                  >
                    ບັນທຶກ mapping
                  </Button>
                </FieldGroup>
              </form>

              <div className="rounded-lg border">
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
                    {!mappings.data?.length && (
                      <TableRow>
                        <TableCell colSpan={3} className="py-8 text-center">
                          <Empty>
                            <EmptyHeader>
                              <EmptyTitle>ຍັງບໍ່ມີ mapping</EmptyTitle>
                              <EmptyDescription>
                                ເລືອກ room type ແລະບັນທຶກ external id ເພື່ອເລີ່ມ
                                mapping.
                              </EmptyDescription>
                            </EmptyHeader>
                          </Empty>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Inventory Snapshot</CardTitle>
            <CardDescription>
              ຈຳນວນຫ້ອງວ່າງຕາມ room type ລວມ reservation ແລະ hold.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <FieldGroup>
              <FieldLayout>
                <FieldLabel>ຊ່ວງວັນທີ</FieldLabel>
                <DatePicker
                  mode="range"
                  value={{
                    from: dateFromInput(from),
                    to: dateFromInput(to),
                  }}
                  onChange={(range) => {
                    if (range?.from) setFrom(toDateInput(range.from));
                    if (range?.to) setTo(toDateInput(range.to));
                  }}
                  placeholder="ເລືອກຊ່ວງວັນທີ"
                  captionLayout="dropdown"
                  fromYear={new Date().getFullYear() - 2}
                  toYear={new Date().getFullYear() + 2}
                  className="w-fit"
                />
                <FieldDescription>
                  ໃຊ້ຊ່ວງວັນທີນີ້ເພື່ອຄຳນວນ inventory snapshot.
                </FieldDescription>
              </FieldLayout>
            </FieldGroup>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room type</TableHead>
                  <TableHead>ລາຄາ</TableHead>
                  <TableHead>ທັງໝົດ</TableHead>
                  <TableHead>ຈອງແລ້ວ</TableHead>
                  <TableHead>Hold</TableHead>
                  <TableHead>ວ່າງ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {availability.data?.roomTypes.map((row) => (
                  <TableRow key={row.roomTypeId}>
                    <TableCell className="font-medium">
                      {row.roomTypeName}
                    </TableCell>
                    <TableCell>
                      {Number(row.basePrice).toLocaleString()}
                    </TableCell>
                    <TableCell>{row.totalRooms}</TableCell>
                    <TableCell>{row.reservedRooms}</TableCell>
                    <TableCell>{row.heldRooms}</TableCell>
                    <TableCell>
                      <Badge
                        variant={row.availableRooms > 0 ? "default" : "outline"}
                      >
                        {row.availableRooms}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Main>
    </>
  );
}
