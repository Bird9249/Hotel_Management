import { addDays, format, parseISO } from "date-fns";
import { useState } from "react";
import type { DateRange } from "@/components/date-picker";
import { DatePicker } from "@/components/date-picker";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FieldGroup,
  FieldLabel,
  Field as FieldLayout,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

function parseDate(value: string | null) {
  if (!value) return undefined;
  try {
    return parseISO(value);
  } catch {
    return undefined;
  }
}

function toIsoDate(value: Date) {
  return format(value, "yyyy-MM-dd");
}

export function PublicBookingSearch({
  initialFrom,
  initialTo,
  initialGuests,
}: {
  initialFrom: string;
  initialTo: string;
  initialGuests: number;
}) {
  const today = new Date();
  const [range, setRange] = useState<DateRange | undefined>({
    from: parseDate(initialFrom) ?? today,
    to: parseDate(initialTo) ?? addDays(today, 1),
  });
  const [guests, setGuests] = useState(initialGuests);

  const submit = () => {
    if (!range?.from || !range.to) return;

    const url = new URL("/book", window.location.origin);
    url.searchParams.set("from", toIsoDate(range.from));
    url.searchParams.set("to", toIsoDate(range.to));
    url.searchParams.set("guests", String(guests));
    window.location.href = url.toString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>ຄົ້ນຫາຫ້ອງວ່າງ</CardTitle>
        <CardDescription>ເລືອກຊ່ວງວັນທີ ແລະ ຈຳນວນຜູ້ເຂົ້າພັກ</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-[1fr_220px_auto]">
          <FieldLayout>
            <FieldLabel>ວັນເຂົ້າ - ວັນອອກ</FieldLabel>
            <DatePicker
              className="w-full"
              mode="range"
              onChange={setRange}
              value={range}
            />
          </FieldLayout>
          <FieldLayout>
            <FieldLabel htmlFor="guests">ຜູ້ເຂົ້າພັກ</FieldLabel>
            <Input
              id="guests"
              min={1}
              onChange={(event) => setGuests(Number(event.target.value) || 1)}
              type="number"
              value={guests}
            />
          </FieldLayout>
          <FieldGroup className="justify-end">
            <Button className="self-end" onClick={submit} type="button">
              ຄົ້ນຫາ
            </Button>
          </FieldGroup>
        </div>
      </CardContent>
    </Card>
  );
}
