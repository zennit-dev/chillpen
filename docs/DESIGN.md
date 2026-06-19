Here is the complete, fully expanded DESIGN.md. Copy and replace your existing file with this:

---

```markdown
# DESIGN.md — The Netflix Design System
> A comprehensive reference for what makes Netflix feel like Netflix across every surface: the philosophy, the tokens, the components, the page archetypes, and the reasoning behind every decision. Values were measured from the live Netflix experience across browse, account settings, the help center, profile management, and error pages.

---

## 1. Design Philosophy

Netflix's design exists to serve a single goal: get the viewer watching with the least possible friction. Every visual and interaction decision flows from this. The interface is deliberately self-effacing — a dark, quiet stage whose only job is to make the content (artwork, trailers, titles) the brightest and loudest thing on screen.

Three principles drive everything:

**Content is the interface.** Netflix is not a "designed page" with images placed inside it; it is a grid of imagery that chrome merely frames. The UI recedes (dark, low-contrast, minimal) so that colorful box art pops forward. This is why the background is near-black and the navigation is transparent — the design literally gets out of the way of the content.

**Reduce decisions, reduce friction.** The product is built around browsing, not searching. Horizontally scrolling rows, personalized ranking, autoplaying previews, and a single dominant "Play" button all exist to shorten the distance between opening the app and pressing play. The design optimizes for the lean-back viewer who wants to be guided, not the lean-forward user who wants to configure.

**Cinematic, immersive, and emotional.** Netflix wants the home screen to feel like the lights dimming in a theater. Darkness, full-bleed hero imagery, motion, and atmospheric autoplay create anticipation. The brand is entertainment, and the UI is staged like a trailer.

**Design mode duality.** There are two distinct visual modes in the Netflix product ecosystem. The dark entertainment mode (browse, profiles, player) is immersive, content-first, and cinematic. The light utility mode (account settings, help center) is bright, scannable, and task-oriented. Both use the exact same typeface and spacing scale; only the canvas and contrast flip. This duality is intentional: dark = you're here to enjoy, light = you're here to manage something.

---

## 2. Color System

Netflix uses an intentionally narrow palette in entertainment mode — a near-black canvas, white text, a single iconic red accent, and a handful of grays. Restraint is the point: the only saturated brand color is red, so red always means "Netflix" or "act now." In utility mode (account, help) the canvas inverts to white, but the same red and gray vocabulary carries through.

### Core Palette (measured from live product)

| Role | Hex | RGB | Usage |
|---|---|---|---|
| Brand Red | `#E50914` | `rgb(229, 9, 20)` | Logo, wordmark, sign-in CTAs, key accents, article inline links, active indicators |
| Brand Red Hover | `#B9090B` | `rgb(185, 9, 11)` | Pressed/hover state of red buttons |
| Canvas / Background | `#141414` | `rgb(20, 20, 20)` | Primary app background (entertainment mode) — warm near-black, not pure black |
| Pure Black | `#000000` | `rgb(0, 0, 0)` | Gradient overlays behind text, billboard vignettes, true-black edges |
| Primary Text | `#FFFFFF` | `rgb(255, 255, 255)` | Headings, body in dark mode; highest-contrast reading color |
| Heading Gray | `#E5E5E5` | `rgb(229, 229, 229)` | Row titles — slightly dimmed white to recede behind content |
| Secondary Gray | `#808080` | `rgb(128, 128, 128)` | Muted/secondary text, metadata, inactive nav, profile names on gate |
| Surface Gray | `#333333` | `rgb(51, 51, 51)` | Secondary buttons (More Info), surfaces, dividers in dark mode |
| Surface Dark | `#222222` | `rgb(34, 34, 34)` | Card placeholders, deeper surfaces, modals |
| Hairline Gray | `#555555` | `rgb(85, 85, 85)` | Borders, outlines on circular icon buttons |
| Light Body Text | `#221F1F` | `rgb(34, 31, 31)` | Body copy in help center / utility mode |
| Light UI Text | `#333333` | `rgb(51, 51, 51)` | Secondary text, nav items in utility mode |
| Light Muted | `rgba(0,0,0,0.7)` | — | Inactive tab labels, sub-labels in account settings |
| Utility BG | `#FFFFFF` | `rgb(255, 255, 255)` | Page background in account / help center |
| Utility Surface | `#FAFAFA` | `rgb(250, 250, 250)` | Sidebars, help center footer, subtle surface in account |
| Utility Subtle BG | `#F5F5F1` | `rgb(245, 245, 241)` | Notification zones, subtle content backgrounds |
| Card Border | `rgba(128,128,128,0.4)` | — | 1px border on white cards in account and help center |
| Divider | `rgba(128,128,128,0.2)` | — | Horizontal rule between rows/items in utility pages |
| Near-Black Button | `#0F0F0F` | `rgb(15, 15, 15)` | "Contact Us" CTA in help center — near-black, not pure black |
| Help Link Red | `#E50914` | `rgb(229, 9, 20)` | Inline hyperlinks inside help center article body |

