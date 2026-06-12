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
  RHF,
  zodResolver,
} from "@/components/kit";
import type { OpenShiftInput } from "@/modules/billing/domain/contracts";

const OpenShiftFormSchema = z.object({
  openingCash: z.coerce.number().nonnegative(),
});

type OpenShiftFormValues = z.infer<typeof OpenShiftFormSchema>;

export function OpenShiftDialog({
  open,
  onOpenChange,
  onSubmit,
  submitting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: OpenShiftInput) => void;
  submitting?: boolean;
}) {
  const methods = RHF.useForm<OpenShiftFormValues>({
    resolver: zodResolver(OpenShiftFormSchema),
    defaultValues: { openingCash: 0 },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>ເປີດກະເງິນສົດ</DialogTitle>
          <DialogDescription>ບັນທຶກເງິນຕັ້ງຕົ້ນໃນລິ້ນຊັກກ່ອນເລີ່ມຮັບເງິນ</DialogDescription>
        </DialogHeader>
        <FormRoot<OpenShiftFormValues>
          methods={methods}
          onSubmit={onSubmit}
          className="gap-4"
        >
          <FormInput
            name="openingCash"
            label="ເງິນຕັ້ງຕົ້ນ (₭)"
            type="number"
            requiredMark
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
              ເປີດກະ
            </Button>
          </div>
        </FormRoot>
      </DialogContent>
    </Dialog>
  );
}
