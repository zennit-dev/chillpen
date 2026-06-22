# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Docs-First Rule (Read Before Coding)

Treat `docs/` as the canonical source of truth for product intent, implementation conventions, and package usage.

Read in this order before substantial work:

1. `docs/index.md` — docs navigation hub (component-library focused).
2. `docs/APP.md` — product spec: what chillpen.club is, why it exists, and how every feature works.
3. `docs/DESIGN.md` — the design system (a Netflix reference; the app adapts it to a dark-luxury, molten-gold theme — see `apps/web/src/app/globals.css`).
4. `docs/agents/AGENTS-*.md` — coding rules (`style`, `components`, `nextjs`, `packages`, `checklist`).
5. `docs/web/index.md` and `docs/shared/index.md` — component/package API references.

If code and docs disagree, follow documented intent unless the user explicitly asks otherwise.

## What This Is

**chillpen.club** is a collaborative, branching-storytelling platform. A book is a **living universe**: an author writes Chapter 1, multiple writers each branch their own Chapter 2, and the story grows into a narrative tree (`chapter.parentChapterId`). Readers **choose their path** through the tree, save what they love, and follow the writers building it. The product blends Netflix-grade browsing, Reddit-grade identity, and a coin/cosmetic economy, in a dark-luxury "2032" aesthetic.

Business model: readers pay **€8/month after a 30-day free trial** (Stripe); writing is free and earns **coins**. See `docs/APP.md` for the full spec.

---

## Commands

All commands use **Bun** as the package manager. Run from `apps/web/` unless noted.

```bash
# Development
bun run dev           # Start the Next.js app (from apps/web)
# from repo root: bun run dev / bun run build (Turborepo)

# Build & type checking
bun run build         # next build
bun run typecheck     # tsc --noEmit

# Linting / formatting (Biome)
bun run lint          # biome check --write (root); apps/web also has its own

# Database (run from apps/web/)
bun run db:push       # Push the Drizzle schema directly to the DB (the workflow here)
bun run db:generate   # Generate migration SQL (the drizzle/ folder is gitignored)
bun run db:studio     # Open Drizzle Studio
bun run seed          # Seed demo users/genres/universes/chapters/cosmetics
```

There are no automated tests in this codebase currently.

---

## Monorepo Structure

```
/
├── apps/web/                 # Main Next.js 16 application
│   ├── src/
│   │   ├── app/              # Next.js App Router pages
│   │   ├── components/       # Shared app-level components (story-card, carousel, hero-slider, ui, icons, motion…)
│   │   ├── server/           # All server-side code (actions, DB, utils)
│   │   ├── lib/              # auth (Better Auth), seo, og
│   │   └── utils/            # client/shared utils (array, search-params)
│   └── drizzle.config.ts
└── packages/
    ├── web/                  # @zenncore/web — UI component library + Tailwind config
    ├── shared/
    │   ├── utils/            # @zenncore/utils — cn, resultify, Result type, hooks
    │   ├── inferred-form/    # @zenncore/inferred-form — schema-driven form builder
    │   ├── data-table/       # @zenncore/data-table — TanStack Table wrapper
    │   ├── icons/            # @zenncore/icons
    │   ├── phone/            # @zenncore/phone
    │   └── config/           # @zenncore/config — shared TS/Tailwind/tsdown configs
    └── mobile/               # @zenncore/mobile (placeholder)
```

---

## Server Architecture (`apps/web/src/server/`)

### Three-layer structure:

**1. Database** (`server/database/`)
- Drizzle ORM + PostgreSQL via `postgres.js`
- Schema in `schema.ts`. Better-auth core: `user`, `session`, `account`, `verification`. chillpen domain: `genre`, `universe`, `chapter` (self-referential `parentChapterId` → the branch tree), `readPath`, `save`, `coinLedger`, `cosmetic`, `userCosmetic`, `chapterLike`, `follow`, `comment`, `challenge`, `leaderboardSnapshot`, `abuseReport`, `moderationQueue`. chillpen identity/economy columns (pseudonym, bio, coins, avatarConfig, badges, subscription…) live on `user`.
- `seed.ts` provides idempotent demo data. Config in `drizzle.config.ts`.

**2. Utilities** (`server/utils/`)
- **Context system**: `withContext()` → base wrapper (auth API, Sentry, storage, durable); `withAuthentication()` → adds `session`; `withAuthorization(roles)` → adds role checks.
- **Repository pattern**: `repository(schema.table)` returns typed `get`, `create`, `update`, `destroy`, `find`, `paginate`, `exists`, `count`; `increment()` for atomic counters.
- **Error classes**, `request`/`parse` HTTP helpers, `stripe()` client, `ai.ts` (`generate()` via Azure AI), `durable` (Upstash Redis).

