"use client";

import Link from "next/link";
import { useMarkets, useGlobalStats } from "@/features/market/hooks/useMarkets";
import { useLivePrices } from "@/features/market/hooks/useLivePrices";
import { Suspense, useState, useEffect, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, StarOff } from "lucide-react";

function MarketsContent() {
  const { data: markets = [], isLoading, error, dataUpdatedAt } = useMarkets({ per_page: 100, sparkline: true });
  const { data: global } = useGlobalStats();

  // Local watchlist persisted in localStorage (MVP scope - no backend yet)
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("crypto-watchlist");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [search, setSearch] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "watchlist">("all");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "market_cap",
    direction: "desc",
  });

  // Persist watchlist
  useEffect(() => {
    try {
      localStorage.setItem("crypto-watchlist", JSON.stringify(watchlist));
    } catch {}
  }, [watchlist]);

  const toggleWatch = (id: string) => {
    setWatchlist((prev) =>
      prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]
    );
  };

  // Live prices for watchlist coins (and a few defaults for demo)
  const liveCoins = useMemo(() => {
    const ids = new Set([...watchlist, "bitcoin", "ethereum", "solana"]);
    return Array.from(ids);
  }, [watchlist]);

  const live = useLivePrices(liveCoins);

  // Client-side filtered + sorted data
  const processedMarkets = useMemo(() => {
    let result = [...markets];

    // Filter by search
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.symbol.toLowerCase().includes(q)
      );
    }

    // Filter by watchlist
    if (filterMode === "watchlist") {
      result = result.filter((c) => watchlist.includes(c.id));
    }

    // Sort (stable, handles mixed types safely)
    result.sort((a, b) => {
      const dir = sortConfig.direction === "asc" ? 1 : -1;

      switch (sortConfig.key) {
        case "price": {
          const va = live[a.id] ?? a.current_price ?? 0;
          const vb = live[b.id] ?? b.current_price ?? 0;
          return (va - vb) * dir;
        }
        case "change": {
          const va = a.price_change_percentage_24h ?? 0;
          const vb = b.price_change_percentage_24h ?? 0;
          return (va - vb) * dir;
        }
        case "market_cap": {
          const va = a.market_cap ?? 0;
          const vb = b.market_cap ?? 0;
          return (va - vb) * dir;
        }
        case "volume": {
          const va = a.total_volume ?? 0;
          const vb = b.total_volume ?? 0;
          return (va - vb) * dir;
        }
        case "name": {
          const va = a.name.toLowerCase();
          const vb = b.name.toLowerCase();
          return va.localeCompare(vb) * dir;
        }
        default: {
          const va = a.market_cap_rank ?? 9999;
          const vb = b.market_cap_rank ?? 9999;
          return (va - vb) * dir;
        }
      }
    });

    return result;
  }, [markets, search, filterMode, watchlist, live, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "desc" }
    );
  };

  const getSortIndicator = (key: string) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? " ↑" : " ↓";
  };

  // Last updated
  const lastUpdated = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : "—";

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="overflow-x-auto rounded-xl border bg-card p-4">
          <Skeleton className="h-10 w-full mb-4" />
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full mb-2" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Failed to load markets</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Could not fetch data from CoinGecko via our proxy. This is usually temporary.
          </p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const totalCap = global?.data?.total_market_cap?.usd
    ? (global.data.total_market_cap.usd / 1e12).toFixed(2) + "T"
    : "—";

  return (
    <div className="space-y-8">
      {/* Global Stats - now using shadcn Card */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Market Cap</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">{totalCap}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Cryptocurrencies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">
              {global?.data?.active_cryptocurrencies?.toLocaleString() ?? "—"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Markets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">
              {global?.data?.markets?.toLocaleString() ?? "—"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls: Search + Filters + Last updated */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <Input
            placeholder="Search coins (name or symbol)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <div className="flex gap-1">
            <Button
              variant={filterMode === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterMode("all")}
            >
              All
            </Button>
            <Button
              variant={filterMode === "watchlist" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterMode("watchlist")}
              disabled={watchlist.length === 0}
            >
              Watchlist ({watchlist.length})
            </Button>
          </div>
        </div>
        <div className="text-xs text-muted-foreground tabular-nums">
          Last updated: {lastUpdated} • {processedMarkets.length} coins
        </div>
      </div>

      {/* Polished Markets Table using shadcn + client sort/filter + watchlist */}
      <div className="overflow-x-auto rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px] cursor-pointer" onClick={() => handleSort("rank")}>
                # {getSortIndicator("rank")}
              </TableHead>
              <TableHead className="cursor-pointer min-w-[180px]" onClick={() => handleSort("name")}>
                Coin {getSortIndicator("name")}
              </TableHead>
              <TableHead className="text-right cursor-pointer" onClick={() => handleSort("price")}>
                Price {getSortIndicator("price")}
              </TableHead>
              <TableHead className="text-right cursor-pointer" onClick={() => handleSort("change")}>
                24h % {getSortIndicator("change")}
              </TableHead>
              <TableHead className="text-right cursor-pointer" onClick={() => handleSort("market_cap")}>
                Market Cap {getSortIndicator("market_cap")}
              </TableHead>
              <TableHead className="text-right cursor-pointer" onClick={() => handleSort("volume")}>
                Volume (24h) {getSortIndicator("volume")}
              </TableHead>
              <TableHead className="w-[60px] text-center">Watch</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {processedMarkets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No coins match your search or filter.
                </TableCell>
              </TableRow>
            ) : (
              processedMarkets.slice(0, 50).map((coin, idx) => {
                const change = coin.price_change_percentage_24h;
                const isUp = (change ?? 0) >= 0;
                const isWatched = watchlist.includes(coin.id);
                const price = live[coin.id] ?? coin.current_price;

                return (
                  <TableRow key={coin.id} className="hover:bg-muted/50">
                    <TableCell className="text-muted-foreground">
                      {coin.market_cap_rank ?? idx + 1}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/coins/${coin.id}`}
                        className="flex items-center gap-3 hover:underline"
                      >
                        {coin.image && (
                          <img src={coin.image} alt="" className="h-6 w-6 rounded-full" />
                        )}
                        <div>
                          <div className="font-medium">{coin.name}</div>
                          <div className="text-xs uppercase text-muted-foreground">
                            {coin.symbol}
                          </div>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      ${price?.toLocaleString() ?? "—"}
                      {(isWatched || ["bitcoin", "ethereum", "solana"].includes(coin.id)) && (
                        <span
                          className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 align-middle"
                          title="Live via WS"
                        />
                      )}
                    </TableCell>
                    <TableCell
                      className={`text-right font-medium tabular-nums ${
                        isUp ? "price-up" : "price-down"
                      }`}
                    >
                      {change != null ? `${isUp ? "+" : ""}${change.toFixed(2)}%` : "—"}
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      {coin.market_cap
                        ? "$" + (coin.market_cap / 1e9).toFixed(1) + "B"
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      {coin.total_volume
                        ? "$" + (coin.total_volume / 1e9).toFixed(1) + "B"
                        : "—"}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWatch(coin.id);
                        }}
                        aria-label={isWatched ? "Remove from watchlist" : "Add to watchlist"}
                      >
                        {isWatched ? (
                          <Star className="h-4 w-4 fill-current text-yellow-500" />
                        ) : (
                          <StarOff className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Data via CoinGecko proxy • Click headers to sort • Use search + Watchlist filter • Stars persist in localStorage • Live prices for watched coins
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
