import { useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeftIcon } from "lucide-react";
import { Header } from "@/app/layout/Header";
import { Main } from "@/app/layout/Main";
import { Button } from "@/components/kit";
import { QueryState } from "@/shared/ui/QueryState";
import { useGuestQuery, useUpdateGuest } from "../api/queries";
import { GuestForm } from "../ui/GuestForm";

export function GuestEditPage() {
  const nav = useNavigate({ from: "/app/guests/$id/edit" });
  const { id } = useParams({ from: "/app/guests/$id/edit" });
  const { data, ...result } = useGuestQuery(id);
  const updateGuest = useUpdateGuest(id);

  return (
    <>
      <Header />
      <Main>
        <div className="flex flex-wrap items-center justify-between space-y-2">
          <div>
            <h2 className="font-bold text-2xl tracking-tight">ແກ້ໄຂລູກຄ້າ</h2>
            <p className="text-muted-foreground">ປັບປຸງຂໍ້ມູນລູກຄ້າ.</p>
          </div>
          <Button variant="outline" onClick={() => nav({ to: "/app/guests" })}>
            <ArrowLeftIcon className="size-4" />
            ກັບຄືນ
          </Button>
        </div>

        <QueryState
          result={result}
          title="ກໍາລັງໂຫຼດລູກຄ້າ"
          description="ກໍາລັງດຶງລາຍລະອຽດ"
          variant="fullscreen"
        >
          {!data ? null : (
            <div className="mx-auto mt-6 max-w-3xl rounded-xl border bg-card p-6 shadow-sm sm:p-8">
              <GuestForm
                initialValues={{
                  fullName: data.fullName,
                  phone: data.phone ?? "",
                  idDocument: data.idDocument ?? "",
                  nationality: data.nationality ?? "",
                }}
                onSubmit={async (vals) => {
                  await updateGuest.mutateAsync(vals);
                  nav({ to: "/app/guests" });
                }}
                submitting={updateGuest.isPending}
              />
            </div>
          )}
        </QueryState>
      </Main>
    </>
  );
}
