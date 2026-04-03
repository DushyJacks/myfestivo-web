# save.design — Complete Design System & Implementation Prompt

> **A pixel-perfect clone specification for save.design**
> Use this document as a prompt for any frontend AI tool (Cursor, v0, Lovable, Claude, Bolt, etc.)

---

## MASTER IMPLEMENTATION PROMPT

Copy and paste everything below this line as your implementation prompt:

---

```
Build a pixel-perfect landing page clone of save.design — a dark-themed SaaS product for organizing design inspiration. The page must feel premium, editorial, and motion-rich. Every detail below is non-negotiable.

Follow this specification exactly.
```

---

## 1. VISUAL IDENTITY & BRAND FEEL

**Product tagline:** "Organize your design inspiration."
**Tone:** Premium dark SaaS. Confident. Minimal copy. Maximum white space. The kind of site a senior designer would ship.
**Aesthetic direction:** Refined brutalist dark — near-black backgrounds, crisp off-white type, a single vivid accent color (electric indigo or violet-leaning purple `#7C5CFC`), with frosted-glass card surfaces and subtle grain overlays. Think Linear.app meets Vercel.

---

## 2. COLOR PALETTE

```css
:root {
  /* Backgrounds */
  --bg-base:        #0A0A0F;   /* deepest background — near-black with blue undertone */
  --bg-surface:     #111118;   /* section backgrounds */
  --bg-card:        #16161F;   /* card fill */
  --bg-card-hover:  #1E1E2A;   /* card hover state */
  --bg-glass:       rgba(255, 255, 255, 0.04); /* frosted glass panels */

  /* Borders */
  --border-subtle:  rgba(255, 255, 255, 0.07);
  --border-card:    rgba(255, 255, 255, 0.09);
  --border-accent:  rgba(124, 92, 252, 0.4);

  /* Text */
  --text-primary:   #F2F2F5;   /* headlines */
  --text-secondary: #9090A8;   /* body / descriptors */
  --text-muted:     #55556A;   /* captions, labels */
  --text-inverse:   #0A0A0F;   /* text on light/accent buttons */

  /* Accent */
  --accent:         #7C5CFC;   /* primary violet */
  --accent-bright:  #9B7EFF;   /* hover state */
  --accent-dim:     rgba(124, 92, 252, 0.15); /* tinted backgrounds */
  --accent-glow:    rgba(124, 92, 252, 0.35); /* glow shadows */

  /* Gradients */
  --gradient-hero:  radial-gradient(ellipse 80% 60% at 50% -10%, rgba(124, 92, 252, 0.25) 0%, transparent 70%);
  --gradient-card:  linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%);
  --gradient-cta:   linear-gradient(135deg, #7C5CFC 0%, #A855F7 100%);

  /* Utility */
  --radius-sm:  6px;
  --radius-md:  12px;
  --radius-lg:  20px;
  --radius-xl:  28px;
  --radius-pill: 999px;
}
```

---

## 3. TYPOGRAPHY

**Font Stack:**

```css
/* Headlines */
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&display=swap');

/* Body */
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

/* Mono (labels, badges) */
@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&display=swap');

:root {
  --font-display: 'Syne', sans-serif;
  --font-body:    'DM Sans', sans-serif;
  --font-mono:    'DM Mono', monospace;
}
```

**Type Scale:**

| Role | Font | Size | Weight | Line Height | Letter Spacing |
|---|---|---|---|---|---|
| Hero H1 | Syne | clamp(52px, 7vw, 88px) | 800 | 1.0 | -0.03em |
| Section H2 | Syne | clamp(36px, 4.5vw, 56px) | 700 | 1.1 | -0.02em |
| Card Title | Syne | 20px | 600 | 1.3 | -0.01em |
| Body Large | DM Sans | 18px | 300 | 1.7 | 0 |
| Body | DM Sans | 16px | 400 | 1.6 | 0 |
| Caption | DM Sans | 13px | 400 | 1.5 | 0.01em |
| Badge/Label | DM Mono | 11px | 500 | 1 | 0.08em |

---

## 4. PAGE STRUCTURE (top to bottom)

### 4.1 NAVIGATION (sticky, glass)

```
[Logo]                    [Docs] [Pricing] [Login]  [Get Started →]
```

