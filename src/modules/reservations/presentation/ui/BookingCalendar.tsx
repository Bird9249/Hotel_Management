import type { DateRange } from "@/components/date-picker";
import { DatePicker } from "@/components/date-picker";
import {
  Badge,
  Button,
  Card,
  CardContent,
  Skeleton,
  cn,
} from "@/components/kit";
import { ReservationSourceBadge } from "@/modules/channels/presentation/ui/ReservationSourceBadge";
import { useHousekeepingEvents } from "@/modules/housekeeping/presentation/api/events";
import type { RoomAvailabilityItem } from "@/modules/reservations/domain/types";
import { SimpleSelect } from "@/shared/ui/SimpleSelect";
import { addDays, differenceInCalendarDays, format, parseISO } from "date-fns";
import {
  BedDouble,
  Brush,
  CalendarDays,
  CalendarRange,
  CheckCircle2,
  Layers,
  Plus,
  UserRound,
  Wrench,
  XCircle,
} from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { useAvailabilityQuery } from "../api/queries";

type BookingCalendarProps = {
  canCreate: boolean;
  onBookRoom: (params: {
    roomId: string;
    roomNumber: string;
    checkInDate: string;
    checkOutDate: string;
  }) => void;
};

type AvailabilityFilter = "all" | "available" | "occupied";

const DATE_PRESETS = [
  { label: "3 ວັນ", days: 3 },
  { label: "7 ວັນ", days: 7 },
  { label: "14 ວັນ", days: 14 },
  { label: "30 ວັນ", days: 30 },
] as const;

function toIsoDate(d: Date) {
  return format(d, "yyyy-MM-dd");
}

function formatDisplayDate(iso: string) {
  try {
    return format(parseISO(iso), "dd/MM/yyyy");
  } catch {
    return iso;
  }
}

function formatRangeLabel(from: string, to: string) {
  const nights = differenceInCalendarDays(parseISO(to), parseISO(from));
  return `${formatDisplayDate(from)} – ${formatDisplayDate(to)} (${nights} ຄືນ)`;
}

function groupByFloor(rooms: RoomAvailabilityItem[]) {
  const map = new Map<string, RoomAvailabilityItem[]>();
  for (const room of rooms) {
    const key = room.floor != null ? String(room.floor) : "unknown";
    const list = map.get(key) ?? [];
    list.push(room);
    map.set(key, list);
  }

  return [...map.entries()].sort(([a], [b]) => {
    if (a === "unknown") return 1;
    if (b === "unknown") return -1;
    return Number(a) - Number(b);
  });
}