### Color Special: Account Badge Gradient
The "Member since [date]" pill badge in account uses a three-stop diagonal gradient: `linear-gradient(to left, rgb(176, 56, 220), rgb(76, 59, 165), rgb(57, 62, 156))` — a purple-violet sweep that signals premium membership status without using red (which is reserved for action) or white (which is text).

### Color Special: Help Center Search Border Gradient
The search field in the help center has a vivid gradient border: `linear-gradient(to right, #E50914 -0.08%, rgb(201, 79, 245) 81.14%, rgb(91, 121, 241) 99.92%)` — brand red bleeding into violet then into blue. This is the one moment of pure decoration in the Netflix utility palette and it exists to make the search bar unmissable and to signal "this is the Netflix help center, not a generic support page."

### Why These Choices

The background is `#141414` rather than `#000000` deliberately. Pure black against bright artwork creates harsh, fatiguing contrast and makes pixel-level seams visible; a warm near-black is gentler on the eyes during long, dark-room viewing sessions and lets black artwork edges blend seamlessly into the canvas. The dark theme also makes colorful thumbnails look more vivid through simultaneous contrast and reduces screen glow in the living room.

Red is used scarcely and meaningfully. It is reserved almost entirely for the brand mark and the primary conversion action. Because nothing else on a page is red, the eye is trained to read red as "this is the most important thing." Inside the logged-in browse experience the red mostly retreats to the logo — once you're a subscriber, the content should be the color, not the chrome.

Text uses a deliberate gray ramp: pure `#FFFFFF` for things you must read, `#E5E5E5` for row titles that should sit just behind the artwork, and `#808080` for metadata you can ignore. This grayscale hierarchy lets Netflix establish three levels of importance using brightness alone, without any extra colors.

---

## 3. Typography

Netflix commissioned its own typeface, Netflix Sans, with a fallback stack:

```css
/* Browse / entertainment mode */
font-family: "Netflix Sans", "Helvetica Neue", "Segoe UI", Roboto, Ubuntu, sans-serif;

/* Help center / utility mode */
font-family: "Netflix Sans", Helvetica, Arial, sans-serif;
```

### Why a Custom Typeface

Netflix previously licensed Gotham/Helvetica Neue and paid recurring fees scaled to its enormous global reach. Netflix Sans was built in-house to (a) eliminate licensing cost at scale, (b) own a consistent voice across TV, web, mobile, billboards, and on-screen credits, and (c) tune the letterforms for screens: it has a slightly humanist, friendly geometry with a subtly cropped, "cinematic" feel and excellent legibility at small sizes and from a couch's distance. It is a sans-serif because sans-serifs read cleaner on backlit displays and feel modern, neutral, and content-forward — the type should never compete with the imagery.

### Type Scale (measured across all surfaces)

| Token | Size | Weight | Line-Height | Use | Surface |
|---|---|---|---|---|---|
| Help hero heading | 40px | 800 (ExtraBold) | — | "How can we help?" — the single most emphatic text in the system | Help center homepage |
| Article h1 | 32px | 800 (ExtraBold) | — | Article/page titles in help center | Help center article |
| Account h1 | 32px | 700 (Bold) | — | "Account" page title | Account settings |
| Profile gate h1 | ~30px | 400 (Regular) | — | "Who's watching?" — deliberately light-weight so the profiles are the focus, not the label | Profile gate |
| Billboard title | Artwork image | — | — | Featured-title branding; an artwork asset not a font render, preserving each title's bespoke logotype | Browse billboard |
| Row title | ~21px | 500 (Medium) | — | "US Drama Series", "Today's Top Picks" — dimmed to `#E5E5E5` to label without shouting | Browse rows |
| Help section heading h2 | 20px | 700 (Bold) | — | Article section titles | Help center article |
| Body / synopsis | ~17px | 400 (Regular) | — | Hero description, paragraphs on browse | Browse billboard |
| Article body | 16px | 400 (Regular) | 24px (1.5×) | Help center article paragraphs; 24px line-height is generous for long-form reading | Help center |
| Account tab labels | 16px | 400 / 500 active | — | "Overview", "Membership", "Security" — active tab goes to 500, inactive stays at 400 | Account settings |
| UI / nav / labels | 11–14px | 400 / 500 | — | Nav links, button labels, metadata, badges | All |
| Profile name | ~11px | 400 (Regular) | — | Name below profile icon, muted gray `#808080` | Profile gate |
| Meta / badges | 9–11px | 400 | — | "16+", "New Season", "Recently Added" — smallest useful text in the system | Browse cards |

