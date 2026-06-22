# AGENTS.md — Docs-First Engineering Guide

This repository uses `docs/` as the canonical source of truth for product context, implementation patterns, and package usage.

Use this file as the entrypoint for any AI agent or developer, regardless of tool/editor. (Claude Code: see also `CLAUDE.md`.)

---

## What This Repo Is

**chillpen.club** — a collaborative branching-storytelling platform. A book is a living universe: an author writes Chapter 1, multiple writers branch the next chapters, and readers choose their path through the resulting narrative tree. Netflix-grade browsing + Reddit-grade identity + a coin/cosmetic economy, in a dark-luxury "2032" aesthetic. €8/month after a 30-day trial; writing is free. Full spec in `docs/APP.md`.

---

## How To Work In This Repo

1. Start with `docs/index.md` for navigation.
2. Read `docs/APP.md` (product) and `docs/DESIGN.md` (design system) before product/UX decisions.
3. Read `docs/agents/` before implementing code.
4. Read package-level docs in `docs/web/` and `docs/shared/` before building components.

If code and docs disagree, prefer docs intent unless explicitly instructed otherwise.

---

## Priority Sources

### Product & Design (Read First For Feature Work)

- `docs/APP.md` — product definition, personas, information architecture, feature specs, data model, roadmap.
- `docs/DESIGN.md` — design system (Netflix reference); the app applies a dark-luxury molten-gold theme via `apps/web/src/app/globals.css`.

### Implementation Rules

- `docs/agents/AGENTS-checklist.md` — execution checklist.
- `docs/agents/AGENTS-style.md` — TypeScript and coding style conventions.
- `docs/agents/AGENTS-components.md` — React component patterns.
- `docs/agents/AGENTS-nextjs.md` — Next.js architecture and rendering patterns.
- `docs/agents/AGENTS-packages.md` — required use of `@zenncore/*` packages.

### Package Docs

- `docs/web/index.md` — web components.
- `docs/shared/index.md` — shared packages (`utils`, `icons`, `data-table`, `inferred-form`, `phone`).

---

## Non-Negotiable Standards

- Use `@zenncore/web` components for interactive UI; avoid custom raw HTML implementations for controls (no raw `<input>`/`<textarea>` — note there is no `Textarea` component yet, so styled `<textarea>` is the established fallback for long-form fields).
- Prefer `@zenncore/*` packages before adding local duplicates.
- Use semantic Tailwind tokens (`text-primary`, `bg-background`, `border-accent-foreground`, etc.), not raw color utility classes.
- Use `const` over `let`, descriptive single-word variable names, early returns, `switch (true)` for conditional chains, and `resultify`-style error handling (no `try/catch` for expected failures).
- Follow PPR/streaming on non-onboarding/non-auth pages: server-rendered shell in `page.tsx`, async server components wrapped in `<Suspense>` with matching skeletons.
- Use the `Motion` component (`@/components/motion`: `Motion.Up`, `Motion.Fade`, `Motion.Scale`, `Motion.Stagger`, `Motion.Item`) for server-side animations.
- Do not invent product facts when they already exist in `docs/APP.md`.

---

## Delivery Expectations

- Align implementation with documented product behavior and naming.
- Keep docs in sync when behavior changes intentionally.
- Prefer small, composable server/client boundaries over monolithic client pages.
- Use documented component APIs and package contracts before introducing new patterns.

---

## Learned Workspace Facts

- **Database workflow is `bun run db:push`** (run from `apps/web`), not versioned migrations — the `drizzle/` output folder is gitignored. After editing `src/server/database/schema.ts`, run `db:push` to sync. `db:generate` exists but there is no migration journal, so it emits a full baseline; don't commit it.
- **Server-action calling convention:** `withContext` / `withAuthentication` / `withAuthorization` actions are called `Action(Environment.SERVER, args)` from server components and `Action(args)` from client components (the environment defaults to `client` and the context is injected). Do not add explicit return-type annotations on these wrappers — keep return types inferred.
- **Construct external SDK clients lazily.** `new Resend(undefined)` (and similar Stripe/UploadThing clients) throws when its key is missing and will crash `next build` during page-data collection. Use a lazy getter and let features degrade gracefully when a key is absent.
- **Graceful degradation is the house style:** sign-up auto-signs-in when there is no `RESEND_API_KEY`; the post-sign-up payment step falls back to `Subscription.startTrial()` → `/discover` when Stripe is unconfigured; cover upload falls back to a generated cover when UploadThing fails.
- **`next/image` hosts** are allow-listed in `apps/web/next.config.ts`: `**.ufs.sh`, `utfs.io`, `res.cloudinary.com`, `images.unsplash.com`, `picsum.photos`. `typedRoutes` is enabled — dynamic `href`s use template literals matching a known route.
- The branching engine is `chapter.parentChapterId`; the universe map / "choose your continuation" is just a traversal of that self-reference. A "fork" is a new chapter pointing at an existing one.
- Prefer repository delegates (`import * as Universe; Universe.find(...)`) over ad-hoc `db` calls. `@zenncore/utils` `Result<T>` is non-distributive, so the success branch always includes `data`.
- Local Next dev relies on hot reload; remote hosting (Vercel) needs a redeploy when env or build output changes.
