# DESIGN.md — The Netflix Design System

> A reference for what makes Netflix *feel* like Netflix: the philosophy, the tokens, the components, and the reasoning behind every decision. Values in this document were measured from the live Netflix browse experience.

---

## 1. Design Philosophy

Netflix's design exists to serve a single goal: **get the viewer watching with the least possible friction.** Every visual and interaction decision flows from this. The interface is deliberately self-effacing — it is a dark, quiet stage whose only job is to make the *content* (the artwork, the trailers, the titles) the brightest and loudest thing on screen.

Three principles drive everything:

**Content is the interface.** Netflix is not a "designed page" with images placed inside it; it is a grid of imagery that the chrome merely frames. The UI recedes (dark, low-contrast, minimal) so that colorful box art pops forward. This is why the background is near-black and the navigation is transparent — the design literally gets out of the way of the content.

**Reduce decisions, reduce friction.** The product is built around browsing, not searching. Horizontally scrolling rows, personalized ranking, autoplaying previews, and a single dominant "Play" button all exist to shorten the distance between *opening the app* and *pressing play*. The design optimizes for the lean-back viewer who wants to be guided, not the lean-forward user who wants to configure.

**Cinematic, immersive, and emotional.** Netflix wants the home screen to feel like the lights dimming in a theater. Darkness, full-bleed hero imagery, motion, and atmospheric autoplay create anticipation. The brand is entertainment, and the UI is staged like a trailer.

---

## 2. Color System

Netflix uses an intentionally narrow palette: **a near-black canvas, white text, a single iconic red accent, and a handful of grays.** Restraint is the point — the only saturated brand color is red, so red always means "Netflix" or "act now."

### Core palette (measured from the live product)

| Role | Value | Usage |
|---|---|---|
| **Brand Red** | `#E50914` (`rgb(229, 9, 20)`) | The logo, the wordmark, sign-in CTAs, key accents. The single most important brand asset. |
| Brand Red (hover/dark) | `#B9090B` (`rgb(185, 9, 11)`) | Pressed/hover state of red buttons. |
| **Canvas / Background** | `#141414` (`rgb(20, 20, 20)`) | The primary app background — a warm near-black, *not* pure black. |
| Pure Black | `#000000` | Gradient overlays behind text, billboard vignettes, true-black edges. |
| **Primary Text** | `#FFFFFF` | Headings, body, the default reading color. |
| Heading Gray | `#E5E5E5` (`rgb(229, 229, 229)`) | Row titles (slightly dimmed white to recede beneath content). |
| Secondary Gray | `#808080` (`rgb(128, 128, 128)`) | Muted/secondary text, metadata, inactive nav links. |
| Surface Gray | `#333333` (`rgb(51, 51, 51)`) | Secondary buttons (e.g. "More Info"), surfaces, dividers. |
| Surface Gray (dark) | `#222222` (`rgb(34, 34, 34)`) | Card placeholders, deeper surfaces, modals. |
| Hairline Gray | `#555555` (`rgb(85, 85, 85)`) | Borders, outlines on circular icon buttons. |

### Why these choices

The background is `#141414` rather than `#000000` deliberately. Pure black against bright artwork creates harsh, fatiguing contrast and makes pixel-level seams visible; a warm near-black is gentler on the eyes during long, dark-room viewing sessions and lets black artwork edges blend seamlessly into the canvas. The dark theme also makes colorful thumbnails look more vivid (simultaneous contrast) and reduces screen glow in the living room.

Red is used **scarcely and meaningfully.** It is reserved almost entirely for the brand mark and the primary conversion action. Because nothing else on the page is red, the eye is trained to read red as "this is the most important thing." Inside the logged-in browse experience the red mostly retreats to the logo, because once you're a subscriber the *content* should be the color, not the chrome.

Text uses a deliberate gray ramp — pure white (`#FFFFFF`) for things you must read, `#E5E5E5` for row titles that should sit just *behind* the artwork, and `#808080` for metadata you can ignore. This grayscale hierarchy lets Netflix establish three levels of importance using brightness alone, without introducing any extra colors.

---

## 3. Typography

Netflix commissioned its own typeface, **Netflix Sans**, and falls back through a system stack:

```
font-family: "Netflix Sans", "Helvetica Neue", "Segoe UI", Roboto, Ubuntu, sans-serif;
```

### Why a custom typeface

Netflix previously licensed Gotham/Helvetica Neue and paid recurring fees scaled to its enormous global reach. Netflix Sans was built in-house to (a) eliminate licensing cost at scale, (b) own a consistent voice across TV, web, mobile, billboards, and on-screen credits, and (c) tune the letterforms for screens: it has a slightly humanist, friendly geometry with a subtly cropped, "cinematic" feel and excellent legibility at small sizes and from a couch's distance. It is a **sans-serif** because sans-serifs read cleaner on backlit displays and feel modern, neutral, and content-forward — the type should never compete with the imagery.

### Type scale (measured)

