import { useEffect, useState } from 'react'
import { CATEGORIES } from '../../data'
import { useApp } from '../../store'
import { cls } from '../../lib/util'
import type { Item, Kind } from '../../types'

export interface Draft {
  name: string
  desc: string
  price: string
  category: string
  emoji: string
  img: string
  unit: string
  available: boolean
  featured: boolean
}

const BLANK: Draft = {
  name: '',
  desc: '',
  price: '',
  category: 'burgers',
  emoji: '🍽️',
  img: '',
  unit: '',
  available: true,
  featured: false,
}

export function draftFrom(item: Item): Draft {
  return {
    name: item.name,
    desc: item.desc,
    price: String(item.price),
    category: item.category,
    emoji: item.emoji,
    img: item.img ?? '',
    unit: item.unit ?? '',
    available: item.available !== false,
    featured: !!item.featured,
  }
}

interface Props {
  kind: Kind
  /** Editing an existing product, or null for a new one. */
  editing: Item | null
  onDone: () => void
}

/** The single add/edit form for both the menu and the market (plan §6, §7). */
export default function ProductForm({ kind, editing, onDone }: Props) {
  const { store, toast, addItem, updateItem } = useApp()
  const cats = CATEGORIES.filter(c => c.kind === kind)
  const [d, setD] = useState<Draft>(() =>
    editing ? draftFrom(editing) : { ...BLANK, category: cats[0].id, unit: kind === 'grocery' ? 'per item' : '' }
  )
  const [err, setErr] = useState<string | null>(null)

  // Re-seed when the user opens a different product to edit.
  useEffect(() => {
    setD(editing ? draftFrom(editing) : { ...BLANK, category: cats[0].id, unit: kind === 'grocery' ? 'per item' : '' })
    setErr(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing?.id, kind])

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD(x => ({ ...x, [k]: v }))

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const name = d.name.trim().slice(0, 60)
    const price = parseFloat(d.price)
    if (name.length < 2) return setErr('Give the product a name of at least 2 characters.')
    if (!Number.isFinite(price) || price <= 0) return setErr('Enter a price greater than zero.')
    if (price > 100_000) return setErr('That price looks too high — check the number.')

    const payload = {
      kind,
      name,
      desc: d.desc.trim().slice(0, 240),
      price: Math.round(price * 100) / 100,
      category: d.category,
      emoji: d.emoji.trim() || (kind === 'grocery' ? '🛒' : '🍽️'),
      img: d.img.trim() || undefined,
      unit: d.unit.trim() || undefined,
      available: d.available,
      featured: d.featured,
      g1: '#3fae6a',
      g2: '#101418',
      rating: editing?.rating ?? 4.8,
      reviews: editing?.reviews ?? 0,
      popular: editing?.popular,
    }

    if (editing) {
      updateItem(editing.id, payload)
      toast(`“${name}” updated`, '✅')
    } else {
      addItem(payload)
      toast(`“${name}” added to your ${kind === 'grocery' ? 'market' : 'menu'}`, '✅')
    }
    setErr(null)
    onDone()
  }

  return (
    <form className="card pform" onSubmit={submit} aria-label={editing ? `Edit ${editing.name}` : 'Add a product'}>
      <h3 className="card-h">{editing ? `Edit product` : 'Add a product'}</h3>

      <div className="frow">
        <label className="flabel">
          <span>Product name</span>
          <input
            value={d.name}
            onChange={e => set('name', e.target.value)}
            placeholder="Truffle Fries"
            maxLength={60}
            required
          />
        </label>
        <label className="flabel">
          <span>
            Price ({store.currency})
          </span>
          <input
            value={d.price}
            onChange={e => set('price', e.target.value)}
            placeholder="7.50"
            type="number"
            min="0.01"
            /* `step="any"` — a fixed step grid would silently reject ordinary
               prices like 14.00 and block the whole form from submitting. */
            step="any"
            inputMode="decimal"
            required
          />
        </label>
      </div>

      <label className="flabel">
        <span>Description</span>
        <textarea
          value={d.desc}
          onChange={e => set('desc', e.target.value)}
          placeholder="Hand-cut, truffle oil, parmesan."
          maxLength={240}
          rows={2}
        />
      </label>

      <div className="frow">
        <label className="flabel">
          <span>Category</span>
          <select value={d.category} onChange={e => set('category', e.target.value)}>
            {cats.map(c => (
              <option key={c.id} value={c.id}>
                {c.emoji} {c.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flabel">
          <span>Icon / emoji</span>
          <input
            value={d.emoji}
            onChange={e => set('emoji', e.target.value)}
            maxLength={4}
            placeholder="🍟"
            aria-label="Icon emoji"
          />
        </label>
      </div>

      <div className="frow">
        <label className="flabel">
          <span>Image URL (optional)</span>
          <input
            value={d.img}
            onChange={e => set('img', e.target.value)}
            placeholder="https://…/fries.jpg"
            inputMode="url"
          />
        </label>
        <label className="flabel">
          <span>Pack size (optional)</span>
          <input
            value={d.unit}
            onChange={e => set('unit', e.target.value)}
            placeholder={kind === 'grocery' ? '500 g' : 'serves 2'}
            maxLength={24}
          />
        </label>
      </div>

      <div className="toggle-row">
        <label className="switch-row">
          <span>
            <b>Available</b>
            <small>Customers can see and order it</small>
          </span>
          <span
            className={cls('switch', d.available && 'on')}
            role="switch"
            aria-label="Available to customers"
            aria-checked={d.available}
            tabIndex={0}
            onClick={() => set('available', !d.available)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                set('available', !d.available)
              }
            }}
          >
            <i />
          </span>
        </label>
        <label className="switch-row">
          <span>
            <b>Featured</b>
            <small>Show in "Popular picks" on the home page</small>
          </span>
          <span
            className={cls('switch', d.featured && 'on')}
            role="switch"
            aria-label="Featured in Popular picks"
            aria-checked={d.featured}
            tabIndex={0}
            onClick={() => set('featured', !d.featured)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                set('featured', !d.featured)
              }
            }}
          >
            <i />
          </span>
        </label>
      </div>

      {err && (
        <p className="form-error" role="alert">
          {err}
        </p>
      )}

      <div className="btn-row">
        <button className="btn btn-primary btn-sm" type="submit">
          {editing ? 'Save changes' : '+ Add product'}
        </button>
        <button className="btn btn-ghost btn-sm" type="button" onClick={onDone}>
          Cancel
        </button>
      </div>
    </form>
  )
}
