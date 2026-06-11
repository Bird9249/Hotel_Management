import { randomUUIDv7 } from "bun";
import type { DbTransaction } from "@/shared/types";
import type { GuestCreateInput } from "../contracts";
import { createGuest as createGuestDb } from "../repo/create-guest";

export async function createGuestService(
  client: DbTransaction,
  params: { input: GuestCreateInput },
) {
  const created = await createGuestDb(
    {
      id: randomUUIDv7(),
      fullName: params.input.fullName,
      phone: params.input.phone ?? null,
      idDocument: params.input.idDocument ?? null,
      nationality: params.input.nationality ?? null,
    },
    client,
  );
  if (!created) throw new Error("Failed to create guest");
  return { created };
}