The system is built on a small set of sizes and only **two practical weights**, keeping everything calm and consistent.

| Token | Size (approx.) | Weight | Use |
|---|---|---|---|
| Row title (`h2`) | ~21px | **500 (Medium)** | Section headers like "US Series", "Critically Acclaimed". Color `#E5E5E5`. |
| Billboard title | Often delivered as a **logo image**, not text | — | Featured-title branding is an artwork asset, not a font render — preserving each title's bespoke logotype. |
| Body / synopsis | ~17px (`16.785px`) | 400 (Regular) | Hero description, paragraphs. |
| UI / nav / labels | ~11–13px | 400 / 500 | Nav links, button labels, metadata, badges. |

**Weight discipline:** the page overwhelmingly uses **400 (Regular)** for content and **500 (Medium)** for emphasis (row titles, active states). Netflix almost never uses bold/heavy weights in the browse chrome — heaviness would fight the artwork. Importance is signaled by *brightness and size*, not weight.

Row titles use Medium at a modest size and a dimmed white so they label content without shouting over it — you read them peripherally, then your eye drops to the posters.

---

## 4. Shape Language & Border Radius

Netflix's shape language is **gently rounded, never pill-shaped.** The radius scale measured on the live product clusters tightly:

| Token | Value | Applied to |
|---|---|---|
| `radius-sm` | **2–3px** | Box art / title cards (~`3px`), small chips. |
| `radius-md` | **4px** | The dominant radius — buttons (Play, More Info), badges, inputs. By far the most-used value (100+ instances). |
| `radius-pill` | `17px` / `50%` | Circular icon buttons only (the round +, like, info, and notification icons). |

### Why these values

Card and poster corners use a **very subtle 2–4px radius** — just enough to feel intentional and soft, but small enough that the artwork reads as a near-rectangular "poster" the way physical media does. A large radius would crop into the artwork and feel toylike; a 0px radius would feel harsh and dated. The 4px button radius matches the cards so buttons feel like part of the same family.

The only fully round shapes are **icon buttons** (circular, `50%` radius with a subtle `#555` border and a semi-transparent dark fill). Circles read instantly as "tappable tools" and visually separate utility actions (add to list, rate, expand) from the primary rectangular "Play" CTA.

---

## 5. Layout & Spatial Structure

The browse page is a vertical stack of two archetypes: **one full-bleed Billboard** at the top, followed by **N horizontally-scrolling content rows.**

**The Billboard (hero).** A single featured title fills the top of the viewport edge-to-edge with a still or autoplaying trailer, overlaid on the left with the title's logotype, a one-line tagline, a short synopsis, and two buttons. A black gradient (`#000` → transparent) is layered from the bottom-left so white text stays legible over any imagery. This is the most cinematic moment on the page and is sized to feel like a movie poster come to life.

**Content rows.** Each row is a labeled, horizontally scrollable carousel of cards ("Your Next Watch", "US Series", "Continue Watching", etc.). The horizontal-row pattern is core to Netflix: it lets the service present *dozens* of personalized, themed collections in a compact vertical space, and the lean-back gesture of scrolling sideways through a "shelf" mirrors browsing a video store. Rows render a partial card at the edge to signal "there's more this way," and reveal paging arrows on hover.

**Navigation.** A **sticky, initially transparent** top bar (height ~70px, high z-index) holds the red logo at left, the primary nav (Home, Series, Films, Games, Latest, My List, Browse by Language), and utility icons at right (search, notifications, profile). It starts transparent so the billboard bleeds behind it, then fades to solid `#141414` on scroll so links stay readable over content. The bar is intentionally thin and quiet.

**Grid & rhythm.** Layout is responsive: the number of cards per row scales with viewport width while card aspect ratio stays fixed. Generous dark gutters separate rows, giving each themed shelf breathing room and a clear rhythm as you scroll.

---

## 6. Components

### Buttons

**Primary — "Play":** white fill `#FFFFFF`, black text/icon `#000000`, `4px` radius, a play-triangle icon to the left of the label, comfortable padding (~9px vertical / ~22–27px horizontal). White-on-dark is the highest-contrast element on the page, so the single most important action is also the most visually prominent. It pairs an icon with a one-word verb for instant recognition in any language.

**Secondary — "More Info":** translucent gray fill (`rgba(51,51,51,~0.6)`), white text, same `4px` radius and sizing as Play. Lower contrast = lower priority, establishing a clear two-tier action hierarchy without color.

**Icon buttons:** circular, transparent-dark fill with a `~1px #555` border, white glyph. Used for Add to List (+), Rate (👍), and Expand (ⓥ). Round shape + outline marks them as a distinct utility class.

### Title Cards

The atomic unit of browse. A landscape thumbnail of box art with a `~3px` radius and `overflow: hidden`. On hover (desktop) the card scales up and lifts, neighbors slide aside, and an expanded preview reveals an autoplaying clip, the title logo, quick-action buttons, match %, rating, and genre tags. This **hover-to-preview** interaction is one of Netflix's signature mechanics — it lets users evaluate a title without leaving the row or committing to a click.

