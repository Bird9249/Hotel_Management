import { Controller } from "react-hook-form";
import { z } from "zod";
import { Field } from "@/components/form/Field";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  FormInput,
  FormRoot,
  RHF,
  zodResolver,
} from "@/components/kit";
import type { AddPaymentInput } from "@/modules/billing/domain/contracts";
import { SimpleSelect } from "@/shared/ui/SimpleSelect";
import { formatMoney, PAYMENT_METHOD_OPTIONS } from "./invoice-status";

const PaymentFormSchema = z.object({
  method: z.enum(["cash", "bank_transfer", "credit_card"]),
  amount: z.coerce.number().positive("ຕ້ອງມີຈຳນວນເງິນ"),
});

type PaymentFormValues = z.infer<typeof PaymentFormSchema>;

export function AddPaymentDialog({
  open,
  onOpenChange,
  balance,
  onSubmit,
  submitting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  balance: number;
  onSubmit: (values: AddPaymentInput) => void;
  submitting?: boolean;
}) {
  const methods = RHF.useForm<PaymentFormValues>({
    resolver: zodResolver(PaymentFormSchema),
    defaultValues: { method: "cash", amount: balance },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>ບັນທຶກການຊຳລະ</DialogTitle>
        </DialogHeader>
        <p className="text-muted-foreground text-sm">
          ຍອດຄ້າງ: <strong>{formatMoney(balance)} ₭</strong>
        </p>
        <FormRoot<PaymentFormValues>
          methods={methods}
          onSubmit={(vals) =>
            onSubmit({ method: vals.method, amount: vals.amount })
          }
          className="gap-4"
        >
          <Field name="method" label="ຊ່ອງທາງ">
            <Controller
              control={methods.control}
              name="method"
              render={({ field }) => (
                <SimpleSelect
                  value={field.value}
                  onValueChange={field.onChange}
                  options={PAYMENT_METHOD_OPTIONS.map((o) => ({
                    value: o.value,
                    label: o.label,
                  }))}
                  className="w-full"
                />
              )}
            />
          </Field>
          <FormInput
            name="amount"
            label="ຈຳນວນເງິນ (₭)"
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
              ບັນທຶກ
            </Button>
          </div>
        </FormRoot>
      </DialogContent>
    </Dialog>
  );
}
