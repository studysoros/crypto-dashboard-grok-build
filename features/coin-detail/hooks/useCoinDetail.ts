"use client";

import { useQuery } from "@tanstack/react-query";
import { marketKeys } from "@/features/market/api/queryKeys";

async function fetchCoinDetail(id: string) {
  const res = await fetch(`/api/crypto/coin/${id}`);
  if (!res.ok) throw new Error(`Failed to load coin ${id}`);
  return res.json();
}

export function useCoinDetail(id: string) {
  return useQuery({
    queryKey: marketKeys.detail(id),
    queryFn: () => fetchCoinDetail(id),
    enabled: !!id,
    staleTime: 60 * 1000, // coin metadata doesn't change often
  });
}
