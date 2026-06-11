import { format } from "date-fns";
import { CalendarCheck } from "lucide-react";
import { Controller } from "react-hook-form";
import { z } from "zod";
import { DatePicker } from "@/components/date-picker";
import { Field } from "@/components/form/Field";
import {
  Button,
  FieldLegend,
  FieldSet,
  FormActions,
  FormInfiniteCombobox,
  FormInput,
  FormRoot,
  RHF,
  zodResolver,
} from "@/components/kit";
import type {
  ReservationCreateInput,
  ReservationUpdateInput,
} from "@/modules/reservations/domain/contracts";
import { useRoomsQuery } from "@/modules/rooms/presentation/api/queries";
import { config } from "@/shared/lib/config";
import { fetchLookupForInfinite, hydrateLookupItem } from "@/shared/lib/utils";
import { SimpleSelect } from "@/shared/ui/SimpleSelect";

const ReservationFormSchema = z
  .object({
    guestId: z.string().min(1, "ຕ້ອງເລືອກລູກຄ້າ"),
    roomId: z.string().min(1, "ຕ້ອງເລືອກຫ້ອງ"),
    dateRange: z.object({
      from: z.date().optional(),
      to: z.date().optional(),
    }),
    guestsCount: z.coerce.number().int().min(1, "ຕ້ອງມີຢ່າງໜ້ອຍ 1 ຄົນ"),
  })
  .refine((v) => v.dateRange.from && v.dateRange.to, {
    message: "ຕ້ອງເລືອກວັນເຂົ້າ-ອອກ",
    path: ["dateRange"],
  })
  .refine(
    (v) => {
      if (!v.dateRange.from || !v.dateRange.to) return true;
      return v.dateRange.to > v.dateRange.from;
    },
    {
      message: "ວັນອອກຕ້ອງຫຼັງວັນເຂົ້າ",
      path: ["dateRange"],
    },
  );

export type ReservationFormValues = z.infer<typeof ReservationFormSchema>;

type LookupItem = { id: string; name: string };

function toIsoDate(d: Date) {
  return format(d, "yyyy-MM-dd");
}

export function ReservationForm({
  initialValues,
  onSubmit,
  submitting,
}: {
  initialValues?: Partial<ReservationFormValues>;
  onSubmit: (values: ReservationCreateInput | ReservationUpdateInput) => void;
  submitting?: boolean;
}) {
  const rooms = useRoomsQuery({ limit: 200, offset: 0 });

  const methods = RHF.useForm<ReservationFormValues>({
    resolver: zodResolver(ReservationFormSchema),
    defaultValues: {
      guestId: "",
      roomId: "",
      dateRange: { from: undefined, to: undefined },
      guestsCount: 1,
      ...initialValues,
    },
  });

  const roomId = methods.watch("roomId");
  const selectedRoom = rooms.data?.data.find((r) => r.id === roomId);

  return (
    <FormRoot<ReservationFormValues>
      methods={methods}
      onSubmit={(vals) => {
        if (!vals.dateRange.from || !vals.dateRange.to) return;
        onSubmit({
          guestId: vals.guestId,
          roomId: vals.roomId,
          checkInDate: toIsoDate(vals.dateRange.from),
          checkOutDate: toIsoDate(vals.dateRange.to),
          guestsCount: vals.guestsCount,
        });
      }}
      className="gap-6"
    >
      <div className="flex items-center gap-3 rounded-xl border bg-linear-to-br from-muted/60 to-muted/20 p-4">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <CalendarCheck className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold text-lg">
            {selectedRoom ? `ຫ້ອງ ${selectedRoom.roomNumber}` : "ການຈອງໃໝ່"}
          </p>
          <p className="text-muted-foreground text-sm">ລາຍລະອຽດການຈອງຫ້ອງພັກ</p>
        </div>
      </div>

      <FieldSet>
        <FieldLegend>ຂໍ້ມູນການຈອງ</FieldLegend>

        <FormInfiniteCombobox<LookupItem>
          name="guestId"
          label="ລູກຄ້າ"
          requiredMark
          queryKey={["guests", "lookup"]}
          queryFn={({ search, pageParam }) =>
            fetchLookupForInfinite<LookupItem>(
              `${config.apiUrl}/hotel/guests/lookup`,
              { search, pageParam },
            )
          }
          preloadQueryFn={(id) =>
            hydrateLookupItem(`${config.apiUrl}/hotel/guests/lookup`, id)
          }
          getLabel={(item) => item.name}
          getValue={(item) => item.id}
          placeholder="ຄົ້ນຫາລູກຄ້າ..."
        />

        <Field name="roomId" label="ຫ້ອງ" requiredMark>
          <Controller
            control={methods.control}
            name="roomId"
            render={({ field }) => (
              <SimpleSelect
                value={field.value}
                onValueChange={field.onChange}
                placeholder="ເລືອກຫ້ອງ"
                options={(rooms.data?.data ?? []).map((r) => ({
                  value: r.id,
                  label: `${r.roomNumber}${r.roomTypeName ? ` (${r.roomTypeName})` : ""}`,
                }))}
                className="w-full"
              />
            )}
          />
        </Field>

        <Field name="dateRange" label="ວັນເຂົ້າ - ວັນອອກ" requiredMark>
          <Controller
            control={methods.control}
            name="dateRange"
            render={({ field }) => (
              <DatePicker
                mode="range"
                value={field.value}
                onChange={field.onChange}
                className="w-full"
              />
            )}
          />
        </Field>

        <FormInput
          name="guestsCount"
          label="ຈຳນວນຜູ້ເຂົ້າພັກ"
          type="number"
          requiredMark
        />
      </FieldSet>

      <FormActions>
        <Button type="submit" isLoading={submitting}>
          ບັນທຶກ
        </Button>
      </FormActions>
    </FormRoot>
  );
}
