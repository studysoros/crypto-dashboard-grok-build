import { NextResponse } from "next/server";
import { getMarkets } from "@/lib/api/coingecko";

/**
 * Proxy for CoinGecko /coins/markets
 * Benefits: caching, rate-limit shielding, no CORS in browser, future key injection.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const vs_currency = searchParams.get("vs_currency") || "usd";
  const per_page = Number(searchParams.get("per_page") || 100);
  const page = Number(searchParams.get("page") || 1);
  const sparkline = searchParams.get("sparkline") !== "false";

  try {
    const data = await getMarkets({
      vs_currency,
      per_page: Math.min(per_page, 250),
      page,
      sparkline,
      price_change_percentage: "24h",
    });

    // Cache on the edge for 30s (balances freshness vs rate limits)
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    console.error("[/api/crypto/markets] error", error);
    return NextResponse.json(
      { error: "Failed to fetch markets" },
      { status: 502 }
    );
  }
}
