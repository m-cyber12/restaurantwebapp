import { useMemo, useState } from 'react'
import { CATEGORIES } from '../../data'
import { useApp } from '../../store'
import { cls, money } from '../../lib/util'
import { matchesQuery } from '../../lib/search'
import type { Item, Kind } from '../../types'
import ProductForm from './ProductForm'
import Img from '../Img'

export default function ProductsPanel({ kind }: { kind: Kind }) {
  const { catalog, store, toast, updateItem, removeItem, resetMenu, menu } = useApp()
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState<Item | null>(null)
  const [q, setQ] = useState('')

  const list = useMemo(() => {
    const base = catalog
      .filter(i => i.kind === kind)
      // The owner's own additions sit at the top of their own list, so a
      // freshly added product is never buried under the shipped catalog.
      .slice()
      .sort((a, b) => Number(!!b.custom) - Number(!!a.custom))
    return q.trim() ? base.filter(i => matchesQuery(i, q)) : base
  }, [catalog, kind, q])

  const customCount = catalog.filter(i => i.kind === kind && i.custom).length
  const overridden = Object.keys(menu.overrides).length
  const hidden = menu.hidden.length

  const toggleAvailable = (i: Item) => {
    const next = i.available === false
    updateItem(i.id, { available: next })
    toast(`“${i.name}” ${next ? 'is back on the shelf' : 'hidden from customers'}`, next ? '🟢' : '⏸️')
  }

  const drop = (i: Item) => {
    removeItem(i.id)
    toast(`“${i.name}” ${i.custom ? 'deleted' : 'removed from your storefront'}`, '🗑️')
  }

  const canReset = customCount > 0 || overridden > 0 || hidden > 0

  return (
    <div className="owner-products">
      <div className="op-toolbar">
        <button className="btn btn-primary btn-sm" onClick={() => { setEditing(null); setAdding(a => !a) }}>
          {adding ? '× Close' : '+ Add product'}
        </button>
        <div className="page-search">
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder={`Search your ${kind === 'grocery' ? 'market' : 'menu'}…`}
            aria-label={`Search ${kind === 'grocery' ? 'market' : 'menu'} products`}
          />
          {q && (
            <button className="page-search-x" onClick={() => setQ('')} aria-label="Clear search">
              ×
            </button>
          )}
        </div>
        <span className="op-count">
          {list.length} of {catalog.filter(i => i.kind === kind).length}
        </span>
      </div>

      {(adding || editing) && (
        <ProductForm
          kind={kind}
          editing={editing}
          onDone={() => { setAdding(false); setEditing(null) }}
        />
      )}

      {list.length === 0 ? (
        <div className="empty">
          <span className="empty-icon">{kind === 'grocery' ? '🛒' : '🍽️'}</span>
          <h3>{q ? 'No products match' : `No ${kind === 'grocery' ? 'market' : 'menu'} products`}</h3>
          <p>{q ? 'Try a different name or category.' : 'Add your first product to get going.'}</p>
          {q && (
            <button className="btn btn-ghost btn-sm" onClick={() => setQ('')}>
              Clear search
            </button>
          )}
        </div>
      ) : (
        <ul className="plist">
          {list.map(i => {
            const off = i.available === false
            return (
              <li key={i.id} className={cls('prow', off && 'off')}>
                <span className="prow-thumb">
                  <Img item={i} />
                </span>
                <div className="prow-main">
                  <b>
                    {i.emoji} {i.name}
                    {i.featured && <span className="tag tag-featured">Featured</span>}
                    {i.custom && <span className="tag tag-custom">Yours</span>}
                  </b>
                  <span className="prow-sub">
                    {CATEGORIES.find(c => c.id === i.category)?.label ?? i.category}
                    {i.unit ? ` · ${i.unit}` : ''}
                    {i.desc ? ` — ${i.desc}` : ''}
                  </span>
                </div>
                <span className="prow-price">{money(i.price, store.currency)}</span>
                <span className={cls('prow-status', off ? 'off' : 'on')}>
                  {off ? 'Unavailable' : 'Available'}
                </span>
                <div className="prow-actions">
                  <button
                    className="btn btn-ghost btn-xs"
                    onClick={() => { setAdding(false); setEditing(i) }}
                  >
                    Edit
                  </button>
                  <button className="btn btn-ghost btn-xs" onClick={() => toggleAvailable(i)}>
                    {off ? 'Enable' : 'Disable'}
                  </button>
                  <button
                    className="btn btn-ghost btn-xs danger"
                    onClick={() => drop(i)}
                    aria-label={`Delete ${i.name}`}
                  >
                    Delete
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {canReset && (
        <div className="op-footer">
          <span className="card-sub">
            {customCount} added · {overridden} edited · {hidden} removed
          </span>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => {
              resetMenu()
              setEditing(null)
              setAdding(false)
              toast('Catalog reset to the defaults', '♻️')
            }}
          >
            ♻️ Reset catalog
          </button>
        </div>
      )}
    </div>
  )
}
