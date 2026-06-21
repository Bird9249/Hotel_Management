import type { DbClient } from "@/server/platform/db/client";
import type { DbTransaction } from "@/shared/types";
import { purgeExpiredBookingHolds } from "../repo/holds";

const PURGE_INTERVAL_MS = 30_000;
let lastPurgeAt = 0;

export async function releaseExpiredBookingHoldsService(
  client: DbTransaction | DbClient,
  options?: { force?: boolean },
) {
  const now = Date.now();
  if (!options?.force && now - lastPurgeAt < PURGE_INTERVAL_MS) {
    return { released: 0, skipped: true as const };
  }

  lastPurgeAt = now;
  const released = await purgeExpiredBookingHolds(client);
  return { released, skipped: false as const };
}
