/**
 * Resilient WebSocket client for real-time crypto prices.
 *
 * MVP strategy:
 * - Primary: CoinGecko WS (when available / paid tier) or public exchange streams.
 * - For immediate working demo we use Binance combined ticker stream (public, no key).
 * - On message: callers can subscribe and receive normalized price updates.
 * - Automatic reconnect with backoff + fallback polling hook (see useLivePrices).
 *
 * This is intentionally a small, focused service you can swap the underlying URL/parsers for.
 */

export type PriceUpdate = {
  id: string; // coin id or symbol we normalize to (e.g. "bitcoin")
  price: number;
  timestamp: number;
};

type Listener = (update: PriceUpdate) => void;

class CryptoWSClient {
  private ws: WebSocket | null = null;
  private listeners = new Set<Listener>();
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private isDestroyed = false;

  // Binance public stream for demo (tickers for many symbols).
  // We map common symbols -> our internal ids in the hook.
  private readonly url = "wss://stream.binance.com:9443/ws/!ticker@arr";

  connect() {
    if (this.ws || this.isDestroyed) return;

    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.info("[WS] Connected to Binance stream");
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      try {
        const arr = JSON.parse(event.data);
        if (!Array.isArray(arr)) return;

        for (const t of arr) {
          // t.s = symbol e.g. BTCUSDT, t.c = close/current price
          if (!t?.s || !t?.c) continue;
          const symbol = t.s.toLowerCase();
          // Normalize a few majors we care about for demo (extend as needed)
          const idMap: Record<string, string> = {
            btcusdt: "bitcoin",
            ethusdt: "ethereum",
            solusdt: "solana",
            dogeusdt: "dogecoin",
            xrpusdt: "ripple",
          };
          const id = idMap[symbol] || symbol.replace("usdt", "");
          const price = parseFloat(t.c);
          if (!Number.isFinite(price)) continue;

          const update: PriceUpdate = { id, price, timestamp: Date.now() };
          this.listeners.forEach((l) => l(update));
        }
      } catch (e) {
        // ignore parse noise
      }
    };

    this.ws.onerror = (e) => {
      console.warn("[WS] error", e);
    };

    this.ws.onclose = () => {
      this.ws = null;
      if (!this.isDestroyed) this.scheduleReconnect();
    };
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    const delay = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), 30000);
    this.reconnectAttempts += 1;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    if (!this.ws) this.connect();
    return () => {
      this.listeners.delete(listener);
      if (this.listeners.size === 0) this.disconnect();
    };
  }

  private disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  destroy() {
    this.isDestroyed = true;
    this.disconnect();
    this.listeners.clear();
  }
}

// Singleton for the app
export const cryptoWS = new CryptoWSClient();
