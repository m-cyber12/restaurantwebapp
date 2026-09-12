import { useMemo } from 'react'
import { CATEGORIES } from '../data'
import { useApp } from '../store'
import { cls, money } from '../lib/util'
import { searchCatalog } from '../lib/search'
import type { Item, Kind } from '../types'
import ProductCard from './ProductCard'
import Reveal from './Reveal'
import Img from './Img'
import { Arrow, HeartIcon, PlusIcon, SearchIcon, StarIcon } from './icons'

/**
 * The catalog: an editorial spotlight on what the store is pushing, a sticky
 * filter rail, then the grid. Search narrows inside the active filter rather
 * than replacing it, and results from the other catalog surface below so a
 * menu search for "chocolate" still finds the market's 85% bar.
 */
export default function CatalogView({ kind }: { kind: Kind }) {
  const { items, search, setSearch, catFilter, setCatFilter, favs, addToCart, openItem, store } =
    useApp()
  const cats = CATEGORIES.filter(c => c.kind === kind)
  const q = search.trim()
  const showingFavs = catFilter === 'favs'

  const base = items.filter(i => i.kind === kind)

  // Search covers name, description, category and pack size, and it narrows
  // *within* the active category/favourites filter rather than replacing it.
  const scoped = showingFavs
    ? base.filter(i => favs.includes(i.id))
    : catFilter
      ? base.filter(i => i.category === catFilter)
      : base

  const { primary: searchHits, other: otherFiltered } = searchCatalog(items, kind, q)
  const filtered = q ? scoped.filter(i => searchHits.includes(i)) : scoped
  const crossHits = q && !catFilter && !showingFavs ? otherFiltered : []

  /** The spotlight only earns its space on an unfiltered catalog. */
  const spotlight = useMemo(() => {
    if (q || catFilter) return []
    const pushed = base.filter(i => i.featured || i.popular)
    return (pushed.length >= 2 ? pushed : base).slice(0, 3)
  }, [base, q, catFilter]) // eslint-disable-line react-hooks/exhaustive-deps

  const hero = spotlight[0]
  const side = spotlight.slice(1)
  const activeCat = cats.find(c => c.id === catFilter)

  return (
    <div className="wrap page catalog">
      <header className="page-head">
        <div className="page-head-copy">
          <span className="kicker">
            {kind === 'menu' ? 'Kitchen · cooked to order' : 'Market · picked this morning'}
          </span>
          <h2>{kind === 'menu' ? 'Tonight’s Menu' : 'The Market'}</h2>
          <p>
            {kind === 'menu'
              ? 'Smashed, grilled, rolled and plated to order — delivered hot, or walked over to your table.'
              : 'Produce, bakery, butcher and pantry. Add it to the same cart as dinner.'}
          </p>
        </div>

        <div className="page-search">
          <SearchIcon size={16} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={kind === 'menu' ? 'Search the menu…' : 'Search the market…'}
            aria-label="Search"
            autoComplete="off"
          />
          {search && (
            <button className="page-search-x" onClick={() => setSearch('')} aria-label="Clear search">
              ×
            </button>
          )}
        </div>
      </header>

      {/* ── spotlight ─────────────────────────────────────────── */}
      {hero && (
        <Reveal className="spotlight" variant="clip">
          <article className="spot spot-hero">
            <button
              className="spot-media"
              onClick={() => openItem(hero.id)}
              aria-label={`Open ${hero.name}`}
            >
              <Img item={hero} eager />
              <span className="spot-shade" aria-hidden />
            </button>
            <div className="spot-body">
              <span className="kicker kicker-accent">
                <StarIcon size={12} /> {hero.rating} · {hero.reviews} reviews
              </span>
              <h3>{hero.name}</h3>
              <p>{hero.desc}</p>
              <div className="spot-foot">
                <span className="spot-price">{money(hero.price, store.currency)}</span>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => addToCart(hero.id)}
                  aria-label={`Add ${hero.name} to cart`}
                >
                  <PlusIcon size={14} /> Add to cart
                </button>
              </div>
            </div>
          </article>

          <div className="spot-side">
            {side.map(i => (
              <SpotRow key={i.id} item={i} />
            ))}
          </div>
        </Reveal>
      )}

      {/* ── filter rail ───────────────────────────────────────── */}
      <div className="pillbar">
        <div className="pills" role="tablist" aria-label="Filter products">
          <button
            className={cls('pill', !catFilter && 'on')}
            onClick={() => setCatFilter(null)}
            aria-selected={!catFilter}
          >
            All
            <span className="pill-n">{base.length}</span>
          </button>
          {cats.map(c => {
            const on = catFilter === c.id
            return (
              <button
                key={c.id}
                className={cls('pill', on && 'on')}
                onClick={() => setCatFilter(on ? null : c.id)}
                aria-selected={on}
              >
                <span aria-hidden>{c.emoji}</span>
                {c.label}
              </button>
            )
          })}
          <button
            className={cls('pill pill-fav', showingFavs && 'on')}
            onClick={() => setCatFilter(showingFavs ? null : 'favs')}
            aria-selected={showingFavs}
          >
            <HeartIcon size={14} filled={showingFavs} /> Saved
            <span className="pill-n">{favs.length}</span>
          </button>
        </div>
      </div>

      {q && (
        <p className="results-note" role="status">
          <b>
            {filtered.length + crossHits.length} result
            {filtered.length + crossHits.length === 1 ? '' : 's'}
          </b>{' '}
          for “{search}”
          <button className="link results-clear" onClick={() => setSearch('')}>
            Clear
          </button>
        </p>
      )}

      {!q && activeCat && (
        <p className="results-note" role="status">
          <b>{activeCat.label}</b> · {filtered.length} item{filtered.length === 1 ? '' : 's'}
        </p>
      )}

      {filtered.length > 0 && (
        <div className="grid grid-3">
          {filtered.map((i, idx) => (
            <Reveal key={i.id} delay={Math.min(idx, 8) * 55}>
              <ProductCard item={i} />
            </Reveal>
          ))}
        </div>
      )}

      {!q && filtered.length === 0 && (
        <div className="empty">
          <span className="empty-icon">{showingFavs ? '♥' : '🍽️'}</span>
          <h3>{showingFavs ? 'Nothing saved yet' : 'Nothing here yet'}</h3>
          <p>
            {showingFavs
              ? 'Tap the heart on anything you love and it will wait for you here.'
              : 'This shelf is empty right now — check back soon.'}
          </p>
          {showingFavs && (
            <button className="btn btn-ghost btn-sm" onClick={() => setCatFilter(null)}>
              Back to everything <Arrow size={14} />
            </button>
          )}
        </div>
      )}

      {q && filtered.length === 0 && crossHits.length === 0 && (
        <div className="empty">
          <span className="empty-icon">🔍</span>
          <h3>No products found</h3>
          <p>Nothing matches “{search}”. Try “burger”, “sushi”, “avocado” or “bread”.</p>
          <button className="btn btn-ghost btn-sm" onClick={() => setSearch('')}>
            Clear search
          </button>
        </div>
      )}

      {crossHits.length > 0 && (
        <section className="cross" aria-label={kind === 'menu' ? 'From the market' : 'From the menu'}>
          <h3>
            {kind === 'menu' ? 'Also in the market' : 'Also on the menu'}
            <span className="cross-note">same cart, same delivery</span>
          </h3>
          <div className="grid grid-3">
            {crossHits.map((i, idx) => (
              <Reveal key={i.id} delay={Math.min(idx, 6) * 55}>
                <ProductCard item={i} />
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

/** Compact spotlight row — the two runners-up beside the hero pick. */
function SpotRow({ item }: { item: Item }) {
  const { addToCart, openItem, store } = useApp()
  return (
    <article className="spot spot-row">
      <button
        className="spot-row-media"
        onClick={() => openItem(item.id)}
        aria-label={`Open ${item.name}`}
      >
        <Img item={item} />
      </button>
      <div className="spot-row-body">
        <h4>
          <button className="spot-row-title" onClick={() => openItem(item.id)}>
            {item.name}
          </button>
        </h4>
        <span className="spot-row-meta">
          <StarIcon size={11} /> {item.rating}
          {item.unit ? ` · ${item.unit}` : ''}
        </span>
      </div>
      <div className="spot-row-end">
        <span className="spot-price">{money(item.price, store.currency)}</span>
        <button
          className="quick-add quick-add-sm"
          onClick={() => addToCart(item.id)}
          aria-label={`Add ${item.name} to cart`}
        >
          <PlusIcon size={15} />
        </button>
      </div>
    </article>
  )
}
