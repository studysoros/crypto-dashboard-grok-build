import { z } from "zod";

// Zod schemas for CoinGecko responses (runtime validation + TS inference)

export const CoinMarketSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  name: z.string(),
  image: z.string().url().or(z.string()),
  current_price: z.number().nullable(),
  market_cap: z.number().nullable(),
  market_cap_rank: z.number().nullable(),
  fully_diluted_valuation: z.number().nullable(),
  total_volume: z.number().nullable(),
  high_24h: z.number().nullable(),
  low_24h: z.number().nullable(),
  price_change_24h: z.number().nullable(),
  price_change_percentage_24h: z.number().nullable(),
  market_cap_change_24h: z.number().nullable(),
  market_cap_change_percentage_24h: z.number().nullable(),
  circulating_supply: z.number().nullable(),
  total_supply: z.number().nullable(),
  max_supply: z.number().nullable(),
  ath: z.number().nullable(),
  ath_change_percentage: z.number().nullable(),
  ath_date: z.string().nullable(),
  atl: z.number().nullable(),
  atl_change_percentage: z.number().nullable(),
  atl_date: z.string().nullable(),
  roi: z.unknown().nullable(),
  last_updated: z.string(),
  sparkline_in_7d: z
    .object({
      price: z.array(z.number()),
    })
    .nullable()
    .optional(),
});

export const GlobalMarketDataSchema = z.object({
  data: z.object({
    active_cryptocurrencies: z.number(),
    upcoming_icos: z.number(),
    ongoing_icos: z.number(),
    ended_icos: z.number(),
    markets: z.number(),
    total_market_cap: z.record(z.string(), z.number()),
    total_volume: z.record(z.string(), z.number()),
    market_cap_percentage: z.record(z.string(), z.number()),
    market_cap_change_percentage_24h_usd: z.number(),
    updated_at: z.number(),
  }),
});

export const OHLCResponseSchema = z.array(
  z.tuple([
    z.number(), // timestamp (unix ms or seconds depending on endpoint)
    z.number(), // open
    z.number(), // high
    z.number(), // low
    z.number(), // close
  ])
);

// Inferred types (single source of truth)
export type CoinMarket = z.infer<typeof CoinMarketSchema>;
export type GlobalMarketData = z.infer<typeof GlobalMarketDataSchema>;
export type OHLCPoint = z.infer<typeof OHLCResponseSchema>[number];
