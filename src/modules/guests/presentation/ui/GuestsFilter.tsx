import { Button, Input, useDebounceCallback } from "@/components/kit";
import type { FilterConditionDTO } from "@/shared/contracts/base";
import {
  findCondition,
  removeConditions,
  upsertCondition,
} from "@/shared/contracts/query-helpers";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export function GuestsFilter() {
  const nav = useNavigate({ from: "/app/guests" });
  const search = useSearch({ from: "/app/guests" }) as {
    limit?: number;
    offset?: number;
    sort?: Array<{ field: string; dir: "asc" | "desc" }>;
    filters?: FilterConditionDTO[];
  };

  const filters = search.filters ?? [];
  const nameFilter = findCondition(filters, "fullName");
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
        field: "fullName",
        op: "contains",
        value: val,
      });
    } else {
      nextFilters = removeConditions(filters, "fullName");
    }
    nav({
      search: {
        ...search,
        offset: 0,
        filters: nextFilters?.length ? nextFilters : undefined,
      },
    });
  }, 400);

  const hasFilter = Boolean(nameFilter?.value);

  return (
    <div className="flex items-center justify-between gap-4 px-2">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="ຄົ້ນຫາລູກຄ້າ..."
          defaultValue={searchValue}
          onChange={(e) => debounced(e.target.value)}
          className="h-8 sm:max-w-2xs"
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
