import { useQuery } from "@tanstack/react-query";
import { config } from "@/shared/lib/config";
import { fetcher } from "@/shared/lib/fetcher";

type HealthResponse = {
  ok: boolean;
  devLoginEnabled?: boolean;
};

export function useDevLoginEnabled() {
  return useQuery({
    queryKey: ["app", "dev-login"],
    queryFn: () => fetcher.get<HealthResponse>(`${config.apiUrl}/health`),
    select: (data) => data.devLoginEnabled === true,
    staleTime: Number.POSITIVE_INFINITY,
  });
}
