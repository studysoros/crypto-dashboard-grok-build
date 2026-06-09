"use client";

import { useQuery } from "@tanstack/react-query";
import { marketKeys } from "@/features/market/api/queryKeys";
import type { OHLCPoint } from "@/features/market/schemas";

async function fetchOHLC(id: string, days: string | number = 7, vs_currency = "usd"): Promise<OHLCPoint[]> {
  const res = await fetch(
    `/api/crypto/ohlc/${id}?days=${days}&vs_currency=${vs_currency}`
  );
  if (!res.ok) throw new Error(`Failed to load OHLC for ${id}`);
  return res.json();
}

export function useOHLC(id: string, days: string | number = 7) {
  return useQuery({
    queryKey: marketKeys.ohlc(id, days),
    queryFn: () => fetchOHLC(id, days),
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}
