import { NextResponse } from "next/server";
import { getGlobal } from "@/lib/api/coingecko";

export async function GET() {
  try {
    const data = await getGlobal();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    console.error("[/api/crypto/global] error", error);
    return NextResponse.json(
      { error: "Failed to fetch global data" },
      { status: 502 }
    );
  }
}
