import { randomUUIDv7 } from "bun";
import type { DbTransaction } from "@/shared/types";
import type { OpenShiftInput } from "../contracts";
import { toMoney } from "../lib/money";
import { getOpenShift } from "../repo/get-open-shift";
import { getShiftById } from "../repo/get-shift-by-id";
import { insertShift } from "../repo/insert-shift";

export async function openShiftService(
  client: DbTransaction,
  params: { input: OpenShiftInput; userId: string },
) {
  const existing = await getOpenShift(client);
  if (existing) throw new Error("SHIFT_ALREADY_OPEN");

  const created = await insertShift(
    {
      id: randomUUIDv7(),
      status: "open",
      openedByUserId: params.userId,
      openingCash: toMoney(params.input.openingCash),
    },
    client,
  );
  if (!created) throw new Error("Failed to open shift");

  const detail = await getShiftById(created.id, client);
  if (!detail) throw new Error("SHIFT_NOT_FOUND");
  return detail;
}
