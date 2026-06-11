import { UserRound } from "lucide-react";
import { z } from "zod";
import {
  Button,
  FieldLegend,
  FieldSet,
  FormActions,
  FormInput,
  FormRoot,
  RHF,
  zodResolver,
} from "@/components/kit";
import type {
  GuestCreateInput,
  GuestUpdateInput,
} from "@/modules/guests/domain/contracts";

const GuestFormSchema = z.object({
  fullName: z.string().min(1, "ຕ້ອງໃສ່ຊື່"),
  phone: z.string().optional(),
  idDocument: z.string().optional(),
  nationality: z.string().optional(),
});

export type GuestFormValues = z.infer<typeof GuestFormSchema>;

export function GuestForm({
  initialValues,
  onSubmit,
  submitting,
}: {
  initialValues?: Partial<GuestFormValues>;
  onSubmit: (values: GuestCreateInput | GuestUpdateInput) => void;
  submitting?: boolean;
}) {
  const methods = RHF.useForm<GuestFormValues>({
    resolver: zodResolver(GuestFormSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      idDocument: "",
      nationality: "",
      ...initialValues,
    },
  });

  const fullName = methods.watch("fullName");

  return (
    <FormRoot<GuestFormValues>
      methods={methods}
      onSubmit={(vals) =>
        onSubmit({
          fullName: vals.fullName,
          phone: vals.phone || undefined,
          idDocument: vals.idDocument || undefined,
          nationality: vals.nationality || undefined,
        })
      }
      className="gap-6"
    >
      <div className="flex items-center gap-3 rounded-xl border bg-linear-to-br from-muted/60 to-muted/20 p-4">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <UserRound className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold text-lg">
            {fullName || "ລູກຄ້າໃໝ່"}
          </p>
          <p className="text-muted-foreground text-sm">ຂໍ້ມູນລູກຄ້າໂຮງແຮມ</p>
        </div>
      </div>

      <FieldSet>
        <FieldLegend>ຂໍ້ມູນພື້ນຖານ</FieldLegend>
        <FormInput name="fullName" label="ຊື່-ນາມສະກຸນ" requiredMark />
        <FormInput name="phone" label="ເບີໂທ" />
        <FormInput name="idDocument" label="ເລກບັດ/ພາສປອດ" />
        <FormInput name="nationality" label="ສັນຊາດ" />
      </FieldSet>

      <FormActions>
        <Button type="submit" isLoading={submitting}>
          ບັນທຶກ
        </Button>
      </FormActions>
    </FormRoot>
  );
}
