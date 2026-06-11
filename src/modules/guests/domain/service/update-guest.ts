import type { DbTransaction } from "@/shared/types";
import type { GuestUpdateInput } from "../contracts";
import { getGuestById } from "../repo/get-guest-by-id";
import { updateGuest as updateGuestDb } from "../repo/update-guest";

export async function updateGuestService(
  client: DbTransaction,
  params: { id: string; input: GuestUpdateInput },
) {
  const before = await getGuestById(params.id, client);
  if (!before) throw new Error("Guest not found");
  const updated = await updateGuestDb(params.id, params.input, client);
  if (!updated) throw new Error("Failed to update guest");
  return { updated, before };
}