- Position: `fixed`, top: 0, full-width, z-index: 100
- Background: `rgba(10,10,15,0.7)` with `backdrop-filter: blur(20px) saturate(1.8)`
- Bottom border: `1px solid var(--border-subtle)`
- Height: 64px on desktop, 56px on mobile
- Logo: wordmark "save.design" in Syne 700. "save." in `--text-primary`, ".design" in `--accent`
- Nav links: DM Sans 15px, color `--text-secondary`, hover → `--text-primary`, transition 200ms
- "Get Started" CTA button:
  - Background: `var(--gradient-cta)`
  - Padding: `10px 22px`
  - Border-radius: `var(--radius-pill)`
  - Font: DM Sans 14px 500
  - Box-shadow on hover: `0 0 20px var(--accent-glow)`
  - Transition: all 250ms ease
- Scroll behavior: nav adds `box-shadow: 0 1px 0 var(--border-subtle)` after 10px scroll

---

### 4.2 HERO SECTION

**Layout:**
- Full viewport height (`100dvh`), centered column
- Max-width: 780px, text-align: center
- Padding-top: 140px (accounts for nav)

**Background FX (layered, z-indexed):**
1. Base: `var(--bg-base)`
2. Hero radial gradient: `var(--gradient-hero)` — large violet bloom, centered top
3. Noise grain overlay: `opacity: 0.035` SVG/canvas turbulence noise
4. Optional: 3–4 blurred circular orbs (`border-radius: 50%`, `filter: blur(120px)`, `opacity: 0.15`) in violet/indigo tones scattered asymmetrically

**Content stack (top to bottom, staggered fade-in on load):**

```
┌─────────────────────────────────┐
│  [BADGE]  ✦ New — Browser ext.  │  ← pill badge, DM Mono uppercase
│                                 │
│   Stop losing your              │
│   best ideas.                   │  ← H1, white, line breaks intentional
│                                 │
│  One clean space to save,       │
│  organize, and revisit          │  ← Body Large, --text-secondary
│  everything that inspires you.  │
│                                 │
│   [Get Started Free]  [See Demo ▶]  │  ← CTA pair
│                                 │
│  ✓ Free forever  ✓ No card      │  ← trust micro-copy, DM Mono 11px
└─────────────────────────────────┘
```

**Badge:**
- Background: `var(--accent-dim)`
- Border: `1px solid var(--border-accent)`
- Border-radius: `var(--radius-pill)`
- Padding: `6px 14px`
- Text: DM Mono 11px, uppercase, color `--accent-bright`
- Prefix dot: `✦` or small circle with `background: var(--accent)`, `border-radius: 50%`, width/height 6px

**H1 treatment:**
- "Stop losing your" → `--text-primary`
- "best ideas." → same, but last word or phrase can get a subtle underline drawn with SVG `<path>` that animates in (stroke-dashoffset trick), color `--accent`

**CTA Buttons:**
- Primary "Get Started Free": gradient bg, pill, box-shadow glow on hover
- Secondary "See Demo ▶": `background: var(--bg-glass)`, `border: 1px solid var(--border-card)`, pill, hover → border becomes `--border-accent`

**Entry animations (CSS, staggered):**
```css
.hero-badge     { animation: fadeUp 0.6s ease 0.1s both; }
.hero-h1        { animation: fadeUp 0.7s ease 0.25s both; }
.hero-body      { animation: fadeUp 0.7s ease 0.4s both; }
.hero-ctas      { animation: fadeUp 0.7s ease 0.55s both; }
.hero-trust     { animation: fadeUp 0.6s ease 0.7s both; }

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

---

### 4.3 SOCIAL PROOF BAR

Slim horizontal band directly below hero, ~64px tall.

```
Loved by  [avatar] [avatar] [avatar] [avatar] [avatar]  2,400+ designers
```

- Avatars: 32px circles, overlapping by 10px, with `border: 2px solid var(--bg-base)`
- Stars: ★★★★★ in `--accent` (#7C5CFC)
- Text: DM Sans 14px, `--text-secondary`
- Separator: `|` in `--text-muted`
- Optional: slim top/bottom border `var(--border-subtle)`

---

### 4.4 PRODUCT SCREENSHOT / APP PREVIEW

Full-width section, `--bg-surface` background.

**Floating dashboard mockup:**
- Show a dark UI dashboard/grid of saved design cards
- Container: `max-width: 1100px`, centered, `border-radius: var(--radius-xl)`
- `border: 1px solid var(--border-card)`
- `box-shadow: 0 40px 120px rgba(0,0,0,0.6), 0 0 0 1px var(--border-subtle), inset 0 1px 0 rgba(255,255,255,0.05)`
- Hover: slight `transform: translateY(-4px)` with 600ms ease transition

**The mockup shows a masonry/grid of saved design cards, each card contains:**
- Thumbnail (screenshot preview area with subtle skeleton shimmer if image is loading)
- Bottom bar: favicon + site name + tag pill
- Cards use `--bg-card` background, `--border-card` border, `var(--radius-md)` radius

**Scroll-triggered reveal:**
- Section fades + slides up `40px` as it enters viewport
- Use `IntersectionObserver` or CSS `animation-timeline: scroll()`

**Background details:**
- Large violet radial glow behind the mockup: `radial-gradient(ellipse 70% 50% at 50% 100%, rgba(124,92,252,0.12) 0%, transparent 70%)`

---

### 4.5 MARQUEE / SCROLLING LOGO BAR

Two rows of continuously scrolling website thumbnails (cards), moving in opposite directions.

**Structure:**
```html
<div class="marquee-wrapper">
  <div class="marquee-row marquee-left">
    <!-- 12+ site preview cards, duplicated for infinite loop -->
  </div>
  <div class="marquee-row marquee-right">
    <!-- 12+ site preview cards, duplicated for infinite loop -->
  </div>
