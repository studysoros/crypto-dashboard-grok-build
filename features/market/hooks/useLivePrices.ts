"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { cryptoWS, type PriceUpdate } from "@/lib/ws/client";
import { marketKeys } from "../api/queryKeys";
import type { CoinMarket } from "@/features/market/schemas";

/**
 * useLivePrices
 * Subscribes to WS and:
 *  - Returns a map of live prices for quick overlay in components
 *  - Patches matching TanStack Query cache entries (so table cells using query data update live)
 */
export function useLivePrices(coinIds: string[] = []) {
  const queryClient = useQueryClient();
  const [livePrices, setLivePrices] = useState<Record<string, number>>({});

  useEffect(() => {
    if (coinIds.length === 0) return;

    const unsubscribe = cryptoWS.subscribe((update: PriceUpdate) => {
      // Only care about coins we are watching
      if (!coinIds.includes(update.id)) return;

      setLivePrices((prev) => ({ ...prev, [update.id]: update.price }));

      // Patch any cached market list entries that contain this coin
      queryClient.setQueriesData(
        { queryKey: marketKeys.lists() },
        (old: CoinMarket[] | undefined) => {
          if (!old) return old;
          return old.map((c) =>
            c.id === update.id ? { ...c, current_price: update.price } : c
          );
        }
      );
    });

    // Ensure connection is alive
    // (connect is idempotent inside the client)

    return unsubscribe;
  }, [coinIds, queryClient]);

  return livePrices;
}
