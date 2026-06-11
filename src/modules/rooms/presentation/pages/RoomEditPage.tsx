import { useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeftIcon } from "lucide-react";
import { Header } from "@/app/layout/Header";
import { Main } from "@/app/layout/Main";
import { Button } from "@/components/kit";
import type { RoomStatus } from "@/modules/rooms/domain/contracts";
import { QueryState } from "@/shared/ui/QueryState";
import { useRoomQuery, useUpdateRoom } from "../api/queries";
import { RoomForm } from "../ui/RoomForm";

export function RoomEditPage() {
  const nav = useNavigate({ from: "/app/rooms/$id/edit" });
  const { id } = useParams({ from: "/app/rooms/$id/edit" });
  const { data, ...result } = useRoomQuery(id);
  const updateRoom = useUpdateRoom(id);

  return (
    <>
      <Header />
      <Main>
        <div className="flex flex-wrap items-center justify-between space-y-2">
          <div>
            <h2 className="font-bold text-2xl tracking-tight">ແກ້ໄຂຫ້ອງ</h2>
            <p className="text-muted-foreground">ປັບປຸງລາຍລະອຽດຫ້ອງພັກ.</p>
          </div>
          <Button variant="outline" onClick={() => nav({ to: "/app/rooms" })}>
            <ArrowLeftIcon className="size-4" />
            ກັບຄືນ
          </Button>
        </div>

        <QueryState
          result={result}
          title="ກໍາລັງໂຫຼດຫ້ອງ"
          description="ກໍາລັງດຶງລາຍລະອຽດ"
          variant="fullscreen"
        >
          {!data ? null : (
            <div className="mx-auto mt-6 max-w-3xl rounded-xl border bg-card p-6 shadow-sm sm:p-8">
              <RoomForm
                initialValues={{
                  roomNumber: data.roomNumber,
                  floor: data.floor ?? undefined,
                  roomTypeId: data.roomTypeId,
                  status: data.status as RoomStatus,
                }}
                onSubmit={async (vals) => {
                  await updateRoom.mutateAsync(vals);
                  nav({ to: "/app/rooms" });
                }}
                submitting={updateRoom.isPending}
              />
            </div>
          )}
        </QueryState>
      </Main>
    </>
  );
}