</div>
```

**Card design:**
- Width: 200px, height: 130px, `--bg-card` bg, `--border-card` border, `var(--radius-md)` radius
- Inner: thumbnail area (placeholder gradient) + small bottom tag
- Gap between cards: 16px
- Hover on a card: `transform: scale(1.04)`, `border-color: var(--border-accent)`, transition 300ms

**Animation:**
```css
@keyframes scrollLeft {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
@keyframes scrollRight {
  from { transform: translateX(-50%); }
  to   { transform: translateX(0); }
}

.marquee-left  { animation: scrollLeft  35s linear infinite; }
.marquee-right { animation: scrollRight 40s linear infinite; }

/* Pause on hover */
.marquee-wrapper:hover .marquee-row { animation-play-state: paused; }
```

**Edge fade masks:**
```css
.marquee-wrapper {
  -webkit-mask-image: linear-gradient(
    to right, transparent 0%, black 8%, black 92%, transparent 100%
  );
  mask-image: linear-gradient(
    to right, transparent 0%, black 8%, black 92%, transparent 100%
  );
}
```

**Row gap:** 20px between the two rows. Section padding: 80px vertical.

---

### 4.6 FEATURES SECTION

**Layout:** 2-column or 3-column bento grid of feature cards.

**Section header (centered, above grid):**
```
Everything you need to  [line break]
never lose inspiration again.
```
- H2, centered
- Subtitle: 18px DM Sans, `--text-secondary`, max-width 480px, centered below

**Feature cards (6 cards in a bento layout):**

Bento grid suggestion:
```
┌──────────────────┬──────────────────┐
│   Card 1 (wide)  │   Card 2         │
├────────┬─────────┤                  │
│ Card 3 │ Card 4  ├──────────────────┤
│        │         │   Card 5 (wide)  │
├────────┴─────────┴──────────────────┤
│              Card 6 (full)          │
└─────────────────────────────────────┘
```

**Each feature card:**
- Background: `var(--bg-card)`
- Border: `1px solid var(--border-card)`
- Border-radius: `var(--radius-xl)` for large, `var(--radius-lg)` for small
- Padding: 32px
- On hover: `background: var(--bg-card-hover)`, `border-color: var(--border-accent)`, transition 300ms

**Card internals:**
```
[Icon or mini illustration area]  ← 48x48, accent color, rounded square bg
[Feature title]                   ← Syne 20px 600
[Feature description]             ← DM Sans 15px, --text-secondary, line-height 1.6
```

**Features to include:**
1. **Save in one click** — Browser extension saves any site instantly
2. **Smart collections** — Auto-organize by tag, color, category
3. **Full-page screenshots** — Capture the whole page, not just a link
4. **Search everything** — Find any saved inspiration in seconds
5. **Share boards** — Send curated collections to teammates
6. **Dark-first design** — Built for late-night design sessions

**Icon style:** 24px line icons (Lucide or Phosphor), color `--accent`, inside a `40x40` square with `background: var(--accent-dim)`, `border-radius: var(--radius-sm)`

---

### 4.7 HOW IT WORKS SECTION

Three-step horizontal flow, alternating text + visual.

**Section heading (centered):**
```
Simple as  [highlight]  1, 2, 3.
```
(Highlight: H2 word "1, 2, 3" with a wavy SVG underline in `--accent`)

**Steps (horizontal on desktop, vertical on mobile):**

```
[Step 1]          [Step 2]          [Step 3]
Install ext.   →  Save anything  →  Find it later
   Icon               Icon              Icon
Description       Description       Description
```

- Step number: DM Mono, 11px, uppercase, `--text-muted`, letter-spacing wide
- Step title: Syne 22px 700, `--text-primary`
- Description: DM Sans 15px, `--text-secondary`
- Arrow connectors: `--text-muted`, hidden on mobile
- Step cards: same card treatment as feature cards but simpler, with a large centered illustration area (80x80 icon or UI snippet)

---

### 4.8 TESTIMONIALS SECTION

**Background:** `var(--bg-surface)` — slight step up from base

**Section header:**
```
Don't take our word for it.
```
(H2, centered, optional subtitle)

**Testimonial layout:** 3-column masonry grid of quote cards

**Each testimonial card:**
```
[Avatar 40px] [Name] [Handle/Role]       [★★★★★]

"  The quote text goes here — should be
   genuine-sounding, specific, and not
   too long. 2–4 sentences max.  "

[Product logo or source badge]
```

- Card: `var(--bg-card)`, `var(--border-card)` border, `var(--radius-lg)` radius, padding 24px
- Quote marks: large `"` character, Syne 72px, `--accent-dim`, positioned behind text
- Name: DM Sans 14px 500, `--text-primary`
- Handle: DM Mono 12px, `--text-muted`
- Stars: `--accent` (#7C5CFC)
- On hover: lift effect `translateY(-2px)` + subtle box-shadow

**Grid animation:** Cards stagger-reveal with `IntersectionObserver` — each column starts delayed (0ms, 150ms, 300ms).

---

### 4.9 PRICING SECTION

**Section header (centered):**
```
Simple pricing.
No surprises.
```

**Toggle:** "Monthly / Yearly" pill toggle — when Yearly is active, show "Save 40%" badge in `--accent`

**Cards:** 2 or 3 cards (Free, Pro, Team)

**Card anatomy:**
```
[Plan name — Syne 18px 600]
[Price — Syne clamp(42px,5vw,52px) 800]   [/month]
[One-line pitch — DM Sans, --text-secondary]

[CTA Button]

───────────────────
[✓] Feature one
[✓] Feature two
[✓] Feature three
...
```

**Recommended/Popular card:**
- Add `border: 1px solid var(--accent)` instead of `--border-card`
- Add `box-shadow: 0 0 40px var(--accent-glow)`
- Add a pill badge "Most Popular" at top: `background: var(--gradient-cta)`, white text

---

### 4.10 FINAL CTA SECTION

Full-width dark card/panel with violet glow treatment.

```
      Stop losing great designs.
      Start saving them.

      [Get Started Free — It's free]
      
      No credit card · 2 min setup
```

- Container: `--bg-card` bg, `border-radius: var(--radius-xl)`, centered, `max-width: 800px`
- Background glow behind container: large radial violet gradient
- H2: Syne, large, centered
- Subtitle: DM Sans 16px, `--text-secondary`
- CTA button: full gradient treatment
- Trust line: DM Mono 12px, `--text-muted`

---

### 4.11 FOOTER

```
[Logo + Tagline]          [Product] [Company] [Legal]
                          Links      Links     Links

───────────────────────────────────────────────────
© 2025 save.design    [Twitter] [GitHub] [Discord]
```

- Background: `var(--bg-base)`, top border `var(--border-subtle)`
- Logo: same as nav
- Link columns: DM Sans 14px, `--text-secondary`, hover `--text-primary`
- Column headers: DM Mono 11px uppercase, `--text-muted`, letter-spacing wide
- Social icons: 20px, `--text-muted`, hover `--text-primary`, transition 200ms
- Copyright: DM Sans 13px, `--text-muted`

---

## 5. MICRO-INTERACTIONS & EFFECTS (critical for authenticity)

### Cursor
Default cursor. No custom cursor needed (keep it clean).

### Hover States
```css
/* All interactive cards */
.card {
  transition: background 250ms ease, border-color 250ms ease,
              transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1),
              box-shadow 300ms ease;
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px var(--border-accent);
}
```

### Button Glow
```css
.btn-primary:hover {
  box-shadow: 0 0 0 4px var(--accent-dim), 0 8px 30px var(--accent-glow);
}
```

### Smooth Scrolling
```css
html { scroll-behavior: smooth; }
```

### Scroll-triggered Section Reveals
```javascript
const observer = new IntersectionObserver(
  (entries) => entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('visible');
  }),
  { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
);

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
```
```css
.reveal {
  opacity: 0;
  transform: translateY(32px);
  transition: opacity 0.7s ease, transform 0.7s ease;
}
.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}
```

### Noise Grain Overlay
```css
body::after {
  content: '';
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  opacity: 0.03;
  pointer-events: none;
  z-index: 9999;
}
```

### Number Counter Animation (for stats section if present)
```javascript
// Animate numbers when in view: "2,400+" users, "10k+ saves", etc.
function animateCounter(el, target, duration = 1500) {
  let start = 0;
  const step = (timestamp) => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    el.textContent = Math.floor(progress * target).toLocaleString() + '+';
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
```

---

## 6. RESPONSIVE BREAKPOINTS

```css
/* Mobile first */
/* Base: 0–639px */
/* Tablet: 640px–1023px */
/* Desktop: 1024px+ */
/* Wide: 1280px+ */

:root {
  --container-max: 1200px;
  --container-pad: clamp(20px, 5vw, 80px);
}

.container {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0 var(--container-pad);
}
```

**Mobile-specific adjustments:**
- Nav: hamburger menu, full-screen drawer with same glass bg
- Hero H1: 44px, stacked CTAs (100% width each)
- Feature grid: single column
- Testimonials: horizontal scroll snap (no grid)
- Pricing: vertical stack
- Marquee: single row, slower speed (50s)
- Bento grid: all cards full-width, stacked

---

## 7. PERFORMANCE RULES

- Fonts: `display=swap` + preconnect to `fonts.googleapis.com`
- Images: `loading="lazy"`, `decoding="async"`, explicit `width`/`height`
- Animations: check `prefers-reduced-motion`
- No external JS dependencies except fonts (vanilla CSS + JS only)
- Marquee uses `will-change: transform` only on `.marquee-row`

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
  .marquee-row { animation: none; }
}
```

---

## 8. HTML SKELETON

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>save.design — Organize your design inspiration</title>
  <meta name="description" content="One clean space to save, organize, and revisit everything that inspires you.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
</head>
<body>
  <nav class="nav" id="nav">...</nav>
  <main>
    <section class="hero" id="hero">...</section>
    <section class="social-proof">...</section>
    <section class="app-preview">...</section>
    <section class="marquee-section">...</section>
    <section class="features" id="features">...</section>
    <section class="how-it-works">...</section>
    <section class="testimonials">...</section>
    <section class="pricing" id="pricing">...</section>
    <section class="final-cta">...</section>
  </main>
  <footer class="footer">...</footer>
</body>
</html>
```

---

## 9. SECTION SPACING

| Section | Padding Top | Padding Bottom |
|---|---|---|
| Nav | — | — |
| Hero | 160px | 100px |
| Social Proof | 32px | 32px |
| App Preview | 100px | 120px |
| Marquee | 80px | 80px |
| Features | 120px | 120px |
| How It Works | 100px | 100px |
| Testimonials | 100px | 100px |
| Pricing | 100px | 120px |
| Final CTA | 80px | 80px |
| Footer | 64px | 48px |

---

## 10. KEY COPY REFERENCE

| Element | Copy |
|---|---|
| Nav CTA | Get Started |
| Hero Badge | ✦ New — Browser Extension Live |
| Hero H1 | Stop losing your best ideas. |
| Hero Subtitle | One clean space to save, organize, and revisit everything that inspires you. |
| Hero CTA Primary | Get Started Free |
| Hero CTA Secondary | See Demo ▶ |
| Hero Trust | ✓ Free forever &nbsp;·&nbsp; ✓ No credit card |
| Features H2 | Everything you need to never lose inspiration again. |
| HowItWorks H2 | Simple as 1, 2, 3. |
| Testimonials H2 | Don't take our word for it. |
| Pricing H2 | Simple pricing. No surprises. |
| Final CTA H2 | Stop losing great designs. Start saving them. |
| Final CTA Sub | No credit card · 2 min setup |

---

## 11. FINAL CHECKLIST BEFORE SHIPPING

- [ ] All CSS custom properties defined in `:root`
- [ ] `prefers-reduced-motion` media query applied
- [ ] Marquee pauses on hover
- [ ] Hero badge, H1, CTAs stagger-animate on load
- [ ] All sections reveal on scroll with `IntersectionObserver`
- [ ] Nav becomes glassy on scroll (10px threshold)
- [ ] Pricing toggle (Monthly/Yearly) is functional
- [ ] Mobile nav hamburger opens/closes correctly
- [ ] Fonts load with `display=swap`
- [ ] Images have `loading="lazy"` and explicit dimensions
- [ ] No layout shift (CLS = 0)
- [ ] Keyboard navigable (focus rings visible)
- [ ] Dark grain overlay applied via pseudo-element (not on top of interactive elements)
- [ ] Violet glow orbs render behind content (negative z-index or pointer-events: none)

---

*This design.md was generated as a complete prompt-ready specification. Feed it directly into Cursor, v0, Lovable, Bolt, or Claude Artifacts to get a production-ready implementation.*