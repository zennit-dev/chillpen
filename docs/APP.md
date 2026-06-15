# APP.md — chillpen.club

> **The product specification.** Read this together with `DESIGN.md`. This document defines *what* chillpen.club is, *why* it exists, and *how* every feature works. `DESIGN.md` defines how it should *look and feel*. Where this document says "premium," "cinematic," or "dark luxury," it means the exact tokens, motion, and component language defined in `DESIGN.md` — adapted from Netflix's content-forward philosophy.

---

## 0. One-Line Pitch

**chillpen.club is where books become living, branching universes that readers explore and writers build together.** Netflix-grade browsing, Reddit-grade identity and community, and a branching narrative engine — wrapped in a 2032-feeling dark-luxury interface.

We don't sell "books." **We sell "build worlds together."**

---

## 1. Vision & Why It Exists

### The problem
Traditional publishing is a closed door. A new writer finishes a chapter and it disappears into the void — no audience, no feedback loop, no reputation, no visibility. Meanwhile, readers consume stories passively and have no agency over where a narrative goes. Both sides are starved: writers want to be *seen*, readers want to *participate*.

### The insight
Gen Z creators don't primarily want "to publish." They want **identity, contribution, reputation, and visibility**. They want to belong to something, leave a mark on it, and be recognized for it. The act of *contributing to a shared world* is more motivating than the act of *publishing a finished work*.

### The product
chillpen.club turns a book into a **living universe**:

- **Author A** writes Chapter 1 — the seed of a world.
- **Multiple writers** each write their own **Chapter 2** branch, continuing the story differently.
- **More writers** continue each branch into **Chapter 3**, and onward.
- The story grows into a **branching narrative tree** — a universe with many timelines.
- **Readers choose their pathway** through the tree, **compare alternate timelines**, and save the branches they love.
- **Unknown writers gain visibility** when their branch gets read, forked, liked, and ranked.

Every contribution is attributed, ranked, and rewarded. A writer's reputation is built in public, branch by branch.

### Business model
- **Readers:** €8/month subscription after a **30-day free trial**.
- **Writers:** free to publish; earn **coins** (the in-app reputation/cosmetic economy) and visibility; future phases add direct monetization (tips, premium creator accounts, publisher scouting).
- **Stripe** handles trial → paid conversion, billing, and churn.

### The vibe (non-negotiables)
The product **must feel premium, must not feel generic, must feel addictive, and must feel like storytelling entered 2032.** If a screen feels like a generic CMS or a stock template, it has failed. Every surface should feel like a Netflix hero shot crossed with a creator's personal stage.

---

## 2. Positioning & Mental Model

| Reference | What we take from it |
|---|---|
| **Netflix** | Browsing psychology, cinematic hero, horizontal carousels, dark content-forward UI, "one more episode" pull. |
| **Reddit** | Identity, pseudonymity, community contribution, avatar customization, karma-as-reputation, upvote-driven discovery. |
| **Modern creator economy (TikTok / Substack / itch.io)** | Visibility for unknowns, leaderboards, badges, the dopamine of a contribution being seen. |
| **Games (RPG cosmetics / battle passes)** | Earnable + purchasable cosmetics, rarity tiers, animated frames, status flexing, achievements. |

**Mental model:** *Netflix × Reddit × a creator RPG.* You browse worlds like Netflix, you contribute and build reputation like Reddit, and you customize your identity like a game character.

---

## 3. Core Personas

**The Reader (subscriber).** Lean-back, wants to be guided to great stories, loves choosing their own path and comparing timelines, saves favorites, follows writers. Converts on the strength of the browse experience and the addictive "what happens next / what if I'd gone the other way" loop.

**The Writer (creator).** Wants visibility and reputation. Writes branches off existing chapters or starts new universes, obsesses over their stats (reads, forks, likes, rank), earns coins and badges, flexes their avatar. Their profile is their stage.

