import { Tabs, TabsList, TabsTrigger } from "@/components/kit";

export type HkMobileTaskFilter = "pending" | "in_progress" | "done";

type HkTaskTabsProps = {
  value: HkMobileTaskFilter;
  counts: Record<HkMobileTaskFilter, number>;
  onValueChange: (value: HkMobileTaskFilter) => void;
};

export function HkTaskTabs({ value, counts, onValueChange }: HkTaskTabsProps) {
  return (
    <Tabs
      value={value}
      onValueChange={(next) => onValueChange(next as HkMobileTaskFilter)}
    >
      <TabsList className="grid h-12 w-full grid-cols-3">
        <TabsTrigger value="pending">
          ລໍຖ້າ
          <span className="ml-1 text-xs tabular-nums">{counts.pending}</span>
        </TabsTrigger>
        <TabsTrigger value="in_progress">
          ກຳລັງອານາໄມ
          <span className="ml-1 text-xs tabular-nums">
            {counts.in_progress}
          </span>
        </TabsTrigger>
        <TabsTrigger value="done">
          ເສັດແລ້ວ
          <span className="ml-1 text-xs tabular-nums">{counts.done}</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
