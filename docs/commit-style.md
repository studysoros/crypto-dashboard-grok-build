# Commit Style Guide for this project

This project follows a **senior engineer** commit discipline. The goal is to keep history clean, reviewable, and useful for `git blame`, `git bisect`, future contributors, and yourself.

**Never** do big "everything at once" commits when significant work has been done.

## Core Rules

1. **One concern per commit**
   - Each commit should be small and focused on a single logical change or layer.
   - Examples of good boundaries:
     - Config + environment
     - Providers / DI setup
     - Data access layer (API clients + WS)
     - Type contracts / schemas / query keys
     - API routes / proxies
     - Feature hooks or business logic
     - UI components / pages (consumption layer)
     - Styling / theme in isolation
     - Documentation / README updates

2. **Use Conventional Commit format with scopes**
   - `feat(scope): ...`
   - `chore(scope): ...`
   - `fix(scope): ...`
   - `docs: ...`
   - `refactor(scope): ...`
   - `test(scope): ...`

   Good examples from the initial history:
   - `feat(data): implement CoinGecko typed client and resilient real-time WS client`
   - `feat(market): add TanStack Query hooks and live price WS integration`
   - `feat(api): add CoinGecko proxy Route Handlers`
   - `chore(config): add Zod-validated environment schema and shared cn() utility`

3. **Commit messages must be explanatory**
   - Subject line: short and imperative.
   - Body: explain **why** this matters, key patterns used, important decisions, or gotchas.
   - Bad: `added markets table and hooks`
   - Good: `feat(market): add TanStack Query hooks and live price WS integration

     - useMarkets + useGlobalStats via proxies
     - useLivePrices subscribes to WS and patches TanStack Query cache entries
       so the UI updates live without full refetches.

     This cache-patching pattern is central to keeping the dashboard responsive.`

4. **Order matters — tell a story**
   - Commits should usually flow in this kind of order when building new areas:
     1. Foundations / config / deps
     2. Shared utilities + providers
     3. Data layer (clients, schemas, types, query keys)
     4. Backend / API (proxies, server logic)
     5. Feature logic / hooks / state
     6. UI (components, pages)
     7. Polish, tests, docs
   - Documentation (especially README) usually comes toward the end or in its own commit.

5. **How to handle large amounts of uncommitted work**
   - Do **not** run `git add . && git commit -m "big feature"`.
   - First, propose a breakdown of commits (list of 5–12 scoped commits).
   - Then execute using selective staging:
     ```bash
     git add path/to/specific/files-or-dirs
     git commit -m "feat(scope): ..."
     ```
   - When backfilling history on a brand new repo (all work done locally with no commits), use an orphan branch + selective adds to create a clean root history (as was done for the initial push).

6. **Branching**
   - Do work on feature branches: `git checkout -b feat/virtualized-table`
   - Keep `main` (this repo's default branch) stable and with clean history.
   - Merge or rebase onto main only after the feature is broken into proper commits.

7. **Verification before finalizing commits**
   - After major commit batches, run:
     - `npm run typecheck`
     - `npm run build`
     - `npm run lint`
   - Leave the working tree clean (`git status` should be empty) when handing off.

## For New Features / Future Sessions

When the user asks you to implement something substantial:

1. Implement the code in the existing architecture (feature-sliced under `features/`, shared stuff in `lib/`, etc.).
2. At the end (or at natural checkpoints), **stop** and propose a commit plan.
3. Get confirmation on the plan.
4. Then walk the user through (or directly execute) the series of scoped `git add` + `git commit` commands using the style above.
5. Update the README / docs / decisions/ folder when appropriate as part of the final commits.

## Current Branch

The primary branch for this repo is `main` (not `master`).

## Reference

This file exists so any agent (Grok Build or otherwise) can be told:

> "Follow the commit style in docs/commit-style.md exactly."

## Why This Matters

- Makes code review and onboarding dramatically easier.
- History remains useful 6–12 months later.
- Shows professional craftsmanship (important for portfolio / production-intent projects like this one).
- Avoids "atomic" commits that are actually 800-line monsters.

---

**Initial history example** (the first 10 commits that established this style):
- chore: initialize Next.js 16 + TypeScript + Tailwind 4 project
- chore(config): ...
- feat(providers): ...
- feat(ui): set up dark-first Tailwind 4 theme and root layout
- feat(data): implement CoinGecko typed client and resilient real-time WS client
- feat(types): add Zod schemas...
- feat(api): add CoinGecko proxy Route Handlers
- feat(market): add TanStack Query hooks and live price WS integration
- feat(ui): implement Markets dashboard page (MVP shell)
- docs: add comprehensive README and preserve project structure

Use this as the model going forward.