**Weight discipline:** The system uses only two practical weights — 400 (Regular) for content and 500 (Medium) for emphasis. Netflix almost never uses bold/heavy weights in the browse chrome: heaviness would fight the artwork. The help center and account settings introduce 700 (Bold) and 800 (ExtraBold) for page titles because those utility surfaces are text-first, not image-first, and need clear hierarchy through weight rather than color contrast. Importance in the browse is signaled by brightness and size; in utility pages it is signaled by weight and size.

---

## 4. Shape Language & Border Radius

Netflix's shape language is gently rounded, never pill-shaped (except for deliberately "tappable tool" icon buttons). The radius scale clusters tightly around a few values.

| Token | Value | Applied to |
|---|---|---|
| `radius-none` | 0px | Manage Profiles button (ghost border), many legacy chrome elements |
| `radius-sm` | 2–3px | Box art / title cards (3px), small chips in legacy browse chrome |
| `radius-md` | 4px | The dominant radius — Play/More Info buttons, help center search wrapper, "Contact Us" button, browse card corners, small UI chips |
| `radius-card-utility` | 8px | White cards in account settings and help center category cards — slightly softer because they're on white backgrounds where corner sharpness is more noticeable |
| `radius-badge` | `0px 16px 16px 0px` | The "Member since" badge — one flat edge (attached to the card's left wall) and one pill end (floating free into the card), creating a tab/label shape |
| `radius-pill` | `17px` / `50%` | Circular icon buttons (add to list, rate, expand) and notification badges |

### Why These Values

Card and poster corners use a very subtle 2–4px radius — just enough to feel intentional and soft, but small enough that the artwork reads as a near-rectangular "poster" the way physical media does. A large radius would crop into the artwork and feel toylike; a 0px radius would feel harsh and dated. The 4px button radius matches the cards so buttons feel like part of the same visual family.

Utility-surface cards (account, help center) use 8px — a bit softer because they sit on a white background where corner sharpness is more perceptible, and because these surfaces are meant to feel approachable and readable rather than cinematic.

The only fully round shapes are icon buttons (circular, 50% radius with a subtle `#555` border and semi-transparent dark fill). Circles read instantly as "tappable tools" and visually separate utility actions (add to list, rate, expand) from the primary rectangular Play CTA.

---

## 5. Spacing & Layout

Netflix does not publish a formal spacing scale, but consistent patterns emerge from measurement:

### Browse / Dark Mode Layout

The browse page is a vertical stack of two archetypes: one full-bleed Billboard at the top, followed by N horizontally-scrolling content rows.

**The Billboard (hero):** A single featured title fills the top of the viewport edge-to-edge with a still or autoplaying trailer. Overlaid on the left are the title's logotype, a one-line tagline, a short synopsis (~17px body text), and two buttons. A black gradient (`#000 → transparent`) is layered from the bottom-left so white text stays legible over any imagery. Sized to feel like a movie poster come to life — typically 56–65% of viewport height.

**Content rows:** Each row is a labeled, horizontally scrollable carousel of cards. The horizontal-row pattern is core to Netflix: it presents dozens of personalized, themed collections in a compact vertical space, and the lean-back gesture of scrolling sideways through a "shelf" mirrors browsing a video store. Rows render a partial card at the edge to signal "there's more this way" and reveal paging arrows on hover. Row title sits above in Medium `#E5E5E5` at ~21px.

**Navigation bar:** Sticky, initially transparent (`background: rgba(0,0,0,0)`), height measured at **70px**, high z-index. Holds the red logo at left, primary nav links in center, and utility icons at right. Fades to solid `#141414` on scroll so links remain readable over content rows. The bar is intentionally thin and quiet: nav font-size is ~12px, nav links are `#808080` (inactive) and `#FFFFFF` (active/hover).

**Card aspect ratio:** Landscape thumbnails at approximately 16:9. The `overflow: hidden` + `border-radius: 3–4px` combination clips artwork cleanly into the poster shape.

**Grid / rhythm:** Layout is responsive — the number of cards per row scales with viewport width while card aspect ratio stays fixed (typically 3–6 cards visible). Generous dark gutters (~16–24px) separate rows, giving each themed shelf breathing room.

### Utility Mode Layout (Account Settings)

The account settings page flips the canvas to white and adopts a single-column, top-tab layout.

**Nav header:** Height **56px**, white background (`#FFFFFF`), bordered by a 1px `rgba(128,128,128,0.2)` line at the bottom. Contains only the Netflix logo (180×40px rendered size) and a profile dropdown at far right — stripped of the full browse navigation chrome.

**Tab navigation:** Horizontal tabs (Overview / Membership / Security / Devices / Profiles) at 16px, sitting directly below the header under a hairline divider. Active tab uses a red underline indicator (`border-bottom: 2px solid #E50914`). Active tab text is `rgb(0,0,0)` at weight 500; inactive tabs are `rgba(0,0,0,0.7)` at weight 400. No background color change — the indicator is purely the red underline.

**Content cards:** White cards on a white page are differentiated with `border: 1px solid rgba(128,128,128,0.4)` and `border-radius: 8px`. Cards group related actions — membership, quick links, profiles. Card interiors use `hr` dividers with `border: 1px solid rgba(128,128,128,0.2)` between rows.

**List rows (menu items):** Each action row (Change plan, Manage payment, etc.) has an icon on the left, label text at 16px, and a right-pointing chevron `>` on the far right. No background on the row itself — the card container provides the surface. Rows are separated by 1px hairline dividers.

**Page background:** `#FAFAFA` (250,250,250) — a very faint off-white that distinguishes the page from the pure-white card surfaces without creating strong contrast.

**Layout width:** Constrained single column, max-width roughly 600–700px, centered.

### Help Center Layout

**Header:** White background, 66px height, with `border-bottom: 1px solid rgba(128,128,128,0.2)`. Contains the Netflix logo + a vertical pipe divider (`|`) + "Help Center" wordmark label. Profile dropdown at far right. The pipe divider is a subtle compositional signal: it says "this is Netflix, but you're in a sub-zone."

**Hero / search zone:** Large centered area (~40% viewport height) on a near-white `#FAFAF1` background with a subtle `radial-gradient(300% 100% at 50% 0%, rgba(169,185,250,0.15) 0%, rgba(251,251,251,0) 25%)` — a barely-visible lavender blush at the very top of the page. The h1 "How can we help?" is 40px / 800 weight / black, centered. Below it is the full-width search bar with the red-to-purple-to-blue gradient border.

**Search input:** Full-width on desktop, white fill, search icon on the left, 16px placeholder text in gray, `border-radius: 4px` on the inner input. The colored border is achieved via a wrapper div with the gradient as its background and a small white-filled inner div — a CSS gradient-border technique. Below the search bar, recommended link pills ("How to keep your account secure") appear as small underlined links in black.

**Category cards:** Sectioned cards for each help topic (Account and Billing, Fix a Problem, etc.) with `border: 1px solid rgba(128,128,128,0.4)`, `border-radius: 8px`, white background. Inside each card, a colored SVG icon + bold category name at the top, then accordion rows below.

**Accordion rows:** Native `<details>/<summary>` pattern — topic subcategories expand/collapse. Rows have `border-bottom: 1px solid rgba(128,128,128,0.2)`. Chevron indicator rotates on open. Clean, no-JavaScript fallback behavior.

**Article pages:** Full-width article content with a generous left-aligned layout, 16px body text, 24px line-height. Section headings use `h2` at 20px/700. NOTE callout blocks use a `4px solid rgb(213,212,209)` left border (a gray accent, not red) with no background color — a minimal blockquote-style callout. Inline links are `#E50914` with no underline by default; this is the most important brand consistency rule in text-heavy contexts: every red text means "this is a link."

**"Need more help?" footer section:** Light gray (`#FAFAFA`) background, contains a near-black CTA button ("Contact Us"): `background: rgb(15,15,15)`, `color: #FFFFFF`, `border-radius: 4px`, `padding: 12px 20px`, `font-size: 16px`. This near-black (not pure black, not red) button fits neither the brand-action red nor the pure white, signaling "this is a last-resort support action" — not a primary conversion.

---

## 6. Components

### 6.1 Buttons

Netflix uses a strict three-tier button hierarchy across all surfaces:

**Primary — "Play" (browse / dark mode):**
White fill `#FFFFFF`, black text/icon `#000000`, `border-radius: 4px`, play-triangle icon to the left of the label, comfortable padding (~9px vertical / 22–27px horizontal). White-on-dark is the highest-contrast element on the page, so the single most important action is also the most visually prominent. Icon + one-word verb for instant recognition in any language and any context.

**Secondary — "More Info" (browse / dark mode):**
Translucent gray fill `rgba(51,51,51,~0.6)`, white text, same 4px radius and sizing as Play. Lower contrast = lower priority, establishing a clear two-tier hierarchy without introducing color. The `rgba` fill (not `#333333`) lets billboard artwork bleed through slightly, maintaining immersion.

**Red primary (utility / forms):**
`background: #E50914`, `color: #FFFFFF`, `border-radius: 2–4px`. Used in sign-in/sign-up flows, cookie settings, and other high-stakes confirmation actions. The red button in utility contexts carries the same "most important action" semantic as the white Play button in entertainment context. Rule: there is never more than one red button visible at a time.

**Ghost / outline button (utility):**
`background: transparent`, `border: 1px solid #808080`, `color: #808080`, `border-radius: 0px` (notably square). Used for "Manage Profiles" on the profile gate. The square corners and muted gray communicate "secondary utility" — this is a housekeeping action, not a playback action.

**Near-black utility CTA (help center):**
`background: rgb(15,15,15)`, `color: #FFFFFF`, `border-radius: 4px`, `padding: 12px 20px`. A deliberate third color option — used only for "Contact Us" in the help center footer. Not red (not a conversion action) and not gray (not inactive) — it's the highest-priority utility action, so it gets high contrast without the brand red.

**Icon buttons (browse):**
Circular, `border-radius: 50%` (~17px radius), semi-transparent dark fill with `1px solid #555555` border, white SVG glyph. Used for Add to List (+), Rate (👍/👎), and Expand (ⓘ). Round shape + outline marks them instantly as a distinct utility class, visually separate from the rectangular action buttons.

### 6.2 Forms & Inputs

Netflix's form surfaces appear primarily in sign-in, sign-up, help center search, and account management.

**Sign-in form (dark background):**
Full-width on a dark `rgba(0,0,0,0.75)` semi-transparent card overlaid on a blurred background image. Input fields have a dark gray background (`#333`), white text, `border: 1px solid #8c8c8c`, `border-radius: 4px`, 16px font size. On focus, the border brightens to white. Labels float above the input on fill (floating label pattern). Error messages appear in a red-tinted message bar below the input. The "Sign In" button is full-width, red (`#E50914`), `border-radius: 4px`. The overall composition is a centered white-outlined card on a cinematic blurred background — the form feels like an interstitial, not a separate page.

**Help center search input:**
`background: #FFFFFF`, `border-radius: 4px` (inner input and wrapper), `font-size: 16px`, `padding: 9px 16px 9px 52px` (left padding reserves space for the search icon). The outer wrapper has the red-to-blue gradient border treatment. Placeholder text reads "Type a question, topic or issue" in gray. Autocomplete suggestions appear in a dropdown below, styled as a white panel with 16px list items.

**Account settings inputs:**
Standard white inputs with `border: 1px solid rgba(128,128,128,0.4)`, `border-radius: 4px`, inside white card containers. No floating labels — form fields use traditional static labels above. The overall form style is minimal and undecorated — it recedes behind the data it contains.

### 6.3 Title Cards (Browse)

The atomic unit of browse. A landscape thumbnail with `border-radius: 3px` and `overflow: hidden`.

On desktop hover, the card expands (~1.1–1.5× scale) and lifts with a drop shadow; neighbors slide aside; after a short delay (~300ms) an expanded preview card fades in, showing:
- Autoplaying muted clip
- Title logo/artwork
- Quick-action icon buttons (Play, Add to List, Rate, Expand)
- Match percentage (e.g. "97% Match")
- Maturity rating badge (e.g. "13+")
- Genre tags
- Season count

This hover-to-preview interaction is one of Netflix's signature mechanics: it lets users evaluate a title without leaving the row or committing to a full click. The card preview is a micro-version of the full detail modal — same structure, same hierarchy, just compressed.

**Progress bar (Continue Watching):** A thin red bar at the bottom of the card thumbnail indicates playback progress. `background: #E50914`, `height: 3–4px`, sitting flush at the card base inside the rounded bottom corners.

**Badges on cards:**
- "Recently Added" — red pill `#E50914`, white text, `border-radius: 2px`, positioned at bottom-left of card artwork
- "New Season" — same red pill treatment
- "Leaving Soon" — same red pill but semantically different (urgency vs. novelty)
- "Top 10" badge — circular number badge, black background, white text, positioned at bottom-left
These badges are always red on content that requires attention, reinforcing the "red = act now" rule even at card level.

### 6.4 Rows / Sliders

A labeled track of cards with overflow clipped to the viewport. Row structure:
- Row title: `font-size: ~21px`, `font-weight: 500`, `color: #E5E5E5`, positioned above the card track
- Progress indicator: A horizontal thin line below the row title area showing pagination position (thin, muted gray, barely visible)
- Card track: `overflow: hidden` on the container, cards in a horizontal flex row
- Hover reveals left/right chevron pagers (`<` `>`) — circular, semi-transparent, appear only on hover
- Click pages the track by a full "screen" of cards with an eased horizontal slide

The row title uses Medium at a modest size and dimmed white so it labels content without shouting over it — you read it peripherally, then your eye drops to the posters below.

**Special row variant — Schedule/Calendar rows:** For live events (e.g. WWE), rows show date headers ("June 16, 2026") instead of artwork thumbnails — a different layout mode within the same row shell. Dates use large text (~32px), white, left-aligned.

**Special row variant — Text-only cards:** Some rows show dark `#222222` cards with white title text centered — used when artwork hasn't loaded or for non-visual content types. Same `border-radius: 4px`, same dimensions.

### 6.5 Navigation Bar (Browse)

Sticky, `height: 70px`, `position: sticky`, `z-index: high`. Two visual states:

**At top (transparent):** `background: rgba(0,0,0,0)` — completely transparent, the billboard hero bleeds through behind it. Logo and nav links float over the artwork with text shadows for legibility.

**On scroll (solid):** Transitions to `background: #141414` via a smooth CSS cross-fade (not an instant snap). The transition uses `transition: background-color 400ms ease`. This state change keeps links readable over content rows without a jarring visual cut.

**Contents left to right:** Netflix wordmark logo (`color: #E50914`), "Browse" dropdown (or individual nav links on wide viewports — Home / Series / Films / Games / Latest / My List / Browse by Language), then at far right: Search icon, Notifications bell (with red badge counter), Profile avatar (square, `border-radius: 4px`, small).

**Nav link styling:** `font-size: ~12px`, inactive `color: #E5E5E5` / active `color: #FFFFFF`. No underlines. Hover state brightens opacity slightly. The "Browse" dropdown uses a caret icon and opens a mega-menu overlay on hover.

### 6.6 Profile Gate

Full-screen, dark background (`#141414`), vertically and horizontally centered layout. No navigation chrome except the Netflix logo at top-left (small, `color: #E50914`).

**Heading:** "Who's watching?" at `font-size: ~30px`, `font-weight: 400` — notably light weight for a page-level heading. The lightness signals that this is a friendly greeting, not a command or form field label. Color `#FFFFFF`.

**Profile icons:** Square, `border-radius: 4px`, `width: 84px`, `height: 84px` on hover (scales up slightly). Each profile has a colored animated avatar (the expressive emoji-style faces). The color coding (blue, red, teal, green) provides quick visual differentiation without requiring text reading.

**Profile name:** Below icon, `font-size: ~11px`, `color: #808080`. Deliberately small and muted — the avatar/icon is the identifier, the name is the label.

**Lock icon:** A small padlock icon appears below PIN-protected profiles, `color: #808080`. Signals restricted access at a glance.

**"Manage Profiles" button:** Ghost style — `border: 1px solid #808080`, `color: #808080`, `border-radius: 0px`, small font size (~10px). Square corners and muted color position it clearly below the primary "pick a profile" action in visual hierarchy.

**Hover interaction:** On hover, a profile icon scales up slightly (~1.1×), its name brightens to `#FFFFFF`, and a subtle overlay (pencil/edit icon) appears — indicating editability in Manage Profiles mode.

### 6.7 Profile Management Mode

Same dark canvas, same profile grid. Visual changes signal edit mode:
- A pencil/edit overlay icon appears on each card
- Heading changes to "Manage Profiles:" (with colon, more directive)
- "Done" button appears below — white fill, black text, `border-radius: 0px` (square), medium width. The square corners echo the Manage Profiles ghost button, grouping them in the same "management mode" visual language.

### 6.8 Help Center — Category Cards

White background cards (`border: 1px solid rgba(128,128,128,0.4)`, `border-radius: 8px`) containing:
- A colored SVG icon at 32px (red for account/billing, pink/coral for problem-fixing, blue-violet for "Getting Started")
- Bold category title at 16–18px / 700 weight
- Accordion subcategories below, separated by `1px solid rgba(128,128,128,0.2)` hairlines

The accordion uses native `<details>/<summary>` HTML — no JavaScript required for the expand/collapse. The down-chevron icon rotates to an up-chevron when expanded (CSS `transform: rotate(180deg)` on the summary `::marker` or a custom icon).

### 6.9 Help Center — Article / Long-form Text Pages

A clean, editorial layout:
- Back breadcrumb link at top: `← Back to Help Home`, 18px, `color: rgb(245,245,241)` on black-background header transitioning to black text on white article body
- H1: 32px / 800 weight / dark `rgb(34,31,31)`
- H2 section headers: 20px / 700 weight
- Body text: 16px / 400 / `rgb(34,31,31)` / line-height 24px
- Inline links: `color: #E50914`, no underline — they are immediately recognizable as interactive because red means clickable
- NOTE callout blocks: `border-left: 4px solid rgb(213,212,209)` (a warm light gray), no background tint, `padding-left: 16px`. Minimal — the left bar flags "pay attention" without color drama
- Numbered ordered lists: `font-size: 16px`, standard decimal list style
- **"Was this article helpful? Yes / No"** widget at bottom: Two borderless text buttons, 16px, black text. The lack of visual styling makes them feel like a conversational question, not a form element
- **Related articles list:** Plain linked list, 16px, `color: #E50914`, no underline
- **"Need more help? Contact Us"** footer: Near-black CTA button on a `#FAFAFA` background panel

### 6.10 Error / 404 Page

The 404 page is a full-bleed cinematic moment — entirely on-brand:
- Full viewport background filled with dramatic, atmospheric content artwork (e.g. a still from *Lost in Space*)
- A semi-transparent dark overlay ensures text legibility
- Heading "Lost your way?" at large display size / bold / white — playful, brand-voice copy, not cold system language
- Sub-copy "Sorry, we can't find that page. You'll find loads to explore on the home page." — warm and friendly
- "Netflix Home" CTA button: white fill, black text, `border-radius: 4px` — same Play-button treatment, because the goal is to get you back to watching
- Error code in small text: "Error Code NSES-404" using a monospaced rendering in white
- Attribution: "FROM [SHOW NAME]" in small caps at bottom-right, crediting the artwork — even the 404 page is a content discovery moment
- The Netflix logo in the upper left is the only chrome — no full navigation bar. The entire page feels like a title card, not an error page.

### 6.11 Notification / Bell Badge

The notification bell in the browse nav shows a red circular counter badge:
- `background: #E50914`, `color: #FFFFFF`
- `border-radius: 50%`
- Positioned absolutely in the top-right of the bell icon
- Font size: ~9px, font weight: 700
- The red badge is the only red element in the navigation besides the logo, making it instantly eye-catching

### 6.12 Maturity Rating Badges

Appear on billboard ("13+", "16+", etc.):
- `border-left: 4px solid #FFFFFF` — the left bar visually anchors the rating as a certification mark
- White text on semi-transparent dark background
- Small, `font-size: ~10–11px`, placed at bottom-right of the billboard

### 6.13 Footer (Browse, dark mode)

Minimal, sits far below all content rows. Contains:
- Social icons (Facebook, Instagram, YouTube) in `#808080`
- Two-column link grid: Audio Description, Gift Cards, Investor Relations, Terms of Use, Legal Notices, Corporate Information / Help Centre, Media Centre, Jobs, Privacy, Cookie Preferences, Contact Us
- All links `color: #808080`, `font-size: ~13px`
- Netflix service code selector (e.g. "Service Code: XX-XXXX-XXXX")
- Copyright line: "© 1997–[year] Netflix, Inc."
- No horizontal rule separating it from content — the dark canvas is visually continuous; the footer floats on the same background

---

## 7. Motion & Interaction

Netflix's animation is smooth, eased, and purposeful — it guides attention and confirms actions, never decorates for its own sake.

### Easing

All transitions use a material-like ease curve: `cubic-bezier(0.4, 0, 0.2, 1)` — quick to accelerate (responsive feedback) and gradual to decelerate (feels physically satisfying, not mechanical). Linear motion is never used for UI transitions; linear feels like a machine, ease feels like film.

### Key Interactions

**Card hover expansion (browse):** The defining browse interaction. A hovered card:
1. Waits ~300–500ms before expanding (prevents accidental triggers during cursor passes)
2. Scales to ~1.3× its resting size, pushes neighbors aside
3. Lifts with a `box-shadow` elevation
4. Fades in an expanded preview card (autoplaying muted clip + metadata)
All eased over ~300ms. The preview appears on a second delay so fast swipes don't launch dozens of previews. This is deliberately sophisticated: the delay separates intent from accident.

**Billboard autoplay:** Hero trailer fades in and plays muted automatically after a brief pause. Motion in the hero creates cinematic anticipation the moment the page loads. A mute/replay control appears in the bottom-right corner, `opacity: 0` → `1` after a few seconds.

**Row paging:** Horizontal slides are eased and momentum-like, reinforcing the "shelf" metaphor. Clicking the chevron pages by exactly one "window" of cards with a smooth translate, not a jump.

**Nav transition:** Header background cross-fades from `rgba(0,0,0,0)` to `rgba(20,20,20,1)` over ~400ms on scroll start. The change feels gradual and is triggered by the first pixel of scroll — the bar never hides, it only reveals.

**Profile gate animation:** Profiles scale up slightly on hover with a fast (~150ms) ease. Selecting a profile triggers a brief scale-up + fade-out before loading the browse page — the screen appears to "zoom into" the chosen profile.

**Micro-feedback (buttons):** Red buttons `#E50914` darken to `#B9090B` on hover. White Play button dims slightly. Gray More Info button lightens. Icon buttons show an opacity change. All ~150–200ms. Everything confirms interactivity without drawing attention to itself.

**The "N" loading screen:** The iconic red Netflix N logo on a black background with a ribbon animation. This is a brand moment embedded into a loading state — even wait time is branded. The animation uses the N logotype as a kinetic object, reinforcing that you're in an entertainment product.

**Accordion expand (help center):** The chevron icon rotates 180° (`transform: rotate(180deg)`) as the details element opens. Content slides down using native browser disclosure animation. No JavaScript animation — the motion is a browser default, which is intentional: it loads instantly even on slow connections.

**Tab underline (account):** The active tab indicator (`border-bottom: 2px solid #E50914`) snaps immediately rather than sliding — tabs are navigation, not playback. Instant feedback suits the utilitarian context.

### Motion Principles

- Motion should feel like film — smooth, eased, confident
- Motion should always mean something: reveal content, confirm an action, or guide the eye toward Play
- No purely decorative animation in the app chrome (only in the N loading animation, which is branded)
- Duration tiers: 150–200ms for micro-feedback (hover states), 300ms for card expansion, 400ms for nav/page transitions

---

## 8. Page Archetypes

### 8.1 Browse (Entertainment mode, dark)

**Canvas:** `#141414`. **Navigation:** transparent → solid on scroll, 70px. **Content:** Billboard hero + N content rows. **Primary action:** Play (white button). **Mood:** Cinematic, immersive, lean-back.

### 8.2 Profile Gate

**Canvas:** `#141414`. **Layout:** Full-screen centered grid of profile icons. **Interaction:** Single click on icon navigates to browse. **Mood:** Personal, welcoming, minimal.

### 8.3 Profile Management

**Canvas:** `#141414`. **Layout:** Same as profile gate with edit overlays. **Interaction:** Click icon to edit, click "Done" to exit. **Mood:** Functional but still within the dark entertainment shell.

### 8.4 Account Settings (Utility mode, light)

**Canvas:** `#FFFFFF / #FAFAFA`. **Navigation:** White header 56px with red-underline tabs. **Cards:** White with `rgba(128,128,128,0.4)` borders, `border-radius: 8px`. **Body text:** `rgb(51,51,51)`, 16px. **Primary action color:** `#E50914` for the active tab indicator and any confirmation buttons. **Mood:** Clean, administrative, trust