**The Admin (curator/operator).** Seeds the platform with quality universes and AI covers, moderates submissions, curates the featured slider, manages the economy and analytics, keeps the catalog premium.

---

## 4. Information Architecture & Routes

```
/                      Homepage (featured slider + carousels)
/discover              Full browse / filters / genres (Algolia-powered)
/search                Algolia instant search
/story/[slug]          Book/Universe page (artwork, description, universe map)
/story/[slug]/read/[chapterId]   Reading view (path-aware)
/story/[slug]/map      Full-screen universe map / branch tree
/story/[slug]/compare  Compare alternate timelines (side-by-side branches)
/write                 Writer Studio (new chapter / new universe)
/write/[chapterId]     Writer Studio (edit draft)
/u/[pseudonym]         Public creator profile (the "stage")
/me                    My dashboard (continue reading, my drafts, my stats, coins)
/me/saved              Saved stories & saved paths
/me/avatar             Avatar studio (cosmetics, coin shop, inventory)
/leaderboards          Writer leaderboards, rising writers, top universes
/challenges            Weekly challenges & community writing jams
/admin                 Admin panel (gated)
/pricing               Subscription / trial
/onboarding            Email verification, pseudonym, first preferences
```

---

## 5. Feature Specifications

### 5.1 Homepage — The Cinematic Front Door

The homepage borrows Netflix's browsing psychology directly (see `DESIGN.md` §5). Its job: **make worlds irresistible to enter** and shorten the path to "start reading" or "start writing."

**Featured Slider (the hero).**
The top of the page is a **full-bleed, auto-advancing slider of 5–6 featured universes** (not a single static billboard). Each slide is a cinematic, AI-generated artwork background with the universe's title logotype, a one-line hook, genre, key stats, and two CTAs: **Read** (primary, white) and **Explore Universe** (secondary, glass). Slides auto-advance on an eased timer with manual dot/arrow controls and pause-on-hover.

> **Admin-controlled:** The featured slider is fully curated from the Admin Panel. Admins pick which universes appear and **toggle each slide on/off** with a switch, set order, and set the hook copy. The homepage renders only enabled slides in admin-defined order. (Hard requirement — see §5.5.)

**Horizontal carousels (below the hero).** Personalized, themed rows in the Netflix shelf pattern — each a horizontally scrollable track of Story Cards with a Medium-weight title, edge-peek, and hover paging:

- **Continue Reading** — resume exactly where each reader left off, on their chosen path.
- **Trending Stories** — velocity of reads/forks/likes right now.
- **New This Week** — freshly seeded or freshly forked universes.
- **Most Forked Stories** — universes with the most branches (the most "alive").
- **Most Completed Universes** — branches readers finish at the highest rate.
- **Rising Writers** — spotlighting unknown creators gaining traction (core to the mission).
- **Recommended For You** — personalized by genre, read history, and saved paths.

The aesthetic is **dark luxury**: near-black canvas, warm white text, subtle gradients, premium glassmorphism on overlays and CTAs (per `DESIGN.md` palette and shape language).

### 5.2 Story Card System

