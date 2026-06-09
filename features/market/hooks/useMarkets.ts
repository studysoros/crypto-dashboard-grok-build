"use client";

import { useQuery } from "@tanstack/react-query";
import { marketKeys } from "../api/queryKeys";
import type { CoinMarket } from "@/features/market/schemas";

async function fetchMarkets(params?: Record<string, string | number | boolean>): Promise<CoinMarket[]> {
  const search = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([k, v]) => search.set(k, String(v)));
  }
  const res = await fetch(`/api/crypto/markets?${search.toString()}`);
  if (!res.ok) throw new Error("Failed to load markets");
  return res.json();
}

export function useMarkets(params?: { per_page?: number; page?: number; sparkline?: boolean }) {
  return useQuery({
    queryKey: marketKeys.list(params ?? {}),
    queryFn: () => fetchMarkets(params),
    // Data is already reasonably cached at the proxy layer
  });
}

async function fetchGlobal() {
  const res = await fetch("/api/crypto/global");
  if (!res.ok) throw new Error("Failed to load global stats");
  return res.json();
}

export function useGlobalStats() {
  return useQuery({
    queryKey: marketKeys.global(),
    queryFn: fetchGlobal,
  });
}
