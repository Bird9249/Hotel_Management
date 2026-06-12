import { eq } from "drizzle-orm";
import type { DbClient } from "@/server/platform/db/client";
import { hotelSettings } from "@/server/platform/db/schema/hotel-settings";
import type { DbTransaction } from "@/shared/types";
import { DEFAULT_HOTEL_BRANDING } from "@/shared/lib/hotel-branding-defaults";

const SETTINGS_ID = "default";

export async function getHotelBrandingRow(
  client: DbTransaction | DbClient,
) {
  const [row] = await client
    .select()
    .from(hotelSettings)
    .where(eq(hotelSettings.id, SETTINGS_ID))
    .limit(1);

  return row ?? null;
}

export async function ensureHotelBrandingRow(client: DbTransaction | DbClient) {
  const existing = await getHotelBrandingRow(client);
  if (existing) return existing;

  const [inserted] = await client
    .insert(hotelSettings)
    .values({
      id: SETTINGS_ID,
      name: DEFAULT_HOTEL_BRANDING.name,
      nameEn: DEFAULT_HOTEL_BRANDING.nameEn,
      address: DEFAULT_HOTEL_BRANDING.address,
      phone: DEFAULT_HOTEL_BRANDING.phone,
      taxId: DEFAULT_HOTEL_BRANDING.taxId || null,
      logoKey: null,
    })
    .onConflictDoNothing()
    .returning();

  if (inserted) return inserted;

  const row = await getHotelBrandingRow(client);
  if (!row) throw new Error("Failed to initialize hotel settings");
  return row;
}
