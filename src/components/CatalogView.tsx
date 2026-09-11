import { CATEGORIES } from '../data'
import { useApp } from '../store'
import { cls } from '../lib/util'
import { searchCatalog } from '../lib/search'
import type { Kind } from '../types'
import ProductCard from './ProductCard'
import { SearchIcon } from './icons'

export default function CatalogView({ kind }: { kind: Kind }) {
  const { items, search, setSearch, catFilter, setCatFilter, favs } = useApp()
  const cats = CATEGORIES.filter(c => c.kind === kind)
  const q = search.trim()
  const showingFavs = catFilter === 'favs'

  const base = items.filter(i => i.kind === kind)
  const other = items.filter(i => i.kind !== kind)

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

  return (
    <div className="wrap page">
      <header className="page-head">
        <div>
          <h2>{kind === 'menu' ? 'Tonight’s Menu' : 'The Market'}</h2>
          <p>
            {kind === 'menu'
              ? 'Smashed, grilled & rolled to order — delivered hot.'
              : 'Produce, bakery, butcher & pantry — picked fresh daily.'}
          </p>
        </div>
        <div className="page-search">
          <SearchIcon size={16} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={kind === 'menu' ? 'Search the menu…' : 'Search the market…'}
            aria-label="Search"
          />
          {search && (
            <button className="page-search-x" onClick={() => setSearch('')} aria-label="Clear search">
              ×
            </button>
          )}
        </div>
      </header>

      <div className="pills" role="tablist">
        <button className={cls('pill', !catFilter && 'on')} onClick={() => setCatFilter(null)}>
          All
        </button>
        {cats.map(c => (
          <button
            key={c.id}
            className={cls('pill', catFilter === c.id && 'on')}
            onClick={() => setCatFilter(catFilter === c.id ? null : c.id)}
          >
            {c.emoji} {c.label}
          </button>
        ))}
        <button
          className={cls('pill pill-fav', catFilter === 'favs' && 'on')}
          onClick={() => setCatFilter(catFilter === 'favs' ? null : 'favs')}
        >
          ♥ Saved
        </button>
      </div>

      {q && (
        <p className="results-note" role="status">
          {filtered.length + crossHits.length} result{filtered.length + crossHits.length === 1 ? '' : 's'} for “{search}”
        </p>
      )}

      {filtered.length > 0 && (
        <div className="grid grid-3">
          {filtered.map(i => (
            <ProductCard key={i.id} item={i} />
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
        </div>
      )}
      {q && filtered.length === 0 && crossHits.length === 0 && (
        <div className="empty">
          <span className="empty-icon">🔍</span>
          <h3>No products found</h3>
          <p>
            Nothing matches “{search}”. Try “burger”, “sushi”, “avocado” or “bread”.
          </p>
          <button className="btn btn-ghost btn-sm" onClick={() => setSearch('')}>
            Clear search
          </button>
        </div>
      )}

      {crossHits.length > 0 && (
        <section className="cross">
          <h3>{kind === 'menu' ? 'From the market' : 'From the menu'}</h3>
          <div className="grid grid-3">
            {crossHits.map(i => (
              <ProductCard key={i.id} item={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
