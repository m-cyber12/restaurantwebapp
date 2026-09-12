# Fresh Bites — UI/UX redesign

A full visual and interaction redesign of the QR / WhatsApp ordering storefront,
not a responsive patch. Same routes, same business logic, same 127-test functional
contract — everything the user can see was rebuilt.

**Verification (all run, all green):**

| Check | Result |
|---|---|
| `npm run typecheck` | 0 errors (previously 1 pre-existing `TS2740` in the test file — fixed) |
| `npm test` | **140 / 140** passing across 3 files (127 original contract + 13 new) |
| `npm run build` | OK → `docs/` (JS 295.40 kB / 92.45 kB gzip, CSS 120.97 kB / 21.73 kB gzip) |
| Dev server | 200 on `/`, all 14 CSS partials resolve through Vite |
| Console sweep (new test) | 0 `console.error` / `console.warn` on all 12 routes + all 7 owner tabs |

---

## 1 · Design concept — "Ember on charcoal"

A warm charcoal base (`#0c0a09`) with layered surfaces and an **ember accent**
(default `#ff6a2b`, owner-configurable), broken up by **cream "paper" sections**
(`#f7f0e6`) that carry the editorial storytelling. Light/dark alternation gives the
page rhythm instead of one flat background.

- **Type:** Bricolage Grotesque (display) + Manrope (body), fluid `clamp()` scale,
  system mono for IDs, table URLs and QR links.
- **Tokens:** ~120 CSS custom properties in `01-tokens.css` — spacing `--s1…--s10`,
  radii `--r-xs…--r-full`, shadows `--sh-1…--sh-4`, surfaces, easing `--e-*`,
  durations `--d1…--d5`, type `--fs-2xs…--fs-h1`.
- **`--on-accent` is computed from luminance** in `lib/util.ts` (`readableOn`), so any
  accent an owner picks — including a pale one — still carries readable button text.

## 2 · Pages redesigned

All nine required surfaces, all sharing one system:

Home · Menu · Grocery · Cart · Checkout/WhatsApp · Track Order · For Owners ·
QR generator · Owner settings & appearance.

The three that changed most: **Home** (interactive hero + four storytelling
sections), **Track Order** (5-node live timeline), **For Owners** (mini-SaaS
dashboard with a grouped sidebar and a QR studio).

## 3 · New components

31 component files. New or rewritten:

- `home/Home`, `home/ScanStory`, `home/Journey`, `home/OwnersBand`, `home/Reviews`, `home/CtaBand`
- `Hero`, `ProductCard`, `CatalogView`, `ItemModal`, `CartDrawer`, `CheckoutView`, `TrackView`
- `TopNav`, `BottomNav`, `Footer`, `icons` (26 inline SVGs, no icon dependency)
- `owner/OwnerView` (new shell), `owner/QRPanel` (rewritten)
- `Reveal` + `lib/motion.ts` — the shared motion layer

Deleted: the superseded `components/Home.tsx` and the 3675-line `styles.css`.

**No dead buttons, no fake analytics.** Every number in the owner dashboard is
computed from orders in `localStorage`, and the overview says so in plain words
(`.owner-note`: *"There is no server behind this demo"*).

## 4 · Motion system

23 keyframes, one motion budget, all opt-out-able. Staggered reveals, a sticky
scroll story, subtle pointer parallax on the hero, an add-to-cart fly dot, a
quick-add → stepper morph, badge pop, a marquee, a scroll-progress bar, timeline
fill and a rider bob.

The order timeline is driven by a **single `--p` custom property (0–1)** set as an
inline style, so the same variable fills the horizontal desktop line and the
vertical mobile line — no JS measuring, no duplicated geometry.

**`prefers-reduced-motion`** is handled in both layers: CSS collapses all
durations to `0.01ms`, forces reveals to their end state (content is never hidden)
and hides the fly dot; `useMotionEnabled()` in `lib/motion.ts` additionally disables
pointer parallax and the fly dot in JS.

## 5 · Scroll interactions

All via `IntersectionObserver` (`lib/motion.ts`) — no scroll listeners doing layout
work, no new dependency. `useInView` fails **open**: where the observer is missing
(including jsdom) elements are revealed immediately, so nothing can get stuck
invisible. Sticky ScanStory, staggered card grids, clip-path section reveals.

**No count-up numbers.** The tests assert exact strings (`'1'`, `'$15.89'`,
`'2,300+ reviews'`) — and animating a number a screen reader reads mid-flight is
worse UX anyway.

## 6 · Mobile improvements