### Rows / Sliders

A labeled track of cards with `overflow` clipped to the viewport. Hovering reveals left/right chevron pagers; clicking pages the track by a full "screen" of cards with a smooth slide. The row title sits above in Medium `#E5E5E5`.

### Badges & Metadata

Small, low-emphasis elements: maturity ratings (e.g. "16+") in a subtle bordered chip, "New", "Top 10", and "N Series/Film" tags. These use small sizes (~9–11px) and muted colors so they inform without cluttering.

---

## 7. Motion & Interaction

Netflix's animation is **smooth, eased, and purposeful** — it guides attention and confirms actions, never decorates for its own sake. Measured transitions are short and use ease curves rather than linear motion.

**Card hover expansion.** The defining interaction: a hovered card grows (~1.1–1.5×), elevates with a shadow, and its neighbors translate outward to make room — all eased over a few hundred milliseconds, often with a slight delay so accidental passes don't trigger it. After the delay, an expanded preview fades in with an autoplaying muted clip.

**Billboard autoplay.** The hero trailer fades in and plays muted automatically, with a mute/replay control. Motion in the hero creates cinematic anticipation the moment the page loads.

**Row paging.** Horizontal slides are eased and momentum-like, reinforcing the "shelf" metaphor.

**Nav transition.** The header background cross-fades from transparent to solid on scroll, a subtle state change that keeps the chrome legible without a hard cut.

**Micro-feedback.** Buttons brighten/darken on hover (e.g. red `#E50914` → `#B9090B`, white Play subtly dims), the profile gate animates, and the loading state uses the iconic red-on-black "N" ribbon animation. Everything confirms interactivity instantly.

The guiding rule: **motion should feel like film** — smooth, eased, confident — and should always *mean* something (reveal content, confirm an action, or guide the eye toward Play).

---

## 8. Voice & Language

Netflix's UI copy is **short, friendly, and action-oriented.** Buttons are single verbs ("Play", "Download"). Row titles are conversational and often personalized or playful — "Your Next Watch", "Today's Top Picks for You", "Continue Watching for [Name]", even cheeky ones like "Erase My Memory So I Can Watch Again." The second-person, first-name personalization makes the catalog feel curated *for you*, reinforcing the recommendation engine's value. Copy is globally minimal partly because it must localize across dozens of languages — fewer, simpler words travel better.

---

## 9. Accessibility & Inclusivity

Despite the dark theme, Netflix maintains strong **white-on-near-black contrast** for primary text (well above WCAG AA), and uses gradient scrims behind text over imagery so legibility survives any artwork. Audio Description and SDH subtitle availability are surfaced as first-class metadata, the experience is keyboard-navigable, interactive controls carry ARIA labels (e.g. "More Info", "Play", profile/account labels), and the most important action (Play) is reinforced with both an icon and a text label rather than relying on color alone.

---

## 10. Design Token Summary

```css
:root {
  /* Brand */
  --nf-red:            #E50914;
  --nf-red-dark:       #B9090B;

  /* Surfaces */
  --nf-bg:             #141414;   /* warm near-black canvas */
  --nf-black:          #000000;   /* gradients / vignettes */
  --nf-surface:        #333333;   /* secondary buttons */
  --nf-surface-dark:   #222222;   /* cards / modals */

  /* Text */
  --nf-text:           #FFFFFF;   /* primary */
  --nf-text-heading:   #E5E5E5;   /* row titles */
  --nf-text-muted:     #808080;   /* metadata */
  --nf-border:         #555555;   /* hairlines / icon outlines */

  /* Typography */
  --nf-font: "Netflix Sans","Helvetica Neue","Segoe UI",Roboto,Ubuntu,sans-serif;
  --nf-weight-regular: 400;
  --nf-weight-medium:  500;        /* emphasis / row titles */
  --nf-size-row-title: 21px;
  --nf-size-body:      17px;
  --nf-size-ui:        13px;
  --nf-size-meta:      11px;

  /* Shape */
  --nf-radius-card:    3px;
  --nf-radius-button:  4px;        /* dominant radius */
  --nf-radius-round:   50%;        /* icon buttons */

  /* Layout */
  --nf-nav-height:     70px;       /* sticky, transparent → #141414 on scroll */

  /* Motion */
  --nf-ease:           cubic-bezier(0.4, 0, 0.2, 1);
  --nf-duration-fast:  200ms;      /* hover feedback */
  --nf-duration-card:  300ms;      /* card expansion */
}
```

---

### The essence, in one line
**Netflix is a dark, near-silent stage that disappears so the content can perform** — a warm near-black canvas, one iconic red, a custom sans-serif in two calm weights, gently rounded posters arranged in scrollable shelves, and smooth cinematic motion, all engineered to move you from *browsing* to *Play* as fast as possible.