import { Header } from "@/app/layout/Header";
import { Main } from "@/app/layout/Main";
import { CashShiftPageContent } from "../ui/CashShiftPageContent";
import { OpenShiftGate } from "../ui/OpenShiftGate";

export function CashShiftPage() {
  return (
    <>
      <Header />
      <Main>
        <OpenShiftGate
          title="ກະເງິນສົດ"
          description="ເປີດ–ປິດກະ ແລະ ສົ່ງມອບເງິນສົດປະຈຳວັນ."
        >
          <CashShiftPageContent />
        </OpenShiftGate>
      </Main>
    </>
  );
}
