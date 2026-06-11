import { addDays, format, parseISO } from "date-fns";

export function toExclusiveEnd(inclusiveTo: string): string {
  return format(addDays(parseISO(inclusiveTo), 1), "yyyy-MM-dd");
}

export function todayIso(): string {
  return format(new Date(), "yyyy-MM-dd");
}
