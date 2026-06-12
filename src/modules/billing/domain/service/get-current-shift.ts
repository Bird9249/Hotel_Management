import type { DbTransaction } from "@/shared/types";
import { getOpenShift } from "../repo/get-open-shift";
import { sumPaymentsByShift } from "../repo/sum-payments-by-shift";

export async function getCurrentShiftService(client: DbTransaction) {
  const shift = await getOpenShift(client);
  if (!shift) return null;

  const totals = await sumPaymentsByShift(shift.id, client);
  const openingCash = Number(shift.openingCash);
  const expectedCash = Number((openingCash + totals.cash).toFixed(2));

  return {
    shift,
    totals,
    expectedCash,
  };
}
