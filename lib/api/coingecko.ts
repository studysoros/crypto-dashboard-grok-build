/**
 * CoinGecko typed client (used by both server proxies and future direct calls).
 * All external calls should go through the Next.js API routes for caching, rate limiting, and key hiding.
 */

import { z } from "zod";
import { env } from "@/config/env";
import {
  CoinMarketSchema,
  GlobalMarketDataSchema,
  OHLCResponseSchema,
  type CoinMarket,
  type GlobalMarketData,
  type OHLCPoint,
} from "@/features/market/schemas";

const BASE = "https://api.coingecko.com/api/v3";

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.headers || {}),
    },
    // Reasonable timeout for demo (can improve with AbortController)
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`CoinGecko error ${res.status}: ${text || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

/** Public market data for top coins (used by the table) */
export async function getMarkets(params?: {
  vs_currency?: string;
  per_page?: number;
  page?: number;
  sparkline?: boolean;
  price_change_percentage?: string;
}): Promise<CoinMarket[]> {
  const search = new URLSearchParams({
    vs_currency: params?.vs_currency ?? "usd",
    per_page: String(params?.per_page ?? 100),
    page: String(params?.page ?? 1),
    sparkline: String(params?.sparkline ?? true),
    price_change_percentage: params?.price_change_percentage ?? "24h",
  });

  const data = await fetchJson<unknown>(`${BASE}/coins/markets?${search.toString()}`);
  const parsed = z.array(CoinMarketSchema).parse(data);
  return parsed;
}

/** Global market stats (total cap, dominance, etc.) */
export async function getGlobal(): Promise<GlobalMarketData> {
  const data = await fetchJson<unknown>(`${BASE}/global`);
  return GlobalMarketDataSchema.parse(data);
}

/** Simple coin detail (for header info) */
export async function getCoin(id: string) {
  const data = await fetchJson<unknown>(
    `${BASE}/coins/${id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`
  );
  // Light validation — extend schema as needed
  return data as any;
}

/** OHLC / candlestick data. CoinGecko returns array of [time, o, h, l, c] */
export async function getOHLC(
  id: string,
  vs_currency = "usd",
  days: 1 | 7 | 14 | 30 | 90 | 180 | 365 | "max" = 7
): Promise<OHLCPoint[]> {
  const data = await fetchJson<unknown>(
    `${BASE}/coins/${id}/ohlc?vs_currency=${vs_currency}&days=${days}`
  );
  return OHLCResponseSchema.parse(data);
}

// Re-export schemas/types for convenience
export { CoinMarketSchema, GlobalMarketDataSchema, OHLCResponseSchema };
