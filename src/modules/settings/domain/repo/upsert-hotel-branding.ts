import { eq } from "drizzle-orm";
import type { HotelBrandingInput } from "@/modules/settings/domain/contracts";
import { nowDate } from "@/shared/lib/date-time";
import type { DbClient } from "@/server/platform/db/client";
import { hotelSettings } from "@/server/platform/db/schema/hotel-settings";
import type { DbTransaction } from "@/shared/types";
import { ensureHotelBrandingRow } from "./get-hotel-branding";

const SETTINGS_ID = "default";

export async function upsertHotelBranding(
  input: HotelBrandingInput,
  client: DbTransaction | DbClient,
) {
  await ensureHotelBrandingRow(client);

  const values = {
    name: input.name,
    nameEn: input.nameEn?.trim() || null,
    address: input.address?.trim() || null,
    phone: input.phone?.trim() || null,
    taxId: input.taxId?.trim() || null,
    updatedAt: nowDate(),
    ...(input.logoKey !== undefined
      ? { logoKey: input.logoKey?.trim() || null }
      : {}),
  };

  const [updated] = await client
    .update(hotelSettings)
    .set(values)
    .where(eq(hotelSettings.id, SETTINGS_ID))
    .returning();

  return updated ?? null;
}
