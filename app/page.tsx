"use client";

import { useMarkets, useGlobalStats } from "@/features/market/hooks/useMarkets";
import { useLivePrices } from "@/features/market/hooks/useLivePrices";
import { Suspense } from "react";

function MarketsContent() {
  const { data: markets, isLoading, error } = useMarkets({ per_page: 50, sparkline: true });
  const { data: global } = useGlobalStats();

  // Watch a few majors for live WS demo (maps to Binance tickers in the client)
  const watchedIds = ["bitcoin", "ethereum", "solana"];
  const live = useLivePrices(watchedIds);

  if (isLoading) {
    return <div className="py-12 text-center text-muted-foreground">Loading market data from CoinGecko (via proxy)...</div>;
  }

  if (error) {
    return (
      <div className="py-12 text-center text-destructive">
        Failed to load markets. Check console and proxy. <button onClick={() => window.location.reload()} className="underline">Retry</button>
      </div>
    );
  }

  const totalCap = global?.data?.total_market_cap?.usd
    ? (global.data.total_market_cap.usd / 1e12).toFixed(2) + "T"
    : "—";

  return (
    <div className="space-y-8">
      {/* Global Stats (simple cards) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-6">
          <div className="text-sm text-muted-foreground">Total Market Cap</div>
          <div className="mt-2 text-3xl font-semibold tabular-nums">{totalCap}</div>
        </div>
        <div className="rounded-xl border bg-card p-6">
          <div className="text-sm text-muted-foreground">Active Cryptocurrencies</div>
          <div className="mt-2 text-3xl font-semibold tabular-nums">
            {global?.data?.active_cryptocurrencies?.toLocaleString() ?? "—"}
          </div>
        </div>
        <div className="rounded-xl border bg-card p-6">
          <div className="text-sm text-muted-foreground">Markets</div>
          <div className="mt-2 text-3xl font-semibold tabular-nums">
            {global?.data?.markets?.toLocaleString() ?? "—"}
          </div>
        </div>
      </div>

      {/* Basic Markets Table (will be replaced by virtualized shadcn version) */}
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full min-w-[800px] text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="p-4">#</th>
              <th className="p-4">Coin</th>
              <th className="p-4 text-right">Price</th>
              <th className="p-4 text-right">24h %</th>
              <th className="p-4 text-right">Market Cap</th>
              <th className="p-4 text-right">Volume (24h)</th>
            </tr>
          </thead>
          <tbody>
            {(markets ?? []).slice(0, 30).map((coin, idx) => {
              const change = coin.price_change_percentage_24h;
              const isUp = (change ?? 0) >= 0;
              return (
                <tr key={coin.id} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="p-4 text-muted-foreground">{coin.market_cap_rank ?? idx + 1}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {coin.image && <img src={coin.image} alt="" className="h-6 w-6 rounded-full" />}
                      <div>
                        <div className="font-medium">{coin.name}</div>
                        <div className="text-xs uppercase text-muted-foreground">{coin.symbol}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-right font-mono tabular-nums">
                    ${ (live[coin.id] ?? coin.current_price)?.toLocaleString() ?? "—" }
                    {watchedIds.includes(coin.id) && (
                      <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 align-middle" title="Live via WS" />
                    )}
                  </td>
                  <td className={`p-4 text-right font-medium tabular-nums ${isUp ? "price-up" : "price-down"}`}>
                    {change != null ? `${isUp ? "+" : ""}${change.toFixed(2)}%` : "—"}
                  </td>
                  <td className="p-4 text-right font-mono tabular-nums">
                    {coin.market_cap ? "$" + (coin.market_cap / 1e9).toFixed(1) + "B" : "—"}
                  </td>
                  <td className="p-4 text-right font-mono tabular-nums">
                    {coin.total_volume ? "$" + (coin.total_volume / 1e9).toFixed(1) + "B" : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Data via CoinGecko proxy • Updates on refresh (real-time WS + virtual table coming next)
      </p>
    </div>
  );
}

export default function CryptoDashboard() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded bg-primary" />
            <span className="text-xl font-semibold tracking-tight">Crypto Dashboard</span>
          </div>
          <div className="text-sm text-muted-foreground">Real-time • Public data (MVP)</div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Markets</h1>
          <p className="mt-2 text-muted-foreground">
            Top coins by market cap • Prices, volume, changes • Foundation for live updates + charts
          </p>
        </div>

        <Suspense fallback={<div className="py-12 text-center text-muted-foreground">Loading...</div>}>
          <MarketsContent />
        </Suspense>
      </main>

      <footer className="border-t py-4 text-center text-xs text-muted-foreground">
        Production-intent senior project • npm + Next.js 16 + TypeScript • Real-time ready
      </footer>
    </div>
  );
}
