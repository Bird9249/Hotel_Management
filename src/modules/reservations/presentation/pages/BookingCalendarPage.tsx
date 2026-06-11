import { useNavigate } from "@tanstack/react-router";
import { ArrowLeftIcon } from "lucide-react";
import { useState } from "react";
import { Header } from "@/app/layout/Header";
import { Main } from "@/app/layout/Main";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/kit";
import { useActionPermission } from "@/modules/auth/presentation/model/useActionPermission";
import { DialogScrollBody } from "@/shared/ui/DialogScrollBody";
import { useCreateReservation } from "../api/queries";
import { BookingCalendar } from "../ui/BookingCalendar";
import { ReservationForm } from "../ui/ReservationForm";

type Prefill = {
  roomId: string;
  roomNumber: string;
  checkInDate: string;
  checkOutDate: string;
};

export function BookingCalendarPage() {
  const nav = useNavigate();
  const canCreate = useActionPermission(["reservations:create"]);
  const createReservation = useCreateReservation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [prefill, setPrefill] = useState<Prefill | null>(null);

  const openBook = (params: Prefill) => {
    setPrefill(params);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setPrefill(null);
  };

  return (
    <>
      <Header />
      <Main>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-bold text-2xl tracking-tight">ປະຕິທິນການຈອງ</h2>
            <p className="text-muted-foreground">
              ເບິ່ງຫ້ອງວ່າງ/ເຕັມແລະສ້າງການຈອງໄດ້ທັນທີ.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => nav({ to: "/app/reservations" })}
          >
            <ArrowLeftIcon className="size-4" />
            ລາຍການຈອງ
          </Button>
        </div>

        <BookingCalendar canCreate={!!canCreate} onBookRoom={openBook} />

        <Dialog open={dialogOpen} onOpenChange={(o) => !o && closeDialog()}>
          <DialogContent className="grid max-h-[min(90vh,720px)] max-w-lg grid-rows-[auto_minmax(0,1fr)] p-0">
            <DialogHeader className="px-6 pt-6">
              <DialogTitle>
                {prefill ? `ຈອງຫ້ອງ ${prefill.roomNumber}` : "ສ້າງການຈອງ"}
              </DialogTitle>
            </DialogHeader>
            <DialogScrollBody>
              <ReservationForm
                initialValues={
                  prefill
                    ? {
                        roomId: prefill.roomId,
                        dateRange: {
                          from: new Date(prefill.checkInDate),
                          to: new Date(prefill.checkOutDate),
                        },
                      }
                    : undefined
                }
                onSubmit={async (vals) => {
                  await createReservation.mutateAsync(vals);
                  closeDialog();
                }}
                submitting={createReservation.isPending}
              />
            </DialogScrollBody>
          </DialogContent>
        </Dialog>
      </Main>
    </>
  );
}
