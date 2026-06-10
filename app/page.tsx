"use client";

import Link from "next/link";
import { useMarkets, useGlobalStats } from "@/features/market/hooks/useMarkets";
import { useLivePrices } from "@/features/market/hooks/useLivePrices";
import { Suspense, useState, useEffect, useMemo, useRef } from "react";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, StarOff } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
  type ColumnDef,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { CoinMarket } from "@/features/market/schemas";

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

  // Persist watchlist
  useEffect(() => {
    try {
      localStorage.setItem("crypto-watchlist", JSON.stringify(watchlist));
    } catch {}
  }, [watchlist]);

  // For live updates + patching into query cache (useLivePrices subscribes and calls setQueryData)
  const liveCoinIds = useMemo(() => {
    // Always include a few for demo + whatever is in watchlist
    const demo = ["bitcoin", "ethereum", "solana"];
    return Array.from(new Set([...watchlist, ...demo]));
  }, [watchlist]);
  const live = useLivePrices(liveCoinIds); // we mainly call it for the side-effect of live patching

  // Data for the table: apply search + watchlist filter (pre-filter before react-table)
  const dataForTable = useMemo(() => {
    let result = [...markets];

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (c) => c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q)
      );
    }

    if (filterMode === "watchlist") {
      result = result.filter((c) => watchlist.includes(c.id));
    }

    return result;
  }, [markets, search, filterMode, watchlist]);

  // Last updated
  const lastUpdated = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : "—";

  // Column definitions for react-table (enables sorting, custom cells, etc.)
  const columnHelper = createColumnHelper<CoinMarket>();

  const columns = useMemo<ColumnDef<CoinMarket, any>[]>(
    () => [
      columnHelper.accessor("market_cap_rank", {
        id: "rank",
        header: " #",
        cell: (info) => info.getValue() ?? "—",
        enableSorting: true,
      }),
      columnHelper.accessor("name", {
        id: "coin",
        header: "Coin",
        cell: ({ row }) => {
          const coin = row.original;
          return (
            <Link
              href={`/coins/${coin.id}`}
              className="flex items-center gap-3 hover:underline"
            >
              {coin.image && <img src={coin.image} alt="" className="h-6 w-6 rounded-full" />}
              <div>
                <div className="font-medium">{coin.name}</div>
                <div className="text-xs uppercase text-muted-foreground">{coin.symbol}</div>
              </div>
            </Link>
          );
        },
        enableSorting: true,
      }),
      columnHelper.accessor((row) => row.current_price, {
        id: "price",
        header: "Price",
        cell: ({ row }) => {
          const coin = row.original;
          const price = coin.current_price;
          const isWatched = watchlist.includes(coin.id);
          return (
            <>
              ${price?.toLocaleString() ?? "—"}
              {isWatched && (
                <span
                  className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 align-middle"
                  title="Live via WS"
                />
              )}
            </>
          );
        },
        enableSorting: true,
      }),
      columnHelper.accessor("price_change_percentage_24h", {
        id: "change",
        header: "24h %",
        cell: ({ getValue }) => {
          const change = getValue();
          if (change == null) return "—";
          const isUp = change >= 0;
          return (
            <span className={isUp ? "price-up" : "price-down"}>
              {isUp ? "+" : ""}
              {change.toFixed(2)}%
            </span>
          );
        },
        enableSorting: true,
      }),
      columnHelper.accessor("market_cap", {
        id: "market_cap",
        header: "Market Cap",
        cell: (info) =>
          info.getValue() ? "$" + (info.getValue()! / 1e9).toFixed(1) + "B" : "—",
        enableSorting: true,
      }),
      columnHelper.accessor("total_volume", {
        id: "volume",
        header: "Volume (24h)",
        cell: (info) =>
          info.getValue() ? "$" + (info.getValue()! / 1e9).toFixed(1) + "B" : "—",
        enableSorting: true,
      }),
      columnHelper.display({
        id: "watch",
        header: "Watch",
        cell: ({ row }) => {
          const id = row.original.id;
          const isWatched = watchlist.includes(id);
          return (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                setWatchlist((prev) =>
                  prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]
                );
              }}
              aria-label={isWatched ? "Remove from watchlist" : "Add to watchlist"}
            >
              {isWatched ? (
                <Star className="h-4 w-4 fill-current text-yellow-500" />
              ) : (
                <StarOff className="h-4 w-4" />
              )}
            </Button>
          );
        },
        enableSorting: false,
      }),
    ],
    [watchlist]
  );

  // react-table instance (we pre-filter data, let it handle sorting + row model)
  const [sorting, setSorting] = useState<SortingState>([{ id: "market_cap", desc: true }]);

  // Column class helper for desktop-friendly alignment + widths (numeric columns right-aligned)
  // % + table-fixed guarantees th and virtual td cells match exactly and fill the panel.
  // Narrow columns (rank, watch, change) get reduced px to avoid padding eating the width.
  function getColClass(id: string) {
    switch (id) {
      case "rank":
        return "w-[5%] text-center px-2";
      case "coin":
        return "w-[24%]";
      case "price":
        return "text-right tabular-nums w-[15%] pr-5";
      case "change":
        return "text-right tabular-nums w-[8%] px-2 pr-4";
      case "market_cap":
        return "text-right tabular-nums w-[19%] pr-5";
      case "volume":
        return "text-right tabular-nums w-[19%] pr-5";
      case "watch":
        return "w-[4%] text-center pl-1 pr-3";
      default:
        return "";
    }
  }

  const table = useReactTable({
    data: dataForTable,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualSorting: false,
  });

  const { rows } = table.getRowModel();

  // Virtualization
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 52, // approx row height (tune if needed)
    overscan: 8,
  });

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
          Last updated: {lastUpdated} • {dataForTable.length} coins
        </div>
      </div>

      {/* Virtualized + react-table powered Markets Table */}
      <div
        ref={tableContainerRef}
        className="overflow-auto rounded-xl border bg-card"
        style={{ height: "600px" }}
      >
        <table className="w-full table-fixed border-collapse caption-bottom text-sm">
          <TableHeader className="sticky top-0 z-10 bg-card">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const colId = header.column.id;
                  const sortClass = header.column.getCanSort() ? "cursor-pointer select-none" : "";
                  const colClass = getColClass(colId);
                  return (
                    <TableHead
                      key={header.id}
                      className={[sortClass, colClass].filter(Boolean).join(" ")}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                      {{
                        asc: " ↑",
                        desc: " ↓",
                      }[header.column.getIsSorted() as string] ?? null}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              position: "relative",
            }}
          >
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  No coins match your search or filter.
                </TableCell>
              </TableRow>
            ) : (
              virtualizer.getVirtualItems().map((virtualRow) => {
                const row = rows[virtualRow.index];
                return (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="hover:bg-muted/50"
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className={getColClass(cell.column.id)}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </table>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Data via CoinGecko proxy • Click headers to sort • Use search + Watchlist filter • Stars persist in localStorage • Live prices for watched coins • Virtualized for performance
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
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground">Real-time • Public data (MVP)</div>
            <ThemeToggle />
          </div>
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
