import { format } from "date-fns";
import { BrushCleaning, CheckCircle2 } from "lucide-react";
import { Header } from "@/app/layout/Header";
import { Main } from "@/app/layout/Main";
import { Button, Card, CardContent, confirm } from "@/components/kit";
import { useActionPermission } from "@/modules/auth/presentation/model/useActionPermission";
import type { RoomStatus } from "@/modules/rooms/domain/contracts";
import { useRoomsQuery, useSetRoomStatus } from "../api/queries";
import { RoomStatusBadge } from "../ui/RoomStatusBadge";

export function HousekeepingPage() {
  const setRoomStatus = useSetRoomStatus();
  const canChangeStatus = useActionPermission(["rooms:status"]);

  const list = useRoomsQuery({
    limit: 100,
    offset: 0,
    filters: [{ field: "status", op: "eq", value: "cleaning" }],
    sort: [{ field: "roomNumber", dir: "asc" }],
  });

  const rooms = list.data?.data ?? [];
  const total = list.data?.meta?.total ?? 0;

  const markReady = async (id: string, roomNumber: string) => {
    const ok = await confirm({
      title: "ຫ້ອງພ້ອมໃຊ້",
      description: `ຢືນຢັນວ່າຫ້ອງ ${roomNumber} ທຳຄວາມສະອາດເສັດແລ້ວ?`,
      actionText: "ພ້ອมໃຊ້",
    });
    if (!ok) return;
    await setRoomStatus.mutateAsync({
      id,
      input: { status: "available" as RoomStatus },
    });
  };

  return (
    <>
      <Header />
      <Main>
        <div className="mb-4">
          <h2 className="flex items-center gap-2 font-bold text-2xl tracking-tight">
            <BrushCleaning className="size-7 text-primary" />
            ຄິວທຳຄວາມສະອາດ
          </h2>
          <p className="text-muted-foreground">
            ຫ້ອງທີ່ລໍຖ້າທຳຄວາມສະອາດຫຼັງເຊັກເອົາ — {format(new Date(), "dd/MM/yyyy")}
          </p>
        </div>

        <Card className="mb-4 border-amber-500/30 bg-amber-500/5">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-muted-foreground text-xs">ລໍຖ້າທຳຄວາມສະອາດ</p>
              <p className="font-bold text-2xl tabular-nums">{total}</p>
            </div>
            <BrushCleaning className="size-5 text-amber-600" />
          </CardContent>
        </Card>

        <div className="overflow-hidden rounded-xl border bg-card">
          {list.isLoading ? (
            <div className="px-4 py-10 text-center text-muted-foreground text-sm">
              ກໍາລັງໂຫຼດ...
            </div>
          ) : rooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
              <CheckCircle2 className="mb-3 size-10 text-emerald-600" />
              <p className="font-medium">ບໍ່ມີຫ້ອງລໍຖ້າທຳຄວາມສະອາດ</p>
              <p className="mt-1 text-muted-foreground text-sm">
                ທຸກຫ້ອງພ້ອມໃຫ້ບໍລິການແລ້ວ
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className="flex flex-wrap items-center justify-between gap-4 border-l-4 border-l-amber-500/60 px-4 py-4"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-lg">
                        ຫ້ອງ {room.roomNumber}
                      </p>
                      <RoomStatusBadge status={room.status} />
                    </div>
                    <div className="flex flex-wrap gap-x-3 text-muted-foreground text-sm">
                      {room.roomTypeName && <span>{room.roomTypeName}</span>}
                      {room.floor != null && <span>ຊັ້ນ {room.floor}</span>}
                    </div>
                  </div>

                  {canChangeStatus && (
                    <Button
                      size="sm"
                      onClick={() => markReady(room.id, room.roomNumber)}
                      disabled={setRoomStatus.isPending}
                    >
                      <CheckCircle2 className="size-4" />
                      ທຳຄວາມສະອາດເສັດ
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {!canChangeStatus && rooms.length > 0 && (
          <p className="mt-3 text-center text-muted-foreground text-sm">
            ທ່ານມີສິດເບິ່ງຄິວເທົ່ານັ້ນ — ຕ້ອງມີສິດອັບເດດສະຖານະຫ້ອງເພື່ອປ່ຽນເປັນພ້ອມໃຊ້
          </p>
        )}
      </Main>
    </>
  );
}
