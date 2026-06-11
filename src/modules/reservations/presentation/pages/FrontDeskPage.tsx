import { useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import { ConciergeBell, LogIn, LogOut } from "lucide-react";
import { useState } from "react";
import { Header } from "@/app/layout/Header";
import { Main } from "@/app/layout/Main";
import {
  Badge,
  Button,
  Card,
  CardContent,
  confirm,
  toast,
} from "@/components/kit";
import { useActionPermission } from "@/modules/auth/presentation/model/useActionPermission";
import type { FilterConditionDTO } from "@/shared/contracts/base";
import type { ReservationDTO } from "../api/client";
import { useCheckIn, useCheckOut, useReservationsQuery } from "../api/queries";
import { FrontDeskReservationList } from "../ui/FrontDeskReservationList";
import { offerDeskBillAction } from "../ui/offerDeskBillAction";

type DeskTab = "arrivals" | "departures";

function todayIso() {
  return format(new Date(), "yyyy-MM-dd");
}

function buildTodayFilters(tab: DeskTab, today: string): FilterConditionDTO[] {
  if (tab === "arrivals") {
    return [
      { field: "checkInDate", op: "eq", value: today },
      { field: "status", op: "eq", value: "booked" },
    ];
  }
  return [
    { field: "checkOutDate", op: "eq", value: today },
    { field: "status", op: "eq", value: "checked_in" },
  ];
}

export function FrontDeskPage() {
  const nav = useNavigate();
  const today = todayIso();
  const [tab, setTab] = useState<DeskTab>("arrivals");
  const checkIn = useCheckIn();
  const checkOut = useCheckOut();
  const canCheckIn = useActionPermission(["reservations:checkin"]);
  const canCheckOut = useActionPermission(["reservations:checkout"]);
  const canInvoice = useActionPermission(["billing:invoice"]);

  const arrivals = useReservationsQuery({
    limit: 100,
    offset: 0,
    filters: buildTodayFilters("arrivals", today),
    sort: [{ field: "roomNumber", dir: "asc" }],
  });

  const departures = useReservationsQuery({
    limit: 100,
    offset: 0,
    filters: buildTodayFilters("departures", today),
    sort: [{ field: "roomNumber", dir: "asc" }],
  });

  const handleCheckIn = async (reservation: ReservationDTO) => {
    const ok = await confirm({
      title: "ເຊັກອິນ",
      description: `ຢືນຢັນເຊັກອິນ ${reservation.guestName} ຫ້ອງ ${reservation.roomNumber}?`,
      actionText: "ເຊັກອິນ",
    });
    if (!ok) return;

    try {
      await toast.promise(checkIn.run(reservation.id), {
        loading: "ກໍາລັງເຊັກອິນ...",
        success: "ເຊັກອິນສໍາເລັດ",
        error: "ເຊັກອິນລົ້ມເຫຼວ",
      });

      await offerDeskBillAction({
        reservationId: reservation.id,
        guestName: reservation.guestName,
        roomNumber: reservation.roomNumber,
        kind: "check-in",
        canInvoice: !!canInvoice,
        navigate: nav,
      });
    } catch {
      // errors handled by toast / fetcher
    }
  };

  const handleCheckOut = async (reservation: ReservationDTO) => {
    const ok = await confirm({
      title: "ເຊັກເອົາ",
      description: `ຢືນຢັນເຊັກເອົາ ${reservation.guestName} ຫ້ອງ ${reservation.roomNumber}?`,
      actionText: "ເຊັກເອົາ",
    });
    if (!ok) return;

    try {
      await toast.promise(checkOut.run(reservation.id), {
        loading: "ກໍາລັງເຊັກເອົາ...",
        success: "ເຊັກເອົາສໍາເລັດ",
        error: "ເຊັກເອົາລົ້ມເຫຼວ",
      });

      await offerDeskBillAction({
        reservationId: reservation.id,
        guestName: reservation.guestName,
        roomNumber: reservation.roomNumber,
        kind: "check-out",
        canInvoice: !!canInvoice,
        navigate: nav,
      });
    } catch {
      // errors handled by toast / fetcher
    }
  };

  const arrivalCount = arrivals.data?.meta?.total ?? 0;
  const departureCount = departures.data?.meta?.total ?? 0;

  return (
    <>
      <Header />
      <Main>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="flex items-center gap-2 font-bold text-2xl tracking-tight">
              <ConciergeBell className="size-7 text-primary" />
              ໜ້າຮັບແຂກ
            </h2>
            <p className="text-muted-foreground">
              ຈັດການແຂກມາຮອດ ແລະ ອອກວັນນີ້ — {format(new Date(), "dd/MM/yyyy")}
            </p>
          </div>
        </div>

        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <Card
            className={
              tab === "arrivals"
                ? "border-emerald-500/40 ring-1 ring-emerald-500/20"
                : undefined
            }
          >
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-muted-foreground text-xs">ມາຮອດວັນນີ້</p>
                <p className="font-bold text-2xl tabular-nums">
                  {arrivalCount}
                </p>
              </div>
              <LogIn className="size-5 text-emerald-600" />
            </CardContent>
          </Card>
          <Card
            className={
              tab === "departures"
                ? "border-amber-500/40 ring-1 ring-amber-500/20"
                : undefined
            }
          >
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-muted-foreground text-xs">ອອກວັນນີ້</p>
                <p className="font-bold text-2xl tabular-nums">
                  {departureCount}
                </p>
              </div>
              <LogOut className="size-5 text-amber-600" />
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col rounded-xl border bg-card">
          <div className="flex flex-wrap items-center gap-2 border-b px-4 py-3">
            <Button
              size="sm"
              variant={tab === "arrivals" ? "default" : "outline"}
              onClick={() => setTab("arrivals")}
            >
              <LogIn className="size-4" />
              ມາຮອດ
              <Badge variant="secondary" className="ml-1 font-normal">
                {arrivalCount}
              </Badge>
            </Button>
            <Button
              size="sm"
              variant={tab === "departures" ? "default" : "outline"}
              onClick={() => setTab("departures")}
            >
              <LogOut className="size-4" />
              ອອກ
              <Badge variant="secondary" className="ml-1 font-normal">
                {departureCount}
              </Badge>
            </Button>
          </div>

          {tab === "arrivals" ? (
            <FrontDeskReservationList
              variant="arrival"
              isLoading={arrivals.isLoading}
              data={arrivals.data?.data ?? []}
              canCheckIn={!!canCheckIn}
              onCheckIn={handleCheckIn}
            />
          ) : (
            <FrontDeskReservationList
              variant="departure"
              isLoading={departures.isLoading}
              data={departures.data?.data ?? []}
              canCheckOut={!!canCheckOut}
              onCheckOut={handleCheckOut}
            />
          )}
        </div>
      </Main>
    </>
  );
}
