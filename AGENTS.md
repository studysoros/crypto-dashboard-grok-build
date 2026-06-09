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
