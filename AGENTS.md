<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

## Commit Discipline (Very Important for this project)

This repo follows a strict **senior-engineer commit style**.

**Read and follow `docs/commit-style.md` for all commit-related work.**

Key points:
- Never commit large amounts of work in a single "big bang" commit.
- Break changes into small, scoped, single-concern commits using conventional format (`feat(scope):`, `chore(scope):`, etc.).
- Commit messages must be explanatory (what + why + key patterns).
- When the user has a dirty tree after substantial implementation, first propose a commit breakdown plan, then use selective `git add <specific paths>` + good messages.
- Work on feature branches. Primary branch is `main`.
- History should tell a clear story and remain useful for review, blame, and onboarding.

Always reference `docs/commit-style.md` when the user asks you to implement features or help with commits.

## Coding Style (Senior-Level Code)

This project demands **senior-level code** — maintainable, scalable, well-structured, and a pleasure to work on months later.

**Read and follow `docs/coding-style.md` for all implementation work.**

Key expectations:
- Feature-sliced architecture (vertical slices under `features/`, shared code in `lib/`).
- TanStack Query for all server state + cache-patching pattern for real-time updates.
- Zod schemas as the source of truth for external data + strict TypeScript.
- Resilient real-time handling (WS with reconnect + fallback).
- Performance by default (virtualization for lists, proper query caching, client-only heavy components).
- shadcn/ui + Tailwind as the UI foundation.
- Clear separation: data access → state/hooks → presentation.
- Code should be easy to test (even when tests are added later).

Always reference `docs/coding-style.md` when writing or refactoring code.
