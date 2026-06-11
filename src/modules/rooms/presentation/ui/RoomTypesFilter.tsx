import { Button, Input, useDebounceCallback } from "@/components/kit";
import type { FilterConditionDTO } from "@/shared/contracts/base";
import {
  findCondition,
  removeConditions,
  upsertCondition,
} from "@/shared/contracts/query-helpers";
import { SimpleSelect } from "@/shared/ui/SimpleSelect";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";

const CAPACITY_OPTIONS = [
  { value: "__all__", label: "ທຸກຄວາມຈຸ" },
  { value: "1", label: "1 ຄົນ" },
  { value: "2", label: "2 ຄົນ" },
  { value: "3", label: "3 ຄົນ" },
  { value: "4", label: "4+ ຄົນ" },
] as const;

export function RoomTypesFilter() {
  const nav = useNavigate({ from: "/app/room-types" });
  const search = useSearch({ from: "/app/room-types" }) as {
    limit?: number;
    offset?: number;
    sort?: Array<{ field: string; dir: "asc" | "desc" }>;
    filters?: FilterConditionDTO[];
  };

  const filters = search.filters ?? [];
  const nameFilter = findCondition(filters, "name");
  const capacityFilter = findCondition(filters, "capacity");
  const [searchValue, setSearchValue] = useState<string>(
    (nameFilter?.value as string) || "",
  );

  useEffect(
    () => setSearchValue((nameFilter?.value as string) || ""),
    [nameFilter?.value],
  );

  const debounced = useDebounceCallback((val: string) => {
    setSearchValue(val);
    let nextFilters: FilterConditionDTO[] | undefined = filters;
    if (val) {
      nextFilters = upsertCondition(filters, {
        field: "name",
        op: "contains",
        value: val,
      });
    } else {
      nextFilters = removeConditions(filters, "name");
    }
    nav({
      search: {
        ...search,
        offset: 0,
        filters: nextFilters?.length ? nextFilters : undefined,
      },
    });
  }, 400);

  const capacityValue =
    capacityFilter?.op === "gte"
      ? String(capacityFilter.value)
      : capacityFilter?.value != null
        ? String(capacityFilter.value)
        : "__all__";

  const hasFilter = Boolean(nameFilter?.value || capacityFilter?.value);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 px-2 pt-2">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <Input
          placeholder="ຄົ້ນຫາຊື່ປະເພດຫ້ອງ..."
          defaultValue={searchValue}
          onChange={(e) => debounced(e.target.value)}
          className="h-8 sm:max-w-2xs"
        />
        <SimpleSelect
          value={capacityValue}
          onValueChange={(val) => {
            let nextFilters = filters;
            if (val && val !== "__all__") {
              const num = Number(val);
              nextFilters = upsertCondition(filters, {
                field: "capacity",
                op: num >= 4 ? "gte" : "eq",
                value: num,
              });
            } else {
              nextFilters = removeConditions(filters, "capacity");
            }
            nav({
              search: {
                ...search,
                offset: 0,
                filters: nextFilters?.length ? nextFilters : undefined,
              },
            });
          }}
          options={CAPACITY_OPTIONS.map((opt) => ({
            value: opt.value,
            label: opt.label,
          }))}
          className="h-8 w-[140px]"
        />
      </div>
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
