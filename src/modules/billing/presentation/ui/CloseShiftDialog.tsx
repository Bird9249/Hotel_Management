import { z } from "zod";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  FormInput,
  FormRoot,
  FormTextarea,
  RHF,
  zodResolver,
} from "@/components/kit";
import type { CloseShiftInput } from "@/modules/billing/domain/contracts";
import type { CurrentShiftResult } from "@/modules/billing/domain/types";
import { ShiftSummaryCard } from "./ShiftSummaryCard";

const CloseShiftFormSchema = z.object({
  closingCashCounted: z.coerce.number().nonnegative(),
  handoverNote: z.string().max(500).optional(),
});

type CloseShiftFormValues = z.infer<typeof CloseShiftFormSchema>;

export function CloseShiftDialog({
  open,
  onOpenChange,
  shiftData,
  onSubmit,
  submitting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shiftData: NonNullable<CurrentShiftResult>;
  onSubmit: (values: CloseShiftInput) => void;
  submitting?: boolean;
}) {
  const methods = RHF.useForm<CloseShiftFormValues>({
    resolver: zodResolver(CloseShiftFormSchema),
    defaultValues: {
      closingCashCounted: shiftData.expectedCash,
      handoverNote: "",
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>ປິດກະເງິນສົດ</DialogTitle>
          <DialogDescription>
            ກວດນັບເງິນສົດໃນລິ້ນຊັກ ແລະ ບັນທຶກສົ່ງມອບຕາມຍອດຄາດຫວັງດ້ານລຸ່ມ
          </DialogDescription>
        </DialogHeader>

        <ShiftSummaryCard data={shiftData} />

        <FormRoot<CloseShiftFormValues>
          methods={methods}
          onSubmit={onSubmit}
          className="mt-4 gap-4"
        >
          <FormInput
            name="closingCashCounted"
            label="ເງິນສົດທີ່ນັບໄດ້ຈິງ (₭)"
            type="number"
            requiredMark
          />
          <FormTextarea
            name="handoverNote"
            label="ຫມາຍເຫດສົ່ງມອບ"
            placeholder="ລາຍລະອຽດເພີ່ມເຕີມ (ຖ້າມີ)"
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              ຍົກເລີກ
            </Button>
            <Button type="submit" isLoading={submitting}>
              ປິດກະ ແລະ ສົ່ງມອບ
            </Button>
          </div>
        </FormRoot>
      </DialogContent>
    </Dialog>
  );
}
