import type {
  HotelBrandingDTO,
  HotelBrandingInput,
} from "@/modules/settings/domain/contracts";
import { config } from "@/shared/lib/config";
import { fetcher } from "@/shared/lib/fetcher";

const base = `${config.apiUrl}/hotel/settings`;

export const hotelBrandingApi = {
  get() {
    return fetcher.get<HotelBrandingDTO>(`${base}/branding`);
  },
  update(input: HotelBrandingInput) {
    return fetcher.put<HotelBrandingDTO>(`${base}/branding`, input);
  },
};

export type { HotelBrandingDTO };
