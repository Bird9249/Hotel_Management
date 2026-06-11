import { subDays } from "date-fns";
import { useMemo } from "react";
import { DatePicker, type DateRange } from "@/components/date-picker";

type DateRangePickerProps = {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
};

export function defaultReportDateRange(): DateRange {
  const to = new Date();
  const from = subDays(to, 6);
  return { from, to };
}

export function dateRangeToParams(range: DateRange): {
  from: string;
  to: string;
} | null {
  if (!range.from || !range.to) return null;
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return { from: fmt(range.from), to: fmt(range.to) };
}

export function defaultReportParams() {
  return dateRangeToParams(defaultReportDateRange()) ?? { from: "", to: "" };
}

export function DateRangePicker({
  value,
  onChange,
  className,
}: DateRangePickerProps) {
  const yearBounds = useMemo(() => {
    const y = new Date().getFullYear();
    return { fromYear: y - 2, toYear: y + 1 };
  }, []);

  return (
    <DatePicker
      mode="range"
      value={value}
      onChange={(range) => {
        if (range?.from && range?.to) onChange(range);
        else if (range?.from) onChange({ from: range.from, to: undefined });
      }}
      placeholder="ເລືອກຊ່ວງວັນທີ"
      className={className}
      captionLayout="dropdown"
      fromYear={yearBounds.fromYear}
      toYear={yearBounds.toYear}
    />
  );
}
