import { CATEGORIES } from '../data'
import { useApp } from '../store'
import { cls } from '../lib/util'
import type { Kind } from '../types'
import ProductCard from './ProductCard'
import { SearchIcon } from './icons'

export default function CatalogView({ kind }: { kind: Kind }) {
  const { items, search, setSearch, catFilter, setCatFilter, store, favs } = useApp()
  const cats = CATEGORIES.filter(c => c.kind === kind)
  const q = search.trim().toLowerCase()

  const matches = (name: string) =>
    name
      .toLowerCase()
      .split(' ')
      .some(w => w.length > 2 && q.includes(w)) || q.split(' ').some(w => w.length > 2 && name.toLowerCase().includes(w))

  const base = items.filter(i => i.kind === kind)
  const other = items.filter(i => i.kind !== kind)
  const showingFavs = catFilter === 'favs'
  const filtered = q
    ? base.filter(i => matches(i.name))
    : showingFavs
      ? base.filter(i => favs.includes(i.id))
      : catFilter
        ? base.filter(i => i.category === catFilter)
        : base
  const otherFiltered = q ? other.filter(i => matches(i.name)) : []

  return (
    <div className="wrap page" key={`${kind}-${q}`}>
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
        <p className="results-note">
          {filtered.length + otherFiltered.length} result{filtered.length + otherFiltered.length === 1 ? '' : 's'} for “{search}”
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
      {q && filtered.length === 0 && otherFiltered.length === 0 && (
        <div className="empty">
          <span className="empty-icon">🔍</span>
          <h3>Nothing for “{search}”</h3>
          <p>
            Try “burger”, “sushi”, “avocado” or “bread”.
          </p>
        </div>
      )}

      {otherFiltered.length > 0 && (
        <section className="cross">
          <h3>{kind === 'menu' ? 'From the market' : 'From the menu'}</h3>
          <div className="grid grid-3">
            {otherFiltered.map(i => (
              <ProductCard key={i.id} item={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
