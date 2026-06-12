import { Header } from "@/app/layout/Header";
import { Main } from "@/app/layout/Main";
import { OpenShiftGate } from "@/modules/billing/presentation/ui/OpenShiftGate";
import { FrontDeskPageContent } from "../ui/FrontDeskPageContent";

export function FrontDeskPage() {
  return (
    <>
      <Header />
      <Main>
        <OpenShiftGate title="ໜ້າຮັບແຂກ" description="ຈັດການແຂກມາຮອດ ແລະ ອອກວັນນີ້.">
          <FrontDeskPageContent />
        </OpenShiftGate>
      </Main>
    </>
  );
}
