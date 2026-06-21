import type { DbTransaction } from "@/shared/types";
import { releaseHold } from "../repo/release-hold";

export async function releaseHoldService(
  client: DbTransaction,
  params: { id: string },
) {
  const released = await releaseHold(params.id, client);
  return { released };
}
