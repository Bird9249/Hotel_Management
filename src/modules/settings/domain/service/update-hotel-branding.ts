import type { DbClient } from "@/server/platform/db/client";
import type { DbTransaction } from "@/shared/types";
import type { HotelBrandingInput } from "../contracts";
import { upsertHotelBranding } from "../repo/upsert-hotel-branding";
import { getHotelBrandingService } from "./get-hotel-branding";

export async function updateHotelBrandingService(
  client: DbTransaction | DbClient,
  input: HotelBrandingInput,
) {
  const updated = await upsertHotelBranding(input, client);
  if (!updated) throw new Error("Failed to update hotel branding");
  return getHotelBrandingService(client);
}
