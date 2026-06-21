import { useNavigate, useParams } from "@tanstack/react-router";
import { parseISO } from "date-fns";
import { ArrowLeftIcon } from "lucide-react";
import { Header } from "@/app/layout/Header";
import { Main } from "@/app/layout/Main";
import { Button } from "@/components/kit";
import { QueryState } from "@/shared/ui/QueryState";
import { useReservationQuery, useUpdateReservation } from "../api/queries";
import { ReservationForm } from "../ui/ReservationForm";
import { toReservationSourceKey } from "../ui/reservation-sources";

export function ReservationEditPage() {
  const nav = useNavigate({ from: "/app/reservations/$id/edit" });
  const { id } = useParams({ from: "/app/reservations/$id/edit" });
  const { data, ...result } = useReservationQuery(id);
  const updateReservation = useUpdateReservation(id);

  return (
    <>
      <Header />
      <Main>
        <div className="flex flex-wrap items-center justify-between space-y-2">
          <div>
            <h2 className="font-bold text-2xl tracking-tight">ແກ້ໄຂການຈອງ</h2>
            <p className="text-muted-foreground">ປັບປຸງລາຍລະອຽດການຈອງ.</p>
          </div>
          <Button
            variant="outline"
            onClick={() => nav({ to: "/app/reservations" })}
          >
            <ArrowLeftIcon className="size-4" />
            ກັບຄືນ
          </Button>
        </div>

        <QueryState
          result={result}
          title="ກໍາລັງໂຫຼດການຈອງ"
          description="ກໍາລັງດຶງລາຍລະອຽດ"
          variant="fullscreen"
        >
          {!data ? null : (
            <div className="mx-auto mt-6 max-w-3xl rounded-xl border bg-card p-6 shadow-sm sm:p-8">
              <ReservationForm
                initialValues={{
                  guestId: data.guestId,
                  roomId: data.roomId,
                  sourceKey: toReservationSourceKey(data.source, data.channelId),
                  guestsCount: data.guestsCount,
                  dateRange: {
                    from: parseISO(data.checkInDate),
                    to: parseISO(data.checkOutDate),
                  },
                }}
                onSubmit={async (vals) => {
                  await updateReservation.mutateAsync(vals);
                  nav({ to: "/app/reservations" });
                }}
                submitting={updateReservation.isPending}
              />
            </div>
          )}
        </QueryState>
      </Main>
    </>
  );
}
