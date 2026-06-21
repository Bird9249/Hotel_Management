import { TabsList, TabsTrigger } from "@/components/kit";

export const REPORT_TABS = [
  { value: "sales", label: "ລາຍຮັບ" },
  { value: "occupancy", label: "ອັດຕາເຂົ້າພັກ" },
  { value: "shift-reconciliation", label: "ກະເງິນສົດ" },
  { value: "sales-by-shift", label: "ຍອດຂາຍຕາມກະ" },
  { value: "daily-cash", label: "ເງິນສົດລາຍວັນ" },
  { value: "bookings-by-source", label: "ຊ່ອງທາງຈອງ" },
  { value: "revenue-by-source", label: "ລາຍຮັບຕາມຊ່ອງທາງ" },
  { value: "hk-productivity", label: "ຜົນງານແມ່ບ້ານ" },
] as const;

export type ReportTabValue = (typeof REPORT_TABS)[number]["value"];

export function ReportTabsNav() {
  return (
    <div className="-mx-4 overflow-x-auto overscroll-x-contain px-4 pb-1 sm:mx-0 sm:overflow-visible sm:px-0">
      <TabsList className="inline-flex h-auto w-max flex-nowrap gap-0.5 sm:w-auto sm:flex-wrap sm:justify-start">
        {REPORT_TABS.map(({ value, label }) => (
          <TabsTrigger
            key={value}
            value={value}
            className="flex-none shrink-0 px-3 sm:px-2.5"
          >
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
    </div>
  );
}