**3. Server actions** (`server/app/`)
- `authentication.ts` — signIn, signUp (pseudonym/email/password), signOut, getCurrentUser/getProxiedCurrentUser, verifyEmail, reset/forgot password.
- `user.ts`, `session.ts`, `genre.ts`.
- `universe.ts` (trending / newThisWeek / mostForked / mostCompleted / recommended / featured / createUniverse), `chapter.ts` (continuations, tree, fork, drafts, submit/approve/reject, consistency check), `read-path.ts`, `save.ts`, `follow.ts`, `comment.ts`, `coin.ts` (award/spend/tip), `cosmetic.ts`.
- `leaderboard.ts`, `challenge.ts`, `moderation.ts`.
- `subscription.ts` (Stripe trial → €8/mo), `storage.ts` + `upload.ts` (UploadThing), `verification-email.ts` (Resend), `tracking`/`intelligence` are not part of chillpen.

> **Calling convention (important):** `withContext`/`withAuthentication`/`withAuthorization` actions are called as **`Action(Environment.SERVER, args)` from server components** and as **`Action(args)` from client components** (the environment defaults to `client` and the context is injected). External SDK clients (Resend/Stripe/UploadThing) must be **constructed lazily**, never at module top level — `new Resend(undefined)` throws and crashes the build.

---

## App Router Structure (`apps/web/src/app/`)

```
app/
├── (auth)/                       # split-screen cinematic shell
│   ├── sign-in/
│   ├── sign-up/                  # "Claim a pseudonym" → /sign-up/payment (card + start trial)
│   └── onboarding/
├── (main)/                       # landing + protected pages
│   ├── page.tsx                  # Landing (signed-out); redirects signed-in → /discover
│   ├── discover/                 # Home: featured slider + shelves; ?genre = filtered grid
│   ├── library/                  # Saved universes (the reading shelf)
│   ├── story/[slug]/             # Universe page + read/[chapterId], map, compare
│   ├── leaderboards/             # Writer leaderboard (+ genre filter)
│   ├── challenges/
│   ├── write/                    # Writer Studio (continue a universe / start a new one)
│   ├── u/[pseudonym]/            # Public writer profile (bio, works, comments, tipping)
│   ├── me/                       # Private dashboard (+ /me/avatar)
│   ├── pricing/  search/  privacy-policy/
│   └── _components/              # nav-bar, footer
├── admin/                        # Admin panel (gated): featured manager, moderation queue
├── api/                          # stripe/webhook, uploadthing; auth via Better Auth handler
└── layout.tsx, globals.css, manifest.ts, robots.ts, sitemap.ts, opengraph/icon routes
```

Client components live in `_components/` subdirectories next to their page.

### PPR and Streaming

Every `page.tsx` is a **server component** that exports real HTML (layout, title, headings) and streams data via `<Suspense fallback={<Skeleton />}>` around async server components. Auth/onboarding screens may be client-heavy by design. Server-side animations use the `Motion` component from `@/components/motion`. See `docs/agents/AGENTS-nextjs.md`.

---

## Key Patterns

### Error handling — `resultify` in actions, `unwrapResult` in server components
```ts
import { resultify, unwrapResult } from "@zenncore/utils";
const result = await resultify(() => fetch(url));
if (!result.success) return { success: false, error: result.error };
```

### Server module imports — namespace pattern
```ts
import * as Universe from "@/server/app/universe";       // server components: full namespace
import type * as Universe from "@/server/app/universe";  // client components: type-only (no server code bundled), unless calling the action as RPC
```

### Forms — `InferredForm` + `field()` (no raw inputs / manual react-hook-form).
### Styling — semantic Tailwind tokens only (`text-primary`, `bg-background`, `border-accent-foreground`) — never raw colors. The dark-luxury molten-gold palette is themed in `globals.css`.
### Components — namespace pattern; `switch (true)` over long if/else; IIFEs for scoped logic; `const` only; full, single-word names (`context` not `ctx`).

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16, React 19, React Compiler |
| Database | PostgreSQL, Drizzle ORM |
| Auth | Better Auth (email/password + Drizzle adapter, email verification via Resend) |
| AI | Vercel AI SDK 6 + Azure AI (consistency checks, summaries) |
| Email | Resend + React Email |
| Storage | UploadThing |
| Payments | Stripe (30-day trial → €8/mo) |
| Styling | Tailwind CSS 4 (dark-luxury theme) |
| Animations | Motion |
| Charts | Recharts |
| URL State | nuqs |
| Durable | Upstash Redis |
| Monitoring | Sentry + PostHog |
| Linting | Biome (no ESLint/Prettier) |
| Build | Turborepo + Bun |

---

## Environment Variables

Required in `.env.local` (and on Vercel). Most have graceful fallbacks in dev/preview.
```
DATABASE_URL
BETTER_AUTH_SECRET
APP_HOST                     # e.g. http://localhost:3000 — Better Auth baseURL
RESEND_API_KEY               # absent → sign-up auto-signs-in instead of emailing
FROM_EMAIL
AZURE_RESOURCE_NAME
AZURE_API_KEY
UPLOADTHING_TOKEN            # absent → cover upload falls back to a generated cover
STRIPE_SECRET_KEY
STRIPE_SUB_READER            # €8/mo price id
STRIPE_WEBHOOK_SECRET        # absent → payment step falls back to starting the trial directly
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
NEXT_PUBLIC_SENTRY_DSN
GOOGLE_CLIENT_ID             # optional (social sign-in)
GOOGLE_CLIENT_SECRET
```
