import { removeUser } from "../repo/remove";
import type { DbTransaction } from "@/shared/types";

export async function deleteUserService(
  client: DbTransaction,
  params: { id: string },
) {
  const { id } = params;
  const user = await removeUser(id, client);
  return { deleted: user, imageToDelete: user?.image ?? null };
}
