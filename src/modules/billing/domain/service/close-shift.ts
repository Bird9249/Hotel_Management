import type { DbTransaction } from "@/shared/types";
import type { CloseShiftInput } from "../contracts";
import { toMoney } from "../lib/money";
import { closeShift as closeShiftDb } from "../repo/close-shift";
import { getShiftById } from "../repo/get-shift-by-id";
import { sumPaymentsByShift } from "../repo/sum-payments-by-shift";

export async function closeShiftService(
  client: DbTransaction,
  params: {
    shiftId: string;
    input: CloseShiftInput;
    userId: string;
    canCloseAnyShift: boolean;
  },
) {
  const shift = await getShiftById(params.shiftId, client);
  if (!shift) throw new Error("SHIFT_NOT_FOUND");
  if (shift.status !== "open") throw new Error("SHIFT_NOT_OPEN");

  if (!params.canCloseAnyShift && shift.openedByUserId !== params.userId) {
    throw new Error("SHIFT_NOT_OWNER");
  }

  const totals = await sumPaymentsByShift(shift.id, client);
  const openingCash = Number(shift.openingCash);
  const expectedCash = Number((openingCash + totals.cash).toFixed(2));
  const variance = Number(
    (params.input.closingCashCounted - expectedCash).toFixed(2),
  );

  const updated = await closeShiftDb(
    shift.id,
    {
      closedByUserId: params.userId,
      closedAt: new Date(),
      closingCashCounted: toMoney(params.input.closingCashCounted),
      cashReceived: toMoney(totals.cash),
      transferReceived: toMoney(totals.transfer),
      cardReceived: toMoney(totals.card),
      expectedCash: toMoney(expectedCash),
      variance: toMoney(variance),
      handoverNote: params.input.handoverNote,
    },
    client,
  );
  if (!updated) throw new Error("Failed to close shift");

  const detail = await getShiftById(updated.id, client);
  if (!detail) throw new Error("SHIFT_NOT_FOUND");
  return detail;
}
