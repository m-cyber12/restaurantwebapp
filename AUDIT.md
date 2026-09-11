# Fresh Bites — Phase 1 Audit & Phase 2 Fix Log

Audited against `Fresh_Bites_AI_Improvement_Plan_EN.md`.

> **Note:** this file lives at the repo root, not in `docs/`. `docs/` is Vite's
> build output directory (`vite build --outDir docs`) and Vite **empties it on
> every build** — the first copy of this report was deleted by `npm run build`.

**Method:** full source read of all 26 source files, a production build, and a
74-case automated DOM test suite (`tests/phase1-audit.test.tsx`) that drives the
**real** app through real user events — clicks, typing, form submits — not mocks
of the logic.

---

## 1. Stack & architecture

| | |
|---|---|
| Framework | React 18 + TypeScript + Vite 5 |
| Router | hand-rolled hash router (`viewFromHash` in `src/store.tsx`) |
| State | single React context (`AppProvider`), `useApp()` hook |
| Persistence | `localStorage` via `load()`/`save()` in `src/lib/util.ts` |
| QR | `qrcode` npm package → `<canvas>` |
| Styling | one 2,894-line `src/styles.css`, CSS custom properties, 3 breakpoints + print |
| Backend | **none** — all data is local/demo |

Routes: `#/` (home), `#/menu`, `#/grocery`, `#/checkout`, `#/track`, `#/store`.
Unknown hashes correctly fall back to home (verified).

Baseline build was clean: `tsc --noEmit` → 0 errors; `vite build` → 228.81 kB JS
(74.33 kB gzip), 45.73 kB CSS (9.47 kB gzip).

---

## 2. Working features (verified by test, not by inspection)

| Feature | Evidence |
|---|---|
| Navigation between all 6 views | top-nav tabs switch views; deep-link `#/checkout` works cold |
| Unknown route → home | no blank screen |
| Add / remove / ±quantity | cart array updates correctly in `fb_cart` |
| Remove at qty 0 | line is dropped, not left at 0 |
| Cart persistence | survives a full unmount/remount |
| Cart badge | reflects summed quantity |
| Subtotal exactness | 12.90 + 11.50 renders `$24.40`, total `$27.39` — no `27.389999999999997` anywhere |
| Free-delivery threshold | `$38.70` subtotal renders `FREE` |
| `money()` formatting | never emits >2 decimals for any input tested |
| Menu / Grocery separation | each view renders exactly its own kind |
| Category + favourites filters | narrow the grid correctly |
| Empty cart / empty checkout / no-orders states | all present with on-brand copy |
| WhatsApp message builder | itemised, unit-suffixed, dot-aligned totals, no float artefacts |
| Checkout → `wa.me` | real `window.open` to `https://wa.me/…?text=…` with the encoded order |
| "Don't send to WhatsApp" toggle | suppresses `window.open` |
| Checkout validation | missing name/phone/address blocks the slider, shows "Almost there — add …" |
| QR renders | canvas per QR; `#qr-main` present for download |
| QR → store round-trip | `?store=…&name=…&wa=…` rebrands the storefront and retargets WhatsApp |
| Owner rename / number / fee / currency | all propagate live to the customer views |
| Owner add / delete product | appears in the customer menu, persists across reload |
| Order placement + tracking | 5-stage timeline renders; `stageOf()` advances 0→4 on a simulated clock |
| Orders persist | `fb_orders` written and re-read on remount |
| XSS-ish URL params | `<script>` in `?store=`/`?wa=` does not break the app or poison the `wa.me` href |
| Phone input sanitising | owner field strips non-digits |
| Colour contrast | muted-on-bg **7.62:1**, accent-on-bg **6.85:1**, green-on-card **8.87:1** — all AA |

---

## 3. Broken / defective — found and fixed in Phase 2

### B1 — Search ignored category and description (plan §14) — **fixed**
`CatalogView.matches()` only tested the product **name**.

```
BEFORE:  search "pizza"  on #/menu → 0 results   (Pepperoni Supreme is category `pizza`)
         search "sushi"  on #/menu → 0 results   (Dragon Roll is category `sushi`)
AFTER:   both return the right product
```

The Hero placeholder advertised *"Search burgers, sushi, avocados…"* and `sushi`
returned nothing.

**Fix:** new `src/lib/search.ts` — accent/case-folded, matches name + description +
category label + pack size, requires *every* query word, and returns a relevance
score (name 8 / category 5 / unit 3 / description 1) so results are best-first.
`CatalogView` and `Hero` both consume it — no duplicated matching logic.
Search now also narrows *within* an active category filter instead of ignoring it.

### B2 — Hero search always routed to the Menu — **fixed**
`doSearch()` was `go('menu')`, unconditionally. A grocery query landed on an
empty menu page. It now compares the best match score in each catalog:
`sourdough` → The Market, `sushi` → Menu.

### B3 — Search box lost focus after every keystroke — **fixed**
`<div className="wrap page" key={`${kind}-${q}`}>` re-keyed the whole page on
each character, unmounting the `<input>`. In a real browser that means you can
only type one letter at a time. Key removed; a regression test asserts
`document.activeElement` is still the input after three keystrokes.

