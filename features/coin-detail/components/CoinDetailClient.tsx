"use client";

import * as React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useCoinDetail } from "@/features/coin-detail/hooks/useCoinDetail";
import { useOHLC } from "@/features/coin-detail/hooks/useOHLC";
import { useLivePrices } from "@/features/market/hooks/useLivePrices";
import type { OHLCPoint } from "@/features/market/schemas";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/theme-toggle";

// Heavy chart loaded only on client
const PriceChart = dynamic(
  () =>
    import("./PriceChart").then((m) => ({
      default: m.PriceChart,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[420px] w-full items-center justify-center rounded-lg border bg-card/50 text-muted-foreground">
        Loading interactive chart...
      </div>
    ),
  }
);

const TIMEFRAMES = [
  { label: "1D", value: 1 },
  { label: "7D", value: 7 },
  { label: "30D", value: 30 },
  { label: "90D", value: 90 },
  { label: "1Y", value: 365 },
] as const;

interface Props {
  id: string;
}

export function CoinDetailClient({ id }: Props) {
  const { data: coin, isLoading: coinLoading } = useCoinDetail(id);
  const [days, setDays] = React.useState<(typeof TIMEFRAMES)[number]["value"]>(7);
  const { data: ohlc, isLoading: ohlcLoading } = useOHLC(id, days);

  const livePrices = useLivePrices([id]);
  const livePrice = livePrices[id];

  const currentPrice =
    livePrice ??
    coin?.market_data?.current_price?.usd ??
    coin?.market_data?.current_price?.["usd"];

  const name = coin?.name || id;
  const symbol = (coin?.symbol || "").toUpperCase();

  const marketCap = coin?.market_data?.market_cap?.usd;
  const change24h = coin?.market_data?.price_change_percentage_24h;

  if (coinLoading && !coin) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-10 space-y-8">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-6 w-24" />
          </div>
        </div>
        <Skeleton className="h-[440px] w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to Markets
        </Link>
        <div className="flex items-center gap-3">
          <div className="text-xs text-muted-foreground">ID: {id}</div>
          <ThemeToggle />
        </div>
      </div>

      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-4">
          {coin?.image?.large && (
            <img
              src={coin.image.large}
              alt={name}
              className="h-12 w-12 rounded-full"
            />
          )}
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              {name} <span className="text-muted-foreground">{symbol}</span>
            </h1>
            <div className="mt-1 flex items-baseline gap-3">
              <span className="font-mono text-2xl tabular-nums">
                {currentPrice ? `$${currentPrice.toLocaleString()}` : "—"}
              </span>
              {typeof change24h === "number" && (
                <Badge
                  variant="outline"
                  className={
                    change24h >= 0
                      ? "border-emerald-500/30 text-emerald-500"
                      : "border-red-500/30 text-red-500"
                  }
                >
                  {change24h >= 0 ? "+" : ""}
                  {change24h.toFixed(2)}% (24h)
                </Badge>
              )}
            </div>
          </div>
        </div>

        {marketCap && (
          <div className="text-right text-sm text-muted-foreground">
            Market Cap{" "}
            <span className="font-mono tabular-nums text-foreground">
              ${(marketCap / 1e9).toFixed(1)}B
            </span>
          </div>
        )}
      </div>

      {/* Timeframe selector + Chart */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="mr-2 text-sm text-muted-foreground">Chart</span>
        {TIMEFRAMES.map((tf) => (
          <Button
            key={tf.value}
            variant={days === tf.value ? "default" : "outline"}
            size="sm"
            onClick={() => setDays(tf.value)}
          >
            {tf.label}
          </Button>
        ))}
        <span className="ml-auto text-xs text-muted-foreground">
          Live updates via WS when available
        </span>
      </div>

      <Card>
        <CardContent className="p-4">
          <PriceChart
            coinId={id}
            data={(ohlc as OHLCPoint[] | undefined) ?? []}
            currentPrice={currentPrice}
            height={440}
          />
        </CardContent>
      </Card>

      <div className="mt-4 text-xs text-muted-foreground">
        Data provided by CoinGecko (proxied). Candlestick chart powered by TradingView Lightweight Charts.
        {livePrice && " • Price is updating live."}
      </div>

      {/* Simple description / extra info */}
      {coin?.description?.en && (
        <div className="mt-8 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          <p>{coin.description.en.replace(/<[^>]+>/g, "").slice(0, 420)}...</p>
        </div>
      )}
    </div>
  );
}
