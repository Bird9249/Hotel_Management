import type { DbClient } from "@/server/platform/db/client";
import type { DbTransaction } from "@/shared/types";
import { pivotBySource } from "../lib/pivot-by-source";
import { queryRevenueBySource } from "../repo/revenue-by-source";

export async function getRevenueBySource(
  from: string,
  to: string,
  client: DbTransaction | DbClient,
) {
  const rows = await queryRevenueBySource(from, to, client);
  return pivotBySource(rows);
}
