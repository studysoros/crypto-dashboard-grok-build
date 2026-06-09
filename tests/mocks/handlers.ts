import { http, HttpResponse } from 'msw'

// Sample data matching our Zod schemas and expected responses
const sampleMarkets = [
  {
    id: 'bitcoin',
    symbol: 'btc',
    name: 'Bitcoin',
    image: 'https://example.com/btc.png',
    current_price: 65000,
    market_cap: 1280000000000,
    market_cap_rank: 1,
    fully_diluted_valuation: null,
    total_volume: 25000000000,
    high_24h: 66000,
    low_24h: 64000,
    price_change_24h: 500,
    price_change_percentage_24h: 0.78,
    market_cap_change_24h: 10000000000,
    market_cap_change_percentage_24h: 0.79,
    circulating_supply: 19700000,
    total_supply: 19700000,
    max_supply: 21000000,
    ath: 73750,
    ath_change_percentage: -11.8,
    ath_date: '2024-03-14T07:00:00.000Z',
    atl: 67.81,
    atl_change_percentage: 95800,
    atl_date: '2013-07-06T00:00:00.000Z',
    roi: null,
    last_updated: '2025-01-01T00:00:00.000Z',
    sparkline_in_7d: { price: [64000, 65000, 65500] },
  },
  {
    id: 'ethereum',
    symbol: 'eth',
    name: 'Ethereum',
    image: 'https://example.com/eth.png',
    current_price: 3200,
    market_cap: 385000000000,
    market_cap_rank: 2,
    fully_diluted_valuation: null,
    total_volume: 15000000000,
    high_24h: 3250,
    low_24h: 3100,
    price_change_24h: 80,
    price_change_percentage_24h: 2.56,
    market_cap_change_24h: 9500000000,
    market_cap_change_percentage_24h: 2.53,
    circulating_supply: 120300000,
    total_supply: null,
    max_supply: null,
    ath: 4891.7,
    ath_change_percentage: -34.5,
    ath_date: '2021-11-10T14:00:00.000Z',
    atl: 0.432979,
    atl_change_percentage: 739000,
    atl_date: '2015-10-20T00:00:00.000Z',
    roi: null,
    last_updated: '2025-01-01T00:00:00.000Z',
    sparkline_in_7d: { price: [3100, 3150, 3200] },
  },
]

const sampleGlobal = {
  data: {
    active_cryptocurrencies: 14000,
    upcoming_icos: 0,
    ongoing_icos: 0,
    ended_icos: 0,
    markets: 1200,
    total_market_cap: { usd: 2400000000000 },
    total_volume: { usd: 85000000000 },
    market_cap_percentage: { btc: 53.2, eth: 16.1 },
    market_cap_change_percentage_24h_usd: 1.2,
    updated_at: 1735689600,
  },
}

const sampleOHLC = [
  [1735603200000, 64000, 65500, 63800, 65000],
  [1735689600000, 65000, 66200, 64800, 65500],
]

const sampleCoin = {
  id: 'bitcoin',
  symbol: 'btc',
  name: 'Bitcoin',
  description: { en: 'Bitcoin is a decentralized digital currency...' },
  image: { large: 'https://example.com/btc-large.png' },
  market_data: {
    current_price: { usd: 65000 },
    market_cap: { usd: 1280000000000 },
    total_volume: { usd: 25000000000 },
    price_change_percentage_24h: 0.78,
  },
}

export const handlers = [
  // Markets list
  http.get('/api/crypto/markets', ({ request }) => {
    const url = new URL(request.url)
    const perPage = parseInt(url.searchParams.get('per_page') || '100')
    return HttpResponse.json(sampleMarkets.slice(0, perPage))
  }),

  // Global stats
  http.get('/api/crypto/global', () => {
    return HttpResponse.json(sampleGlobal)
  }),

  // OHLC for a coin
  http.get('/api/crypto/ohlc/:id', () => {
    return HttpResponse.json(sampleOHLC)
  }),

  // Individual coin details
  http.get('/api/crypto/coin/:id', ({ params }) => {
    const { id } = params
    if (id === 'bitcoin') {
      return HttpResponse.json(sampleCoin)
    }
    return HttpResponse.json({ ...sampleCoin, id, name: 'Unknown Coin' })
  }),
]