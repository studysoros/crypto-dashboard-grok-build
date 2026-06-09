# Crypto Dashboard

**Senior-level, scalable, maintainable real-time cryptocurrency market dashboard.**

Production intent from day one. Built with modern 2026 best practices for data-heavy dashboards.

> **MVP Focus (Phase 1):** Public markets overview, live price table, basic interactive charts, resilient real-time updates. No auth or persistent user data yet (localStorage only for UI prefs).

## Tech Stack (Chosen for Scale + DX)

- **Next.js 16** (App Router, Turbopack, React 19) + TypeScript (strict)
- **npm** (as requested) + future npm workspaces path documented
- **Tailwind 4 + shadcn/ui** (dark-first, accessible)
- **TanStack Query** (server state, caching, background sync)
- **Zustand** (light client state)
- **lightweight-charts** (TradingView — financial candlesticks + streaming)
- **TanStack Table + Virtual** (high-perf large tables)
- **Zod** (schemas + runtime validation)
- **CoinGecko** (REST + WebSocket) proxied via Next Route Handlers
- Tooling: ESLint, typecheck, Vitest/MSW (planned), Playwright, GitHub Actions, Vercel

See the full rationale and architecture in the implementation plan (internal session `plan.md`).

## Getting Started

```bash
# Install (already done after scaffold + core deps)
npm install

# Run dev server (with hot reload)
npm run dev

# Type check (strict)
npm run typecheck

# Build for production
npm run build

# Lint
npm run lint
```

Open http://localhost:3000 — you will see the current markets shell while features are implemented.

## Project Structure (Feature-Sliced / Senior Patterns)

```
app/                  # Next App Router routes + API proxies
features/market/      # Vertical slice: components, hooks, api, types for markets
lib/                  # Shared: ws client, utils (cn), api clients, formatters
providers/            # QueryClient, Theme, etc.
config/               # env (Zod validated), constants
components/ui/        # shadcn primitives (owned)
types/ schemas/       # Shared domain + Zod
```

**Key design decisions** (see plan for details):
- All external data proxied (rate limits, caching, future keys).
- WS updates patch TanStack Query cache for instant consistent UI.
- Real-time has polling fallback + reconnect logic.
- No premature monorepo; clean structure ready for Turborepo + npm workspaces.

## Current Status & Roadmap

**MVP (in progress):**
- [x] Next.js 16 + TS strict + npm + core libs + providers + dark theme
- [x] CoinGecko proxies + Zod schemas + typed fetchers
- [x] TanStack Query hooks for markets/global
- [x] Resilient WS live prices (CoinGecko/Binance public) + query sync
- [x] Markets table + stats cards (with links to detail)
- [x] Coin detail page with lightweight-charts (candles + live + timeframes)
- [ ] Polish, virtualized table, tests, CI, README + ADRs

**Post-MVP (documented, not started):**
- Persistent watchlist/portfolio (Supabase or equivalent)
- Price alerts, news, advanced indicators
- Performance hardening (Redis, dedicated WS, etc.)
- Full test coverage + e2e

## Verification (from plan)

After major milestones run:
- `npm run typecheck`
- `npm run build`
- `npm run dev` + manual browser checks for data + live updates
- Basic tests (when added)

See the detailed **Verification Plan** section in the session plan file.

## Contributing / Philosophy

This is intended as a senior portfolio/production-grade codebase:
- Type safety and clear boundaries first
- Performance for 1000+ coins and live updates
- Resilient to flaky public APIs
- Easy to extend (portfolio, alerts, multi-chain)

Questions or scope changes? Update the plan or discuss before large refactors.

## Deploy

Recommended: Vercel (zero-config for Next.js).

```bash
npm run build
# Push to GitHub → connect on Vercel
```

---

**Built following the approved implementation plan.** All major decisions (stack, real-time strategy, folder structure, verification) are documented there for maintainability.
