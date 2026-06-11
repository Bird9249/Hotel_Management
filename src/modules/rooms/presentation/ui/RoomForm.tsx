import { BedDouble, Layers, Tags } from "lucide-react";
import { z } from "zod";
import { Field } from "@/components/form/Field";
import {
  Button,
  FieldDescription,
  FieldLegend,
  FieldSet,
  FormActions,
  FormInfiniteCombobox,
  FormInput,
  FormRoot,
  RHF,
  Separator,
  zodResolver,
} from "@/components/kit";
import type {
  RoomCreateInput,
  RoomStatus,
  RoomUpdateInput,
} from "@/modules/rooms/domain/contracts";
import { config } from "@/shared/lib/config";
import { fetchLookupForInfinite, hydrateLookupItem } from "@/shared/lib/utils";
import { RoomStatusBadge } from "./RoomStatusBadge";
import { RoomStatusPicker } from "./RoomStatusPicker";

const RoomFormSchema = z.object({
  roomNumber: z.string().min(1, "ຕ້ອງໃສ່ເລກຫ້ອງ"),
  floor: z.coerce.number().int().optional(),
  roomTypeId: z.string().min(1, "ຕ້ອງເລືອກປະເພດຫ້ອງ"),
  status: z.enum(["available", "occupied", "cleaning", "maintenance"]),
});

export type RoomFormValues = z.infer<typeof RoomFormSchema>;

type LookupItem = { id: string; name: string };

export function RoomForm({
  initialValues,
  onSubmit,
  submitting,
}: {
  initialValues?: Partial<RoomFormValues>;
  onSubmit: (values: RoomCreateInput | RoomUpdateInput) => void;
  submitting?: boolean;
}) {
  const methods = RHF.useForm<RoomFormValues>({
    resolver: zodResolver(RoomFormSchema),
    defaultValues: {
      roomNumber: "",
      floor: undefined,
      roomTypeId: "",
      status: "available",
      ...initialValues,
    },
  });

  const roomNumber = methods.watch("roomNumber");
  const floor = methods.watch("floor");
  const status = methods.watch("status");

  return (
    <FormRoot<RoomFormValues>
      methods={methods}
      onSubmit={(vals) =>
        onSubmit({
          roomNumber: vals.roomNumber,
          floor: vals.floor,
          roomTypeId: vals.roomTypeId,
          status: vals.status as RoomStatus,
        })
      }
      className="gap-6"
    >
      <div className="flex items-center justify-between gap-4 rounded-xl border bg-linear-to-br from-muted/60 to-muted/20 p-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <BedDouble className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-lg tracking-tight">
              {roomNumber.trim() || "ຫ້ອງໃໝ່"}
            </p>
            <p className="text-muted-foreground text-sm">
              {typeof floor === "number" && Number.isFinite(floor)
                ? `ຊັ້ນ ${floor}`
                : "ຍັງບໍ່ໄດ້ກຳນົດຊັ້ນ"}
            </p>
          </div>
        </div>
        <RoomStatusBadge status={status} />
      </div>

      <FieldSet className="gap-4">
        <div className="space-y-1">
          <FieldLegend className="text-base">ຂໍ້ມູນຫ້ອງ</FieldLegend>
          <FieldDescription>
            ກຳນົດເລກຫ້ອງ, ຊັ້ນ ແລະ ປະເພດຫ້ອງພັກ.
          </FieldDescription>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormInput
            name="roomNumber"
            label="ເລກຫ້ອງ"
            requiredMark
            placeholder="ຕົວຢ່າງ: 101, A-205"
            hint="ໃຊ້ເລກຫ້ອງທີ່ພະນັກງານຮູ້ຈັກໄດ້ງ່າຍ"
          />
          <FormInput
            name="floor"
            label="ຊັ້ນ"
            type="number"
            placeholder="ຕົວຢ່າງ: 1, 2, 3"
            hint="ປ່ອຍວ່າງໄດ້ຖ້າບໍ່ມີການແບ່ງຊັ້ນ"
          />
        </div>

        <div className="rounded-lg border bg-card/50 p-4">
          <div className="mb-3 flex items-center gap-2 text-muted-foreground text-sm">
            <Tags className="size-4" />
            <span>ປະເພດ ແລະ ລາຄາຫ້ອງ</span>
          </div>
          <FormInfiniteCombobox<LookupItem>
            name="roomTypeId"
            label="ປະເພດຫ້ອງ"
            requiredMark
            queryKey={["room-types", "lookup"]}
            queryFn={({ search, pageParam }) =>
              fetchLookupForInfinite<LookupItem>(
                `${config.apiUrl}/hotel/room-types/lookup`,
                { search, pageParam },
              )
            }
            preloadQueryFn={(id) =>
              hydrateLookupItem(`${config.apiUrl}/hotel/room-types/lookup`, id)
            }
            getLabel={(item) => item.name}
            getValue={(item) => item.id}
            placeholder="ຄົ້ນຫາ ແລະ ເລືອກປະເພດຫ້ອງ..."
            hint="ປະເພດຫ້ອງກຳນົດລາຄາ/ຄືນ ແລະ ຄວາມຈຸ"
          />
        </div>
      </FieldSet>

      <Separator />

      <FieldSet className="gap-4">
        <div className="space-y-1">
          <FieldLegend className="flex items-center gap-2 text-base">
            <Layers className="size-4 text-muted-foreground" />
            ສະຖານະຫ້ອງ
          </FieldLegend>
          <FieldDescription>
            ເລືອກສະຖານະປັດຈຸບັນຂອງຫ້ອງ — ສາມາດປ່ຽນໄດ້ທຸກເວລາຈາກຕາຕະລາງຫ້ອງ.
          </FieldDescription>
        </div>

        <RHF.Controller
          control={methods.control}
          name="status"
          render={({ field }) => (
            <Field name="status">
              <RoomStatusPicker
                value={field.value as RoomStatus}
                onChange={field.onChange}
              />
            </Field>
          )}
        />
      </FieldSet>

      <FormActions className="border-t pt-4">
        <Button type="submit" isLoading={submitting} className="min-w-28">
          ບັນທຶກ
        </Button>
      </FormActions>
    </FormRoot>
  );
}