export function BookingCalendar({
  canCreate,
  onBookRoom,
}: BookingCalendarProps) {
  const today = new Date();
  const [range, setRange] = useState<DateRange | undefined>({
    from: today,
    to: addDays(today, 7),
  });
  const [filter, setFilter] = useState<AvailabilityFilter>("all");
  const [floorFilter, setFloorFilter] = useState<string>("all");

  const from = range?.from ? toIsoDate(range.from) : "";
  const to = range?.to ? toIsoDate(range.to) : "";
  const rangeReady = Boolean(from && to && to > from);

  const availability = useAvailabilityQuery(rangeReady ? { from, to } : null);
  useHousekeepingEvents(rangeReady);

  const allRooms: RoomAvailabilityItem[] = availability.data?.rooms ?? [];

  const floors = useMemo(() => {
    const set = new Set<string>();
    for (const r of allRooms) {
      if (r.floor != null) set.add(String(r.floor));
    }
    return [...set].sort((a, b) => Number(a) - Number(b));
  }, [allRooms]);

  const filteredRooms = useMemo(() => {
    return allRooms.filter((room) => {
      if (filter === "available" && !room.available) return false;
      if (filter === "occupied" && room.available) return false;
      if (floorFilter !== "all" && String(room.floor) !== floorFilter) {
        return false;
      }
      return true;
    });
  }, [allRooms, filter, floorFilter]);

  const stats = useMemo(() => {
    const available = allRooms.filter((r) => r.available).length;
    const cleaning = allRooms.filter((r) => r.roomStatus === "cleaning").length;
    return {
      total: allRooms.length,
      available,
      cleaning,
      occupied: allRooms.length - available - cleaning,
    };
  }, [allRooms]);

  const grouped = useMemo(() => groupByFloor(filteredRooms), [filteredRooms]);

  const applyPreset = (days: number) => {
    setRange({ from: today, to: addDays(today, days) });
  };

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid gap-3 sm:grid-cols-4">
        <StatCard
          label="ຫ້ອງທັງໝົດ"
          value={stats.total}
          icon={<BedDouble className="size-4" />}
          className="border-border"
        />
        <StatCard
          label="ວ່າງ"
          value={stats.available}
          icon={<CheckCircle2 className="size-4 text-emerald-600" />}
          className="border-emerald-500/30 bg-emerald-500/5"
          valueClassName="text-emerald-700 dark:text-emerald-400"
        />
        <StatCard
          label="ກຳລັງອານາໄມ"
          value={stats.cleaning}
          icon={<Brush className="size-4 text-amber-600" />}
          className="border-amber-500/30 bg-amber-500/5"
          valueClassName="text-amber-700 dark:text-amber-400"
        />
        <StatCard
          label="ບໍ່ວ່າງ"
          value={stats.occupied}
          icon={<XCircle className="size-4 text-rose-600" />}
          className="border-rose-500/30 bg-rose-500/5"
          valueClassName="text-rose-700 dark:text-rose-400"
        />
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="space-y-4 p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-medium">
                <CalendarRange className="size-4 text-muted-foreground" />
                ຊ່ວງວັນທີເຂົ້າພັກ
              </div>
              {rangeReady ? (
                <p className="text-muted-foreground text-sm">
                  {formatRangeLabel(from, to)}
                </p>
              ) : (
                <p className="text-muted-foreground text-sm">
                  ກະລຸນາເລືອກວັນເຂົ້າ ແລະ ວັນອອກ
                </p>
              )}
            </div>
            <DatePicker
              mode="range"
              value={range}
              onChange={setRange}
              className="w-full sm:w-auto"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {DATE_PRESETS.map((preset) => (
              <Button
                key={preset.days}
                type="button"
                size="sm"
                variant="outline"
                className="h-8"
                onClick={() => applyPreset(preset.days)}
              >
                {preset.label}
              </Button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t pt-4">
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  { value: "all", label: "ທັງໝົດ" },
                  { value: "available", label: "ວ່າງ" },
                  { value: "occupied", label: "ມີການຈອງ" },
                ] as const
              ).map((opt) => (
                <Button
                  key={opt.value}
                  type="button"
                  size="sm"
                  variant={filter === opt.value ? "default" : "outline"}
                  className="h-8"
                  onClick={() => setFilter(opt.value)}
                >
                  {opt.label}
                </Button>
              ))}
            </div>

            {floors.length > 0 && (
              <SimpleSelect
                value={floorFilter}
                onValueChange={setFloorFilter}
                options={[
                  { value: "all", label: "ທຸກຊັ້ນ" },
                  ...floors.map((f) => ({
                    value: f,
                    label: `ຊັ້ນ ${f}`,
                  })),
                ]}
                className="ml-auto h-8 w-[130px]"
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {availability.isLoading ? (
        <CalendarSkeleton />
      ) : !rangeReady ? (
        <EmptyState
          icon={<CalendarDays className="size-8" />}
          title="ເລືອກຊ່ວງວັນທີ"
          description="ກະລຸນາເລືອກວັນເຂົ້າ ແລະ ວັນອອກເພື່ອເບິ່ງຫ້ອງວ່າງ"
        />
      ) : filteredRooms.length === 0 ? (
        <EmptyState
          icon={<BedDouble className="size-8" />}
          title="ບໍ່ພົບຫ້ອງ"
          description={
            filter !== "all" || floorFilter !== "all"
              ? "ລອງປ່ຽນຕົວກອງ ຫຼື ເລືອກຊ່ວງວັນທີໃໝ່"
              : "ຍັງບໍ່ມີຫ້ອງໃນລະບົບ"
          }
        />
      ) : (
        <div className="space-y-6">
          {grouped.map(([floor, rooms]) => (
            <section key={floor}>
              <div className="mb-3 flex items-center gap-2">
                <Layers className="size-4 text-muted-foreground" />
                <h3 className="font-semibold text-sm">
                  {floor === "unknown" ? "ບໍ່ລະບຸຊັ້ນ" : `ຊັ້ນ ${floor}`}
                </h3>
                <Badge variant="secondary" className="font-normal">
                  {rooms.length} ຫ້ອງ
                </Badge>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {rooms.map((room) => (
                  <RoomAvailabilityCard
                    key={room.roomId}
                    room={room}
                    canCreate={canCreate}
                    from={from}
                    to={to}
                    onBook={onBookRoom}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Legend */}
      {rangeReady && !availability.isLoading && allRooms.length > 0 && (
        <div className="flex flex-wrap items-center gap-4 rounded-lg border bg-muted/30 px-4 py-3 text-muted-foreground text-xs">
          <span className="font-medium text-foreground">ຄຳອະທິບາຍ:</span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-emerald-500" />
            ວ່າງ — ຈອງໄດ້
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-rose-500" />
            ບໍ່ວ່າງ — ມີການຈອງ ຫຼື ປິດໃຊ້ງານ
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-amber-500" />
            ກຳລັງອານາໄມ — ລໍຖ້າແມ່ບ້ານຢືນຢັນພ້ອມໃຊ້
          </span>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  className,
  valueClassName,
}: {
  label: string;
  value: number;
  icon: ReactNode;
  className?: string;
  valueClassName?: string;
}) {
  return (
    <Card className={cn("py-0", className)}>
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <p className="text-muted-foreground text-xs">{label}</p>
          <p className={cn("font-bold text-2xl tabular-nums", valueClassName)}>
            {value}
          </p>
        </div>
        <div className="flex size-9 items-center justify-center rounded-lg bg-background/80">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}

function RoomAvailabilityCard({
  room,
  canCreate,
  from,
  to,
  onBook,
}: {
  room: RoomAvailabilityItem;
  canCreate: boolean;
  from: string;
  to: string;
  onBook: BookingCalendarProps["onBookRoom"];
}) {
  const available = room.available;
  const visualStatus = getCalendarRoomStatus(room);

  return (
    <Card
      className={cn(
        "overflow-hidden py-0 transition-shadow hover:shadow-md",
        visualStatus.cardClassName,
      )}
    >
      <div className={cn("h-1", visualStatus.barClassName)} />
      <CardContent className="space-y-3 pb-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-xl",
                visualStatus.iconClassName,
              )}
            >
              <visualStatus.Icon className="size-5" />
            </div>
            <div>
              <p className="font-semibold text-lg leading-none">
                ຫ້ອງ {room.roomNumber}
              </p>
              <p className="mt-1 text-muted-foreground text-xs">
                {room.roomTypeName ?? "ບໍ່ລະບຸປະເພດ"}
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className={cn("shrink-0 font-medium", visualStatus.badgeClassName)}
          >
            {visualStatus.label}
          </Badge>
        </div>

        {!available && room.guestName && (
          <div className="space-y-1.5 rounded-lg border bg-muted/40 px-3 py-2.5 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <UserRound className="size-3.5 shrink-0" />
              <span className="truncate font-medium text-foreground">
                {room.guestName}
              </span>
              <ReservationSourceBadge source={room.source} />
            </div>
            {room.checkInDate && room.checkOutDate && (
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <CalendarDays className="size-3.5 shrink-0" />
                <span>
                  {formatDisplayDate(room.checkInDate)} –{" "}
                  {formatDisplayDate(room.checkOutDate)}
                </span>
              </div>
            )}
          </div>
        )}

        {available && canCreate && from && to && (
          <Button
            size="sm"
            className="w-full"
            onClick={() =>
              onBook({
                roomId: room.roomId,
                roomNumber: room.roomNumber,
                checkInDate: from,
                checkOutDate: to,
              })
            }
          >
            <Plus className="size-4" />
            ຈອງຫ້ອງນີ້
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function getCalendarRoomStatus(room: RoomAvailabilityItem) {
  if (room.available) {
    return {
      label: "ວ່າງ",
      Icon: BedDouble,
      cardClassName: "border-emerald-500/25",
      barClassName: "bg-emerald-500",
      iconClassName: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
      badgeClassName:
        "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    };
  }

  if (room.roomStatus === "cleaning") {
    return {
      label: "ກຳລັງອານາໄມ",
      Icon: Brush,
      cardClassName: "border-amber-500/30 bg-amber-500/5",
      barClassName: "bg-amber-500",
      iconClassName: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
      badgeClassName:
        "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
    };
  }

  if (room.roomStatus === "maintenance") {
    return {
      label: "ປິດປັບປຸງ",
      Icon: Wrench,
      cardClassName: "border-muted-foreground/25 bg-muted/40",
      barClassName: "bg-muted-foreground",
      iconClassName: "bg-muted text-muted-foreground",
      badgeClassName:
        "border-muted-foreground/30 bg-muted text-muted-foreground",
    };
  }

  return {
    label: room.reservationId ? "ມີການຈອງ" : "ບໍ່ວ່າງ",
    Icon: XCircle,
    cardClassName: "border-rose-500/25 bg-rose-500/3",
    barClassName: "bg-rose-500",
    iconClassName: "bg-rose-500/10 text-rose-700 dark:text-rose-400",
    badgeClassName:
      "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-400",
  };
}

function CalendarSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {["a", "b", "c", "d", "e", "f"].map((id) => (
          <Skeleton key={id} className="h-36 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 px-6 py-14 text-center">
      <div className="mb-3 text-muted-foreground">{icon}</div>
      <p className="font-medium">{title}</p>
      <p className="mt-1 max-w-sm text-muted-foreground text-sm">
        {description}
      </p>
    </div>
  );
}