### B4 — Scanning a QR destroyed the owner's saved settings — **fixed**
`initStore()` returned the URL-derived subset and the persistence effect then
wrote it to `fb_store`. An owner who opened their own QR (Scenario C: *"Generate
QR → Open QR → Verify correct store data"*) lost tagline, city, currency,
threshold, accent and hours. A `scanned` flag now suppresses that write.

### B5 — `slugify()` hyphenated apostrophes — **fixed**
```
BEFORE:  "Mama Rosa's Pizzeria" → "mama-rosa-s-pizzeria"
AFTER:   "Mama Rosa's Pizzeria" → "mama-rosas-pizzeria"
```
Also folds accents (`Café del Mar` → `cafe-del-mar`), clamps to 48 chars, and
falls back to `my-store` for unusable input.

### B6 — Track view "Call" dialled the customer's own number — **fixed**
The rider card used `tel:${selected.phone}` — the customer's phone. It now links
to the store's WhatsApp chat. The hard-coded rider name "Karim · ★ 4.9" was also
fictional data presented as real; replaced with honest copy.

### B7 — Two parallel write paths for products (risk R1) — **fixed**
`StoreView` wrote `localStorage` directly and fired a `fb-menu-changed` window
event, while `store.tsx` *also* owned the list. Now there is one path:
`addItem` / `updateItem` / `removeItem` / `resetMenu` on the context, persisted as
a versioned `MenuState` (`{ v: 2, custom, overrides, hidden }`) with automatic
migration from the old plain-array shape. Built-in catalog items are never
mutated in place, so owner edits are reversible and a real API can replace the
whole layer later. A test asserts no component under `src/components/` mentions
`localStorage` at all.

### B8 — Hard-coded demo values presented as live (risk R2) — **fixed**
Moved into `StoreConfig`: opening hours (was `Open till 23:00` in three places),
home-hero stats (`4.8★`, `2,300+ reviews`, `25 min`), the USDT wallet address,
plus new `address`, `open` and `heroImg` fields. Defaults are byte-identical to
the previous hard-coded values, so **nothing looks different** — but every one of
them is now owner-editable.

### B9 — URL parameters were not clamped (plan §21) — **fixed**
`cleanSlug` / `cleanName` / `cleanText` / `cleanTable` / `cleanFee` in
`store.tsx` strip `<>` and control characters and clamp lengths (slug 48,
name 60, city 40, table 12) and the fee to `0…10 000`. Previously `?fee=99999999`
would have become the store's delivery fee.

### B10 — Quantity was unbounded — **fixed**
`setQty` now clamps to `0…99` and floors non-integers.

### B11 — Dev server rejected preview hosts — **fixed**
`vite.config.ts` had no `allowedHosts`; the preview returned HTTP 403. Added
`allowedHosts: true` to `server` and `preview`.

### B12 — 910 kB of dead assets in git — **fixed**
`3lqNDnSkbfiDYfBXVnR5RCntFxiQmE26.jpeg` (538 kB) and
`Wxvc9DuNjSiaKaqRBR7fhncH3zoX3YFh.jpeg` (372 kB) were referenced nowhere.
Deleted.

### B13 — `<img>` had no intrinsic size — **fixed**
Added `width`/`height` to `Img.tsx` so the browser can reserve space. The
existing `.ft-img { position:absolute; inset:0 }` rule still governs layout, so
the visual result is unchanged.

---

## 4. Still missing — scheduled for later phases

| Plan § | Feature | Phase |
|---|---|---|
| §3, §4 | Owner **Dashboard** (overview, revenue, pending, avg order, quick actions) | 3 |
| §5 | Owner **order management** (New → Accepted → Preparing → Ready → Out → Completed, Cancel) | 3 |
| §6 | Product **edit**, **availability**, **featured** | 3 |
| §8 | Settings: address, opening hours, **store open/closed** switch | 3 |
| §9 | **Hero image** customisation, **live store preview** | 3 |
| §10 | **Table-specific QR codes** | 3 |
| §25 | Separate customer vs owner mode | 3 |
| §18 | **Loading** state, **error** state with retry | 5 |
| §23 | Open Graph image, canonical URL, Twitter card | 6 |
| §22 | Image optimisation (10 JPEGs, 202–314 kB, 2.6 MB total) | 6 |

Data model for §5, §6, §8, §9 and §10 (`OrderStatus`, `MenuState`,
`StoreConfig.address/hours/open/heroImg/usdt/stats`, `Order.table/channel`) was
added in Phase 2 so Phase 3 is wiring, not re-plumbing.

---

## 5. Verification

```
$ npx tsc --noEmit            → 0 errors
$ npx vitest run              → 74 passed / 0 failed
$ npm run build               → 233.66 kB JS (76.12 kB gzip), 46.01 kB CSS (9.55 kB gzip)
$ curl http://localhost:5173/ → 200
```

**Visual identity untouched:** same palette, typography, Home-page layout, card
shapes and spacing. No component was redesigned in this phase.
