"use client";

import { useEffect, useRef } from "react";
import {
  createChart,
  CandlestickSeries,
  LineSeries,
  type IChartApi,
  type ISeriesApi,
  type CandlestickData,
  type Time,
} from "lightweight-charts";
import type { OHLCPoint } from "@/features/market/schemas";

interface PriceChartProps {
  coinId: string;
  data: OHLCPoint[];
  currentPrice?: number | null;
  height?: number;
}

export function PriceChart({ coinId, data, currentPrice, height = 420 }: PriceChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const liveLineRef = useRef<ISeriesApi<"Line"> | null>(null);

  // Normalize OHLC from CoinGecko (time is typically ms; lightweight-charts prefers seconds for most cases)
  const normalized = (data ?? []).map(([time, open, high, low, close]) => ({
    time: Math.floor(time / 1000), // seconds
    open,
    high,
    low,
    close,
  }));

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const chart = createChart(container, {
      width: container.clientWidth,
      height,
      layout: {
        background: { color: "transparent" },
        textColor: "hsl(0 0% 70%)",
      },
      grid: {
        vertLines: { color: "hsl(240 3.7% 15.9%)" },
        horzLines: { color: "hsl(240 3.7% 15.9%)" },
      },
      crosshair: {
        mode: 1, // normal
      },
      timeScale: {
        borderColor: "hsl(240 3.7% 15.9%)",
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: "hsl(240 3.7% 15.9%)",
      },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "hsl(142.1 76.2% 36.3%)",
      downColor: "hsl(0 84.2% 60.2%)",
      borderVisible: false,
      wickUpColor: "hsl(142.1 76.2% 36.3%)",
      wickDownColor: "hsl(0 84.2% 60.2%)",
    });

    // Optional live price line (horizontal-ish, updated on ticks)
    const liveLine = chart.addSeries(LineSeries, {
      color: "hsl(200 80% 60%)",
      lineWidth: 2,
      lineStyle: 2, // dashed
      crosshairMarkerVisible: false,
      lastValueVisible: false,
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    liveLineRef.current = liveLine;

    // Initial data
    if (normalized.length > 0) {
      candleSeries.setData(normalized as CandlestickData<Time>[]);
    }

    // Handle resize
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        chart.resize(entry.contentRect.width, height);
      }
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
      liveLineRef.current = null;
    };
  }, [coinId, height]); // recreate on coin change

  // Update data when OHLC changes (timeframe switch)
  useEffect(() => {
    const series = candleSeriesRef.current;
    if (!series) return;

    if (normalized.length > 0) {
      series.setData(normalized as CandlestickData<Time>[]);
      // Fit content nicely
      chartRef.current?.timeScale().fitContent();
    }
  }, [normalized]);

  // Live price: update the last candle's close + draw a live price line
  useEffect(() => {
    const candleSeries = candleSeriesRef.current;
    const lineSeries = liveLineRef.current;
    const chart = chartRef.current;

    if (!candleSeries || !lineSeries || !chart || !currentPrice || normalized.length === 0) {
      return;
    }

    const last = normalized[normalized.length - 1];
    const updatedLast = {
      ...last,
      close: currentPrice,
      high: Math.max(last.high, currentPrice),
      low: Math.min(last.low, currentPrice),
    };

    // Update only the last point (more efficient than full setData for ticks)
    candleSeries.update(updatedLast as CandlestickData<Time>);

    // Draw a simple live price reference line across the chart
    // (lightweight-charts line series with two points at current price)
    const timeScale = chart.timeScale();
    const visibleRange = timeScale.getVisibleRange();

    if (visibleRange) {
      lineSeries.setData([
        { time: visibleRange.from, value: currentPrice },
        { time: visibleRange.to, value: currentPrice },
      ]);
    }
  }, [currentPrice, normalized]);

  return (
    <div
      ref={containerRef}
      className="w-full rounded-lg border bg-card/50"
      style={{ height }}
    />
  );
}