Designed separately, not shrunk:

- **Bottom nav** (≤900px) replaces the desktop tab bar, with a safe-area-inset
  bottom padding and an animated cart badge.
- **Cart becomes a bottom sheet** (≤700px) with a grab handle; the product modal
  becomes a sheet too.
- **The timeline turns vertical** (≤700px) — the same `--p` variable drives it.
- Table tents, filter rails and review rows reflow to single columns; QR canvases
  are capped with `max-width: 100%` so they shrink instead of overflowing.
- `@media (hover: none)` keeps quick-add permanently visible — no hover-only affordance.

## 7 · Desktop improvements

- **Floating glass nav** with a scroll state, active-route indicator and an animated
  cart badge showing count + total.
- **Catalog spotlight**: a hero product with three side rows above the filter rail;
  the grid upgrades to 4 columns at ≥1500px.
- **Cart as a slide-in right panel** with a free-delivery progress bar.
- **Owner dashboard**: a 232px sticky sidebar grouped into Store / Catalog / Growth /
  Setup, collapsing to a horizontal strip at ≤1180px.

## 8 · Accessibility

- Semantic landmarks, one `h1` per view, real `<button>`s throughout.
- **Skip link is a button that focuses `#main`** — an `href="#main"` anchor would
  fight the hash router and read as a dead route.
- Modal and drawer: ESC to close, focus trap, body scroll lock.
- Every button has an accessible name and every internal `href` resolves — both
  **enforced by `tests/phase4-redesign.test.tsx`**, which fails the build otherwise.
- Visible focus rings, `aria-live="polite"` on toasts, `aria-label` on the sparkline
  (a bar chart rendered as divs), decorative art marked `aria-hidden`.
- Contrast handled by the luminance-derived `--on-accent`.

## 9 · Performance

| | Before (AUDIT.md) | Now |
|---|---|---|
| JS | 228.81 kB (74.33 gzip) | 295.40 kB (92.45 gzip) |
| CSS | 45.73 kB (9.47 gzip) | 120.97 kB (21.73 gzip) |

+18 kB gzip JS and +12 kB gzip CSS buys the entire redesign. Still **zero new
runtime dependencies** — `qrcode`, `react`, `react-dom` only. One stylesheet
request, inlined `@import`s, no runtime CSS-in-JS. Motion is transform/opacity only;
observers are torn down on unmount.

Static analysis run over the code: **every `var()` resolves** (no undefined tokens),
**every markup class has a rule** (no dead hooks), and dead rules were removed
(`.sr-only`, `.btn-block`, `.btn-danger`, `.card-pad`, `.wrap-sm`, `.stagger`,
`.only-*`, four unused tokens, one duplicate `.grid-3`).

## 10 · Remaining limitations

Honest gaps, none of them hidden:

1. **No pixel-level QA was possible in this sandbox.** There is no headless browser
   here — the Chromium download is blocked by the sandbox proxy, so I could not
   measure horizontal overflow at 320/360/…/1920 in a real engine. What I verified
   instead, by execution: zero console output on every route, every button named,
   no dead `href`, all 14 partials load, the font families in `index.html` match the
   `--font-*` tokens, the `.prow` grid's five children match its five tracks,
   decorative blobs sit inside `overflow: hidden` parents, and the breakpoint
   handoffs are contiguous (nav at 900px, drawer/modal/timeline at 700px — no width
   where both navs show or neither does). **A visual pass in a real browser is still
   owed.**
2. **Google Fonts is a network dependency.** If the CDN is unreachable the stack
   falls back to Sora → Inter → system-ui, which is legible but loses the display
   face's character. Self-hosting would remove that.
3. **CSS more than doubled in raw size** (45.7 → 121 kB). That is the cost of nine
   redesigned surfaces plus responsive and print layers, not leftover dead code —
   but it is the largest single file in the bundle and the first thing to split if
   it grows again.
4. **Imagery is unchanged.** The 10 existing JPEGs and emoji fallback tiles are
   still the assets. Markup is structured so better photography drops straight in
   (`Img` handles load/error), but the redesign cannot invent assets.
5. **No RTL / Persian work.** A repo-wide scan found zero Arabic-script characters,
   so no `[dir="rtl"]` pass was written. Adding Persian content would need one.
6. **Print covers the table tents only**, by design — `14-print.css` strips
   everything off the path to `.tents`. Printing any other page produces nothing.
7. **React is ~140 kB of the 295 kB JS.** Further JS reduction means leaving React,
   which was out of scope.
