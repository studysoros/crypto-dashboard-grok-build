import { NextResponse } from "next/server";
import { getOHLC } from "@/lib/api/coingecko";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(_request.url);
  const vs = searchParams.get("vs_currency") || "usd";
  const daysParam = searchParams.get("days") || "7";
  const days = (["1", "7", "14", "30", "90", "180", "365", "max"].includes(daysParam)
    ? daysParam
    : "7") as any;

  try {
    const data = await getOHLC(id, vs, days);
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error(`[/api/crypto/ohlc/${id}] error`, error);
    return NextResponse.json(
      { error: "Failed to fetch OHLC data" },
      { status: 502 }
    );
  }
}
