# Senior-Level Coding Style for this Project

This document defines the expected **coding style and architectural patterns** for the crypto-dashboard project. The goal is maintainable, scalable, readable, and testable code that a senior engineer would be proud to review, maintain, or hand off.

All agents (Grok Build, Claude, etc.) and human contributors must follow these patterns.

> **Complements** `docs/commit-style.md`. Good commits are useless if the code itself is messy.

## Core Principles

1. **Feature-Sliced Architecture** (Vertical Slices)
   - Organize by **domain/feature**, not by technical layers.
   - Preferred structure:
     ```
     features/
       market/
         components/
         hooks/
         api/           # feature-specific data access
         schemas.ts     # Zod + inferred types
       coin-detail/
         components/
         hooks/
     lib/               # truly shared utilities (formatters, cn, ws client, etc.)
     components/ui/     # shadcn primitives (owned, not a black box)
     ```
   - A feature should be movable or deletable with minimal impact on other code.

2. **Clear Separation of Concerns**
   - **Data layer** (`lib/api/`, feature `api/`, proxies): responsible for fetching, validation (Zod), transformation, caching strategy.
   - **State orchestration** (hooks): TanStack Query for server state, Zustand for client-only UI state.
   - **Presentation** (components/pages): dumb as possible, receive data via props or hooks.
   - Pages and top-level components should mostly orchestrate — heavy logic lives in hooks or services.

3. **Type Safety First**
   - Strict TypeScript (`tsconfig` is already strict).
   - **Zod schemas** are the source of truth for any data coming from outside (APIs, localStorage, etc.).
   - Prefer `z.infer<typeof Schema>` over hand-written interfaces for external data.
   - Never use `any` except in the rarest justified cases (and document why).

4. **Server State vs Client State**
   - **TanStack Query** (`@tanstack/react-query`) is the default for anything that comes from an API or needs caching, background refetching, optimistic updates, or synchronization.
     - Use `queryClient.setQueryData(...)` to apply live updates from WebSockets instead of maintaining parallel state.
   - **Zustand** only for purely client-side, ephemeral, or non-serializable UI state (selected timeframe in a modal, drag state, local filters that shouldn't survive a refresh unless explicitly persisted).
   - Avoid Redux, Jotai, or Context for server data.

5. **Real-time & Resilience Patterns**
   - WebSocket clients must be resilient: exponential backoff reconnect, heartbeat/ping if needed, automatic resubscribe.
   - Live data should **patch the Query cache** so the rest of the UI (tables, charts, price cells) updates automatically without extra wiring.
   - Always provide a polling fallback when WS is unavailable.
   - API proxies in `app/api/crypto/*` exist to hide keys, add caching headers, rate-limit protection, and response normalization.

6. **Performance by Default**
   - Large lists/tables → use `@tanstack/react-virtual` (already in the project).
   - Expensive re-renders → `useMemo`, `useCallback`, proper React.memo where the props are stable.
   - Data tables → prefer `@tanstack/react-table` + virtualization over manual implementations.
   - Charts (lightweight-charts) must be client-only (`dynamic` import with `ssr: false`).
   - Tune `staleTime` and `gcTime` on queries appropriately (market data is usually short-lived).

7. **Component & Hook Hygiene**
   - Components in `features/*/components/` should be small and focused.
   - Extract complex logic into custom hooks (`use*`).
   - Prefer composition: a `<PriceCell>` that knows how to display live price + change is better than a giant `<CoinRow>`.
   - Use shadcn/ui primitives (`@/components/ui/*`) as the building blocks. Customize via className or composition — do not fork the primitives unless absolutely necessary.

8. **Error Handling & UX**
   - Every data-fetching boundary should have loading (Skeleton), error (with retry), and empty states.
   - Use `sonner` toasts for non-blocking user feedback.
   - Last-known-good data is better than a blank screen when a live update fails.
   - Network errors from proxies should be turned into friendly messages.

9. **Naming & Readability**
   - Names should reveal intent (`useLivePrices`, `getOHLC`, `PriceChart`).
   - Files and folders are named after their primary responsibility.
   - Keep functions small. If a function does two things, split it.
   - Comments explain *why*, not *what* (the code should say what).

10. **Testing Mindset (Even When Tests Are Not Yet Written)**
    - Code should be easy to test in isolation.
    - Hooks that wrap data fetching should accept the query client or be testable via MSW.
    - Avoid side effects in render.
    - Future tests will use Vitest + React Testing Library + MSW.

## Technology-Specific Conventions

- **Next.js 16 (App Router)**: Use Server Components by default. Move `'use client'` as deep as possible. Route handlers for anything that needs to be proxied or cached at the edge.
- **shadcn/ui + Tailwind v4**: Use the design system. Dark-first (crypto domain). Consistent spacing, typography, and color tokens.
- **API Proxies**: All external calls go through `app/api/crypto/*` routes. The client never talks directly to CoinGecko/Binance/etc. from the browser.
- **Local Persistence**: Use `localStorage` + Zustand (or a small custom hook) only for non-critical UI preferences (watchlist, column visibility, last selected timeframe). Never for source-of-truth data.

## What Senior Code Does *Not* Do Here

- Big "god" components or pages that do fetching + transformation + rendering + side effects.
- Duplicated fetch logic across components.
- `useEffect` for data fetching (use TanStack Query instead).
- Manual polling when a proper subscription or Query + refetchInterval would be cleaner.
- Ignoring rate limits or error states because "it works on my machine".
- Over-engineering for the current data volume (but design for 10x growth).

## How to Apply This When Implementing

When asked to build a new feature:

1. Identify the vertical slice (`features/<feature-name>/`).
2. Start with data contracts (Zod schemas + types).
3. Implement the data access layer (client functions + proxy route if needed).
4. Build the state layer (Query hooks, Zustand store if required).
5. Create the UI components (small, composable, using shadcn).
6. Wire everything in a page or higher-order component.
7. Add loading/error/empty states and live update behavior where appropriate.
8. Verify: `npm run typecheck`, `npm run build`, `npm run lint`, and relevant tests.

Update `docs/decisions/` with an ADR when you make a significant architectural choice.

## Related Documents

- `docs/commit-style.md` — How we commit (equally important).
- `README.md` — High-level project status and getting started.
- `docs/decisions/` — Record of important architectural decisions.

---

This file exists so that any future agent or contributor can be told:

> "Follow the coding style in `docs/coding-style.md` and the commit style in `docs/commit-style.md`."

Senior code is not about clever tricks — it is about code that is a pleasure to work with six months from now, when the requirements have changed and the original author is gone.