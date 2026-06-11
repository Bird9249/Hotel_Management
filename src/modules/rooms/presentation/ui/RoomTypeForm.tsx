import { Banknote, Tags, Users } from "lucide-react";
import { z } from "zod";
import {
  Badge,
  Button,
  cn,
  FieldDescription,
  FieldLegend,
  FieldSet,
  FormActions,
  FormInput,
  FormRoot,
  FormTextarea,
  RHF,
  Separator,
  zodResolver,
} from "@/components/kit";
import type {
  RoomTypeCreateInput,
  RoomTypeUpdateInput,
} from "@/modules/rooms/domain/contracts";

const CAPACITY_PRESETS = [1, 2, 3, 4, 5, 6] as const;

const RoomTypeFormSchema = z.object({
  name: z.string().min(1, "ຕ້ອງໃສ່ຊື່"),
  description: z.string().optional(),
  basePrice: z.coerce.number().nonnegative("ລາຄາຕ້ອງບໍ່ຕິດລົບ"),
  capacity: z.coerce.number().int().min(1, "ຄວາມຈຸຕ້ອງຢ່າງນ້ອຍ 1"),
});

export type RoomTypeFormValues = z.infer<typeof RoomTypeFormSchema>;

function formatPrice(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "—";
  return `${value.toLocaleString("lo-LA")} ກີບ`;
}

export function RoomTypeForm({
  initialValues,
  onSubmit,
  submitting,
}: {
  initialValues?: Partial<RoomTypeFormValues>;
  onSubmit: (values: RoomTypeCreateInput | RoomTypeUpdateInput) => void;
  submitting?: boolean;
}) {
  const methods = RHF.useForm<RoomTypeFormValues>({
    resolver: zodResolver(RoomTypeFormSchema),
    defaultValues: {
      name: "",
      description: "",
      basePrice: 0,
      capacity: 2,
      ...initialValues,
    },
  });

  const name = methods.watch("name");
  const basePrice = methods.watch("basePrice");
  const capacity = methods.watch("capacity");

  return (
    <FormRoot<RoomTypeFormValues>
      methods={methods}
      onSubmit={(vals) =>
        onSubmit({
          name: vals.name,
          description: vals.description || undefined,
          basePrice: vals.basePrice,
          capacity: vals.capacity,
        })
      }
      className="gap-6"
    >
      <div className="flex items-center justify-between gap-4 rounded-xl border bg-linear-to-br from-muted/60 to-muted/20 p-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Tags className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-lg tracking-tight">
              {name.trim() || "ປະເພດຫ້ອງໃໝ່"}
            </p>
            <p className="text-muted-foreground text-sm">
              {formatPrice(basePrice)} / ຄືນ
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="shrink-0 gap-1 px-2.5 py-1">
          <Users className="size-3.5" />
          {typeof capacity === "number" && Number.isFinite(capacity) && capacity > 0
            ? `${capacity} ຄົນ`
            : "—"}
        </Badge>
      </div>

      <FieldSet className="gap-4">
        <div className="space-y-1">
          <FieldLegend className="text-base">ຂໍ້ມູນພື້ນຖານ</FieldLegend>
          <FieldDescription>
            ຊື່ ແລະ ຄຳອະທິບາຍປະເພດຫ້ອງທີ່ພະນັກງານເຫັນໃນລະບົບ.
          </FieldDescription>
        </div>

        <FormInput
          name="name"
          label="ຊື່ປະເພດຫ້ອງ"
          requiredMark
          placeholder="ຕົວຢ່າງ: Standard, Deluxe, Suite"
          hint="ໃຊ້ຊື່ສັ້ນໆ ທີ່ເຂົ້າໃຈງ່າຍ"
        />
        <FormTextarea
          name="description"
          label="ຄໍາອະທິບາຍ"
          placeholder="ອະທິບາຍສິ່ງອຳນວຍຄວາມສະດວກ, ຂະໜາດ, ຫຼື ຈຸດເດັ່ນຂອງປະເພດນີ້..."
          hint="ບໍ່ບັງຄັບ — ໃຊ້ຊ່ວຍໃຫ້ພະນັກງານເລືອກປະເພດໄດ້ຖືກຕ້ອງ"
        />
      </FieldSet>

      <Separator />

      <FieldSet className="gap-4">
        <div className="space-y-1">
          <FieldLegend className="flex items-center gap-2 text-base">
            <Banknote className="size-4 text-muted-foreground" />
            ລາຄາ ແລະ ຄວາມຈຸ
          </FieldLegend>
          <FieldDescription>
            ກຳນົດລາຄາຕໍ່ຄືນ ແລະ ຈຳນວນຜູ້ເຂົ້າພັກສູງສຸດ.
          </FieldDescription>
        </div>

        <div className="rounded-lg border bg-card/50 p-4">
          <FormInput
            name="basePrice"
            label="ລາຄາ/ຄືນ (ກີບ)"
            type="number"
            min={0}
            step={1000}
            requiredMark
            placeholder="ຕົວຢ່າງ: 350000"
            hint="ລາຄານີ້ຈະຖືກນຳໄປຄິດໄລ່ໃນການຈອງ ແລະ ໃບບິນ"
          />
        </div>

        <div className="space-y-3">
          <FormInput
            name="capacity"
            label="ຄວາມຈຸ (ຄົນ)"
            type="number"
            min={1}
            requiredMark
            placeholder="ຕົວຢ່າງ: 2"
          />
          <div className="space-y-2">
            <p className="text-muted-foreground text-xs">ເລືອກຄວາມຈຸດ່ວນໄວ</p>
            <div className="flex flex-wrap gap-2">
              {CAPACITY_PRESETS.map((preset) => {
                const selected = Number(capacity) === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() =>
                      methods.setValue("capacity", preset, {
                        shouldValidate: true,
                      })
                    }
                    className={cn(
                      "inline-flex h-8 min-w-10 items-center justify-center rounded-md border px-3 text-sm transition-colors",
                      selected
                        ? "border-primary bg-primary/10 font-medium text-primary"
                        : "border-border hover:bg-muted/60",
                    )}
                  >
                    {preset}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </FieldSet>

      <FormActions className="border-t pt-4">
        <Button type="submit" isLoading={submitting} className="min-w-28">
          ບັນທຶກ
        </Button>
      </FormActions>
    </FormRoot>
  );
}
