import type { DbTransaction } from "@/shared/types";
import type { SalesChannelUpdateInput } from "../contracts";
import { getChannelById } from "../repo/get-channel-by-id";
import { updateChannel as updateChannelDb } from "../repo/update-channel";

export async function updateChannelService(
  client: DbTransaction,
  params: { id: string; input: SalesChannelUpdateInput },
) {
  const before = await getChannelById(params.id, client);
  if (!before) throw new Error("CHANNEL_NOT_FOUND");

  const updated = await updateChannelDb(params.id, params.input, client);
  if (!updated) throw new Error("Failed to update channel");

  return { updated, before };
}
