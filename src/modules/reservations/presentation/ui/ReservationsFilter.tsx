import { Button } from "@/components/kit";
import type { FilterConditionDTO } from "@/shared/contracts/base";
import { SimpleSelect } from "@/shared/ui/SimpleSelect";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { RESERVATION_STATUS_OPTIONS } from "./reservation-status";

export function ReservationsFilter() {
  const nav = useNavigate({ from: "/app/reservations" });
  const search = useSearch({ from: "/app/reservations" }) as {
    limit?: number;
    offset?: number;
    sort?: Array<{ field: string; dir: "asc" | "desc" }>;
    filters?: FilterConditionDTO[];
  };

  const filters = search.filters ?? [];
  const statusFilter = filters.find((f) => f.field === "status");
  const statusValue = (statusFilter?.value as string) || "";

  const setStatus = (val: string) => {
    const rest = filters.filter((f) => f.field !== "status");
    const next =
      val && val !== "all"
        ? [...rest, { field: "status", op: "eq" as const, value: val }]
        : rest;
    nav({
      search: {
        ...search,
        offset: 0,
        filters: next.length ? next : undefined,
      },
    });
  };

  const hasFilter = filters.length > 0;

  return (
    <div className="flex items-center justify-between gap-4 px-2">
      <SimpleSelect
        value={statusValue || "all"}
        onValueChange={setStatus}
        options={[
          { value: "all", label: "ທຸກສະຖານະ" },
          ...RESERVATION_STATUS_OPTIONS.map((o) => ({
            value: o.value,
            label: o.label,
          })),
        ]}
        className="h-8 w-[180px]"
      />
      {hasFilter && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            nav({ search: { ...search, offset: 0, filters: undefined } })
          }
        >
          ລ້າງຕົວກອງ
        </Button>
      )}
    </div>
  );
}
