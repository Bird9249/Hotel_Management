import { useNavigate } from "@tanstack/react-router";
import { ArrowLeftIcon } from "lucide-react";
import { Header } from "@/app/layout/Header";
import { Main } from "@/app/layout/Main";
import { Button } from "@/components/kit";
import { useCreateRoom } from "../api/queries";
import { RoomForm } from "../ui/RoomForm";

export function RoomCreatePage() {
  const nav = useNavigate({ from: "/app/rooms/create" });
  const createRoom = useCreateRoom();

  return (
    <>
      <Header />
      <Main>
        <div className="flex flex-wrap items-center justify-between space-y-2">
          <div>
            <h2 className="font-bold text-2xl tracking-tight">ເພີ່ມຫ້ອງ</h2>
            <p className="text-muted-foreground">
              ສ້າງຫ້ອງພັກໃໝ່ໃນໂຮງແຮມ.
            </p>
          </div>
          <Button variant="outline" onClick={() => nav({ to: "/app/rooms" })}>
            <ArrowLeftIcon className="size-4" />
            ກັບຄືນ
          </Button>
        </div>

        <div className="mx-auto mt-6 max-w-3xl rounded-xl border bg-card p-6 shadow-sm sm:p-8">
          <RoomForm
            onSubmit={async (vals) => {
              await createRoom.mutateAsync(vals);
              nav({ to: "/app/rooms" });
            }}
            submitting={createRoom.isPending}
          />
        </div>
      </Main>
    </>
  );
}
