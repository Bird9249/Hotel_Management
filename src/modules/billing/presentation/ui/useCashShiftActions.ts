import { useState } from "react";
import { toast } from "@/components/kit";
import type {
  CloseShiftInput,
  OpenShiftInput,
} from "@/modules/billing/domain/contracts";
import type { CurrentShiftResult } from "@/modules/billing/domain/types";
import {
  useCloseShift,
  useCurrentShiftQuery,
  useOpenShift,
} from "../api/queries";
import { formatMoney } from "./invoice-status";

export function useCashShiftActions(enabled = true) {
  const shift = useCurrentShiftQuery(enabled);
  const openShift = useOpenShift();
  const closeShift = useCloseShift();
  const [openDialog, setOpenDialog] = useState(false);
  const [closeDialog, setCloseDialog] = useState(false);

  const handleOpen = async (values: OpenShiftInput) => {
    await openShift.mutateAsync(values);
    toast.success("ເປີດກະເງິນສົດສໍາເລັດ");
    setOpenDialog(false);
  };

  const handleClose = async (
    data: NonNullable<CurrentShiftResult>,
    values: CloseShiftInput,
  ) => {
    const closed = await closeShift.mutateAsync({
      id: data.shift.id,
      input: values,
    });
    const variance = Number(closed.variance ?? 0);
    if (variance === 0) {
      toast.success("ປິດກະ ແລະ ສົ່ງມອບສໍາເລັດ — ເງິນກົງກັນ");
    } else {
      toast.success(`ປິດກະສໍາເລັດ — ຜົນຕ່າງ ${formatMoney(variance)} ₭`);
    }
    setCloseDialog(false);
  };

  return {
    shift,
    openShift,
    closeShift,
    openDialog,
    setOpenDialog,
    closeDialog,
    setCloseDialog,
    handleOpen,
    handleClose,
  };
}
