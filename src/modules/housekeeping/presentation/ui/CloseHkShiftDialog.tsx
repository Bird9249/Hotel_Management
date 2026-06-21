import {
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  FormRoot,
  FormTextarea,
  RHF,
  zodResolver,
} from "@/components/kit";
import type { CloseHkShiftInput } from "@/modules/housekeeping/domain/contracts";
import type { CurrentHkShiftResult } from "@/modules/housekeeping/domain/types";
import { z } from "zod";

const CloseHkShiftFormSchema = z.object({
  handoverNote: z.string().max(500).optional(),
});

type CloseHkShiftFormValues = z.infer<typeof CloseHkShiftFormSchema>;

export function CloseHkShiftDialog({
  open,
  onOpenChange,
  shiftData,
  onSubmit,
  submitting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shiftData: NonNullable<CurrentHkShiftResult>;
  onSubmit: (values: CloseHkShiftInput) => void;
  submitting?: boolean;
}) {
  const methods = RHF.useForm<CloseHkShiftFormValues>({
    resolver: zodResolver(CloseHkShiftFormSchema),
    defaultValues: { handoverNote: "" },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>ປິດກະແມ່ບ້ານ</DialogTitle>
          <DialogDescription>
            ກວດຈຳນວນຫ້ອງທີ່ສຳເລັດ ແລະ ບັນທຶກຫມາຍເຫດສົ່ງມອບໃຫ້ກະຖັດໄປ
          </DialogDescription>
        </DialogHeader>

        <Card>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-muted-foreground text-sm">ຫ້ອງສຳເລັດ</p>
              <p className="font-bold text-2xl tabular-nums">
                {shiftData.totals.completed}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">ຫ້ອງຄ້າງ</p>
              <p className="font-bold text-2xl tabular-nums">
                {shiftData.totals.pending}
              </p>
            </div>
          </CardContent>
        </Card>

        <FormRoot<CloseHkShiftFormValues>
          methods={methods}
          onSubmit={onSubmit}
          className="gap-4"
        >
          <FormTextarea
            name="handoverNote"
            label="ຫມາຍເຫດສົ່ງມອບ"
            placeholder="ເຊັ່ນ ຫ້ອງ 204 ລໍຖ້າຊ່າງ, ຫ້ອງ 301 ລໍຖ້າຜ້າປູ..."
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              ຍົກເລີກ
            </Button>
            <Button type="submit" disabled={submitting}>
              ປິດກະ
            </Button>
          </div>
        </FormRoot>
      </DialogContent>
    </Dialog>
  );
}
