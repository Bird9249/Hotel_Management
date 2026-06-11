import { useNavigate, useSearch } from "@tanstack/react-router";
import { Button } from "@/components/kit";
import type { FilterConditionDTO } from "@/shared/contracts/base";
import { SimpleSelect } from "@/shared/ui/SimpleSelect";
import { INVOICE_STATUS_OPTIONS } from "./invoice-status";

export function InvoicesFilter() {
  const nav = useNavigate({ from: "/app/invoices" });
  const search = useSearch({ from: "/app/invoices" }) as {
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

  return (
    <div className="mb-4 flex items-center justify-between gap-4 px-2 pt-2">
      <SimpleSelect
        value={statusValue || "all"}
        onValueChange={setStatus}
        options={[
          { value: "all", label: "ທຸກສະຖານະ" },
          ...INVOICE_STATUS_OPTIONS.map((o) => ({
            value: o.value,
            label: o.label,
          })),
        ]}
        className="h-8 w-[180px]"
      />
      {filters.length > 0 && (
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
