import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useMarkets, useGlobalStats } from '@/features/market/hooks/useMarkets'
import { describe, it, expect } from 'vitest'
import React from 'react'

// Wrapper to provide QueryClient for hooks
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Disable retries in tests
      },
    },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useMarkets', () => {
  it('fetches and returns market data via the proxy', async () => {
    const { result } = renderHook(() => useMarkets({ per_page: 10 }), {
      wrapper: createWrapper(),
    })

    // Initially loading
    expect(result.current.isLoading).toBe(true)

    // Wait for data
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toHaveLength(2) // from our mock
    expect(result.current.data?.[0].id).toBe('bitcoin')
    expect(result.current.data?.[0].current_price).toBe(65000)
  })
})

describe('useGlobalStats', () => {
  it('fetches global market stats', async () => {
    const { result } = renderHook(() => useGlobalStats(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.data.active_cryptocurrencies).toBe(14000)
    expect(result.current.data?.data.total_market_cap.usd).toBe(2400000000000)
  })
})