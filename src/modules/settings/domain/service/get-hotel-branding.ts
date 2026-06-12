import type { DbClient } from "@/server/platform/db/client";
import type { DbTransaction } from "@/shared/types";
import type { HotelBrandingDTO } from "../contracts";
import { ensureHotelBrandingRow } from "../repo/get-hotel-branding";

function toDto(row: Awaited<ReturnType<typeof ensureHotelBrandingRow>>): HotelBrandingDTO {
  return {
    name: row.name,
    nameEn: row.nameEn,
    address: row.address,
    phone: row.phone,
    taxId: row.taxId,
    logoKey: row.logoKey,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function getHotelBrandingService(
  client: DbTransaction | DbClient,
): Promise<HotelBrandingDTO> {
  const row = await ensureHotelBrandingRow(client);
  return toDto(row);
}
