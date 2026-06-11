import type { DbTransaction } from "@/shared/types";
import { deleteGuest as deleteGuestDb } from "../repo/delete-guest";
import { getGuestById } from "../repo/get-guest-by-id";

export async function deleteGuestService(
  client: DbTransaction,
  params: { id: string },
) {
  const before = await getGuestById(params.id, client);
  if (!before) throw new Error("Guest not found");
  await deleteGuestDb(params.id, client);
  return { deleted: before };
}
