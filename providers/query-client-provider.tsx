"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { useState } from "react"

export function QueryClientProviderWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  // Create a new QueryClient instance per request in RSC, but since client provider we use state
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Market data: reasonably fresh, background updates good for dashboard
            staleTime: 15 * 1000, // 15s
            gcTime: 5 * 60 * 1000, // 5 min
            refetchOnWindowFocus: false,
            retry: 2,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
