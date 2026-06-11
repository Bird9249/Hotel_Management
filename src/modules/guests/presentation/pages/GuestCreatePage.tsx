import { useNavigate } from "@tanstack/react-router";
import { ArrowLeftIcon } from "lucide-react";
import { Header } from "@/app/layout/Header";
import { Main } from "@/app/layout/Main";
import { Button } from "@/components/kit";
import { useCreateGuest } from "../api/queries";
import { GuestForm } from "../ui/GuestForm";

export function GuestCreatePage() {
  const nav = useNavigate({ from: "/app/guests/create" });
  const createGuest = useCreateGuest();

  return (
    <>
      <Header />
      <Main>
        <div className="flex flex-wrap items-center justify-between space-y-2">
          <div>
            <h2 className="font-bold text-2xl tracking-tight">ເພີ່ມລູກຄ້າ</h2>
            <p className="text-muted-foreground">ສ້າງໂປຣໄຟລ໌ລູກຄ້າໃໝ່.</p>
          </div>
          <Button variant="outline" onClick={() => nav({ to: "/app/guests" })}>
            <ArrowLeftIcon className="size-4" />
            ກັບຄືນ
          </Button>
        </div>

        <div className="mx-auto mt-6 max-w-3xl rounded-xl border bg-card p-6 shadow-sm sm:p-8">
          <GuestForm
            onSubmit={async (vals) => {
              await createGuest.mutateAsync(vals);
              nav({ to: "/app/guests" });
            }}
            submitting={createGuest.isPending}
          />
        </div>
      </Main>
    </>
  );
}
