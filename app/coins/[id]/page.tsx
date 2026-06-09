import { Suspense } from "react";
import { CoinDetailClient } from "@/features/coin-detail/components/CoinDetailClient";

// Thin server component — awaits the dynamic route params (Next 16+ async params pattern).
// All heavy client interactivity (state, hooks, live WS, chart) is inside CoinDetailClient.
export default async function CoinDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-5xl px-6 py-10 text-muted-foreground">
          Loading coin...
        </div>
      }
    >
      <CoinDetailClient id={id} />
    </Suspense>
  );
}
