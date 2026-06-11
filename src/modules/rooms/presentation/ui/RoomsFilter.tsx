import { useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button, Input, useDebounceCallback } from "@/components/kit";
import type { FilterConditionDTO } from "@/shared/contracts/base";
import { SimpleSelect } from "@/shared/ui/SimpleSelect";
import {
  findCondition,
  removeConditions,
  upsertCondition,
} from "@/shared/contracts/query-helpers";
import { ROOM_STATUS_OPTIONS } from "./room-status";

export function RoomsFilter() {
  const nav = useNavigate({ from: "/app/rooms" });
  const search = useSearch({ from: "/app/rooms" }) as {
    limit?: number;
    offset?: number;
    sort?: Array<{ field: string; dir: "asc" | "desc" }> | string;
    filters?: FilterConditionDTO[] | string;
  };

  const filters = (search.filters as FilterConditionDTO[] | undefined) ?? [];
  const roomNumberFilter = findCondition(filters, "roomNumber");
  const statusFilter = findCondition(filters, "status");
  const [searchValue, setSearchValue] = useState<string>(
    (roomNumberFilter?.value as string) || "",
  );

  useEffect(
    () => setSearchValue((roomNumberFilter?.value as string) || ""),
    [roomNumberFilter?.value],
  );

  const debounced = useDebounceCallback((val: string) => {
    setSearchValue(val);
    let nextFilters: FilterConditionDTO[] | undefined = filters;
    if (val) {
      nextFilters = upsertCondition(filters, {
        field: "roomNumber",
        op: "contains",
        value: val,
      });
    } else {
      nextFilters = removeConditions(filters, "roomNumber");
    }
    nav({
      search: {
        ...search,
        offset: 0,
        filters: nextFilters?.length ? nextFilters : undefined,
      },
    });
  }, 400);

  const hasFilter = Boolean(roomNumberFilter?.value || statusFilter?.value);

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-4 px-2">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <Input
          placeholder="ຄົ້ນຫາເລກຫ້ອງ..."
          defaultValue={searchValue}
          onChange={(e) => debounced(e.target.value)}
          className="h-8 sm:max-w-2xs"
        />
        <SimpleSelect
          value={(statusFilter?.value as string) ?? "__all__"}
          onValueChange={(val) => {
            let nextFilters = filters;
            if (val && val !== "__all__") {
              nextFilters = upsertCondition(filters, {
                field: "status",
                op: "eq",
                value: val,
              });
            } else {
              nextFilters = removeConditions(filters, "status");
            }
            nav({
              search: {
                ...search,
                offset: 0,
                filters: nextFilters?.length ? nextFilters : undefined,
              },
            });
          }}
          options={[
            { value: "__all__", label: "ທຸກສະຖານະ" },
            ...ROOM_STATUS_OPTIONS.map((opt) => ({
              value: opt.value,
              label: opt.label,
            })),
          ]}
          className="h-8 w-[180px]"
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
