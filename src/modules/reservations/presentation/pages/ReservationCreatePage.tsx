import { useNavigate, useSearch } from "@tanstack/react-router";
import { parseISO } from "date-fns";
import { ArrowLeftIcon } from "lucide-react";
import { Header } from "@/app/layout/Header";
import { Main } from "@/app/layout/Main";
import { Button } from "@/components/kit";
import { useCreateReservation } from "../api/queries";
import { ReservationForm } from "../ui/ReservationForm";

export function ReservationCreatePage() {
  const nav = useNavigate({ from: "/app/reservations/create" });
  const search = useSearch({ from: "/app/reservations/create" }) as {
    roomId?: string;
    checkInDate?: string;
    checkOutDate?: string;
  };
  const createReservation = useCreateReservation();

  const initialValues =
    search.roomId || search.checkInDate || search.checkOutDate
      ? {
          roomId: search.roomId ?? "",
          dateRange: {
            from: search.checkInDate ? parseISO(search.checkInDate) : undefined,
            to: search.checkOutDate ? parseISO(search.checkOutDate) : undefined,
          },
        }
      : undefined;

  return (
    <>
      <Header />
      <Main>
        <div className="flex flex-wrap items-center justify-between space-y-2">
          <div>
            <h2 className="font-bold text-2xl tracking-tight">ສ້າງການຈອງ</h2>
            <p className="text-muted-foreground">ຈອງຫ້ອງພັກໃໝ່.</p>
          </div>
          <Button
            variant="outline"
            onClick={() => nav({ to: "/app/reservations" })}
          >
            <ArrowLeftIcon className="size-4" />
            ກັບຄືນ
          </Button>
        </div>

        <div className="mx-auto mt-6 max-w-3xl rounded-xl border bg-card p-6 shadow-sm sm:p-8">
          <ReservationForm
            initialValues={initialValues}
            onSubmit={async (vals) => {
              await createReservation.mutateAsync(vals);
              nav({ to: "/app/reservations" });
            }}
            submitting={createReservation.isPending}
          />
        </div>
      </Main>
    </>
  );
}
