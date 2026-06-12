import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { HotelBrandingInput } from "@/modules/settings/domain/contracts";
import { hotelBrandingApi } from "./client";

export const hotelBrandingKeys = {
  all: ["hotel-branding"] as const,
};

export function useHotelBrandingQuery(enabled = true) {
  return useQuery({
    queryKey: hotelBrandingKeys.all,
    queryFn: () => hotelBrandingApi.get(),
    enabled,
    staleTime: 60_000,
  });
}

export function useUpdateHotelBranding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: HotelBrandingInput) => hotelBrandingApi.update(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: hotelBrandingKeys.all });
    },
  });
}
