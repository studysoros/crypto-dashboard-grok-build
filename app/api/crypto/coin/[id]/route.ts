import { NextResponse } from "next/server";
import { getCoin } from "@/lib/api/coingecko";

/**
 * Proxy for individual coin details.
 * Caches moderately since metadata changes infrequently.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const data = await getCoin(id);
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error(`[/api/crypto/coin/${id}] error`, error);
    return NextResponse.json(
      { error: "Failed to fetch coin details" },
      { status: 502 }
    );
  }
}