The atomic browse unit (the chillpen analog of Netflix's title card). Every card surfaces:

- **Original AI artwork** (cover, landscape or poster ratio per `DESIGN.md` card spec)
- **Story title**
- **Genre** (chip)
- **Contributors count** (how many writers built this universe)
- **Fork count** (how many branches)
- **Readers count**
- **Completion %** (how "finished" the dominant path is)
- **Creator pseudonym** (the originating author)
- **Rating**
- **Save button** (heart/bookmark; optimistic toggle)

**Hover behavior (desktop):** card scales up and lifts, neighbors slide aside, and an expanded preview reveals a short synopsis, the quick stats, the **Save** and **Explore Universe** actions, and a **branch sparkline / mini fork-count** — adapting Netflix's hover-to-preview so readers can evaluate a world without leaving the row. (See `DESIGN.md` §6–7.)

### 5.3 Book / Universe Experience

The story page is staged like a film page, organized top → middle → bottom.

**Top — the cinematic header.** Full-width AI artwork, title logotype, description, genre chips, key stats, and an embedded **Universe Map** preview (the branch tree). Primary CTAs: **Read** and **+ Create Chapter**.

**Middle — read the chapter.** Clean, focused reading view using the **fixed reading typography** (Instrument Serif body — no font changes allowed; see §7). Distraction-light: dark background, comfortable measure, generous line height, progress indicator, and the writer's attribution.

**Bottom — choose your continuation.** This is the signature mechanic. At the end of a chapter, the reader is presented with the **available next-chapter branches**, each attributed to its writer:

```
Chapter 1
Choose your continuation:
  → Chapter 2 by LunaInk      (1.2k reads · 340 forks · 4.8★)
  → Chapter 2 by VoidWriter   (980 reads · 210 forks · 4.6★)
  → Chapter 2 by NeonFox      (640 reads · 90 forks · 4.9★)
```

The reader **selects a path** and the story continues down that branch. Each branch shows lightweight stats so readers (and the ranking system) reward the strongest continuations. The reader's path is remembered for **Continue Reading** and is the thing they can **save** and **compare**.

**Universe Map / Branch Tree (`/story/[slug]/map`).** A full-screen, navigable visualization of the entire narrative tree — nodes are chapters, edges are continuations, node size/heat encodes popularity (**branch heatmaps**). Readers explore, jump to any node, and see where their path sits. This is both a navigation tool and a wow-moment.

**Compare Alternate Timelines (`/story/[slug]/compare`).** Side-by-side reading of two (or more) branches diverging from a shared parent chapter — "what if I'd gone the other way." A core viral/retention feature.

### 5.4 Create Chapter → Writer Studio

A large, ever-present **`+` Create Chapter** button (on universe pages, on chapters, in the global nav). It opens the **Writer Studio**, the creator's workshop.

The Studio uses **fixed typography only** — writers compose content, not styling, which keeps every story visually consistent and on-brand (no font/size/color chaos). Tools:

- **Chapter title**
- **Rich text editor** (semantic formatting only: headings, emphasis, paragraphs, scene breaks — no arbitrary fonts/colors)
- **Word count** & **Character count** (live)
- **Draft autosave** (continuous, never lose work)
- **Grammarly-like assistance** (grammar/spelling/style suggestions)
- **Chapter linking** — explicitly attach this chapter as a continuation of a chosen parent chapter (this is what places it in the branch tree)
- **Story continuity warnings** — flags contradictions with the parent branch (e.g. a character who died, a changed location)
- **AI consistency checker** — checks tone, named entities, timeline, and canon against ancestor chapters
- **Citation notes** — reference prior chapters/events the branch builds on
- **Chapter summary generation** — auto-draft a summary for the map/preview
- **Preview mode** — read the chapter exactly as readers will, in reading typography
- **Save draft** / **Submit for approval** (enters the admin moderation queue)

**Why approval-gated:** quality and safety. Submitted chapters pass through the **OpenAI moderation layer** and land in the Admin review queue before going live, keeping the catalog premium and safe.

### 5.5 Admin Panel (`/admin`, gated)

The operator's control room. Abilities:

- **Add new books / seed universes**; **upload AI covers**
- **Featured Slider management** — pick the 5–6 homepage hero universes, **toggle each on/off** with a switch, reorder, and edit hook copy *(hard requirement — drives the homepage hero)*
- **Review submitted chapters** — moderation queue with diff against parent, continuity flags, and moderation results; **Approve / Reject** with reason
- **Writer moderation** — warn, suspend, ban; handle **abuse reports**
- **Genre management** — create/curate genres and chips
- **Featured Creators section** — spotlight writers (feeds "Rising Writers")
- **Analytics** — content, engagement, retention, branch heatmaps
- **Subscription analytics** — trials, conversions, churn, MRR
- **Revenue dashboard** — Stripe-backed revenue, payouts (future), coin economy health
- **Avatar store management** — add/retire cosmetics, set rarity, set coin prices, schedule drops
- **Coin economy management** — tune earn rates, sinks, and milestone rewards

### 5.6 Identity & Avatar Economy

Identity is a first-class product surface — this is the Reddit/game DNA.

**Accounts.** Pseudonyms are allowed and encouraged (creators perform under a handle). **Email verification is mandatory** to publish or earn. Auth via **Clerk**.

**Coins (the reputation/cosmetic currency).** Writers and active readers **earn coins** from:
- Published (approved) chapters
- Reader engagement on their chapters (reads/completion)
- Likes and shares
- Milestones (e.g. first 1k reads, 100 forks, ranked #1 in a genre)

**Cosmetics — earn *or* buy.** Coins are spent in the **Avatar Studio** on unique items: **avatar upgrades, animated frames, rare cosmetics, and special profile effects.** Crucially, the best cosmetics are also **won, not just bought** — e.g. a writer who gets the **most views or most likes on a chapter** (weekly winners, milestone unlocks, challenge prizes) earns **exclusive items that can't be purchased.** This makes cosmetics a *status signal of real achievement*, not just spend. Rarity tiers (common → rare → legendary) and "unobtainable in shop" event items create flex value and a reason to keep contributing.

**Visual inspiration:** Reddit avatar customization (layered, expressive, identity-defining) crossed with game cosmetic systems (rarity, animated frames, seasonal drops).

**The Profile Page — the creator's stage (redesigned, must not "suck").** `/u/[pseudonym]` is a cinematic, dark-luxury **showcase**, not a bland settings list. It includes:
- A **hero banner** with the writer's customizable artwork + their animated **avatar and frame** front and center
- **Reputation at a glance:** total reads, forks, likes, universes contributed to, and **badges** (top creator, rising writer, challenge winner)
- A **cosmetics trophy case** showing rare/won items (status flex)
- **Their universes & branches** as Story Cards (the work, beautifully presented)
- **Leaderboard standing** and achievements
- **Follow** button and social share card
The profile should make a writer *proud to share it* — it is their identity and résumé in one.

### 5.7 Viral & Retention Layer

Built-in loops that make the platform spread and stick:

- **Change notifications:** *"Your story changed because LunaInk added Chapter 12"* — pulls readers back when a branch they follow grows.
- **Compare alternate timelines** (see §5.3).
- **Writer leaderboards** & **Top Creator badges** (global, per-genre, weekly).
- **Reader achievements** (paths completed, universes explored, comparisons made).
- **Weekly challenges** & **community writing jams** (`/challenges`) — themed prompts with cosmetic prizes.
- **Book collaboration invites** — writers invite others to build a universe.
- **Branch heatmaps** — visualize where readers go and which branches win.
- **Reader retention analytics** (for writers and admin).
- **Social share cards** — auto-generated, beautiful OG images for any universe/branch/profile.

### 5.8 Mobile Experience

Fully responsive — **a perfect experience on desktop, tablet, and phone.** Carousels become swipeable, the featured slider is touch-driven, the reading view is thumb-friendly, and the Writer Studio degrades gracefully to a focused mobile composer. **Performance target: 95+ Lighthouse** across performance, accessibility, best practices, and SEO. Image-heavy surfaces rely on Cloudinary optimization, responsive sources, and lazy loading to hit this.

---

## 6. Subscription & Lifecycle

**Trial → Paid.** New readers get a **30-day free trial**; **€8/month** thereafter via **Stripe**. Onboarding: sign up (Clerk) → **verify email** → pick pseudonym → pick genres → land on a personalized homepage. Trial state, conversion prompts, dunning, and churn flows are Stripe-driven and surfaced in Admin subscription analytics. Writing/earning requires a verified account; reading the full catalog requires an active trial or subscription.

---

## 7. Typography System (binds to DESIGN.md)

A **2026/2032 premium creator aesthetic** with a strict, intentional type system. **Reading typography is fixed and cannot be changed by users** — this guarantees every story looks consistent and premium.

| Role | Font | Notes |
|---|---|---|
| **Titles / display** | **Sora** | Modern, premium, futuristic — universe titles, hero, section headers. |
| **Subtitles / UI emphasis** | **Manrope** | Subheads, card meta, nav. |
| **Body / interface** | **Inter** | All general UI text, controls, dashboards. |
| **Book reading** | **Instrument Serif** | The reading view only. **Fixed** — no font/size/color changes by users. Warm, literary, premium. |

These map onto `DESIGN.md`'s weight discipline (regular for content, medium for emphasis; avoid heavy weights in chrome) and the dark-luxury color ramp.

---

## 8. Tech Stack

**Frontend:** Next.js 16 · TypeScript · Tailwind CSS (tokens from `DESIGN.md`).
**Backend:** Node.js.
**Database:** PostgreSQL.
**Search:** Algolia (instant search + discovery facets).
**Storage:** Cloudflare R2 (artwork, assets).
**Auth:** Clerk (with mandatory email verification).
**Payments:** Stripe (trial, subscription, billing).
**Image optimization:** Cloudinary (covers, avatars, OG cards).
**Notifications/email:** Resend (verification, change notifications, digests).
**Analytics:** PostHog (product analytics, funnels, retention).
**AI moderation:** OpenAI moderation layer (chapters + abuse screening) and the Studio's consistency/grammar assistance.
**Infrastructure:** Vercel.

---

## 9. Data Model (conceptual)

The branching engine is the heart of the schema. Core entities and key relationships:

- **User** — id, email (verified), pseudonym, role (reader/writer/admin), coins, badges, cosmetics owned, subscription status.
- **Universe (Book)** — id, slug, title, description, genre(s), cover (R2/Cloudinary), originating author, completion %, aggregate stats, `featured` flag + `featuredOrder` + `featuredEnabled` (drives the homepage slider).
- **Chapter (Branch Node)** — id, universe id, **parentChapterId (nullable)** ← this self-reference creates the tree, author id, title, body, summary, status (draft/submitted/approved/rejected), stats (reads, forks, likes, completion), continuity flags.
- **ReadPath** — userId, universe id, ordered list of chosen chapter ids (powers Continue Reading + Compare).
- **Save** — userId, target (universe or path).
- **CoinLedger** — userId, delta, reason (chapter published, milestone, like, challenge win), timestamp.
- **Cosmetic** — id, type (frame/effect/avatar item), rarity, price (coins) or `shopDisabled` (won-only), drop window.
- **Challenge / Leaderboard snapshots**, **AbuseReport**, **ModerationQueue entry**.

A "**fork**" = creating a new Chapter whose `parentChapterId` points at an existing chapter. The whole universe map is just a traversal of `parentChapterId`.

---

## 10. Future Phases

- **AI narration** & **audiobooks**; **voice narration uploads** by writers.
- **Writer monetization:** **tip creators**, **premium creator accounts**, revenue share.
- **Publisher scouting portal** — publishers discover top writers/universes; **publishing opportunities** for breakout creators.

---

## 11. Non-Negotiables (the bar)

1. **Premium** — every screen looks like a Netflix hero, never a template.
2. **Not generic** — distinctive dark-luxury identity, glassmorphism, AI artwork everywhere.
3. **Addictive** — branching choices, compare-timelines, change notifications, coins, leaderboards, and the avatar flex create tight retention loops.
4. **Feels like storytelling entered 2032** — futuristic type (Sora), cinematic motion, living universes.
5. **Market "build worlds together," never "books."** Identity, contribution, reputation, visibility — that's the promise.