import { useState } from 'react'
import { ACCENTS, CATEGORIES, CURRENCIES, EMOJIS } from '../data'
import { useApp } from '../store'
import { cls, copyText, money } from '../lib/util'
import QR from './QR'
import Img from './Img'
import type { Item, Kind } from '../types'
import { Arrow } from './icons'

export default function StoreView() {
  const { store, setStore, link, items, toast, go } = useApp()
  const [add, setAdd] = useState({
    name: '',
    price: '',
    kind: 'menu' as Kind,
    category: 'burgers',
    emoji: '🍽️',
    img: '',
  })

  const catsFor = (k: Kind) => CATEGORIES.filter(c => c.kind === k)

  const changeKind = (k: Kind) =>
    setAdd(a => ({ ...a, kind: k, category: catsFor(k)[0].id }))

  const submitItem = (e: React.FormEvent) => {
    e.preventDefault()
    const price = parseFloat(add.price)
    if (!add.name.trim() || !Number.isFinite(price) || price <= 0) {
      toast('Add a name and a price first', '✍️')
      return
    }
    const item: Item = {
      id: `c${Date.now()}`,
      kind: add.kind,
      name: add.name.trim(),
      desc: 'Added by the owner for this store.',
      price,
      category: add.category,
      emoji: add.emoji.trim() || '🍽️',
      img: add.img.trim() || undefined,
      g1: '#3fae6a',
      g2: '#101418',
      unit: add.kind === 'grocery' ? 'per item' : undefined,
      rating: 4.8,
      reviews: 0,
      custom: true,
    }
    const stored = JSON.parse(localStorage.getItem(`fb_menu_${store.slug}`) || '[]') as Item[]
    localStorage.setItem(`fb_menu_${store.slug}`, JSON.stringify([item, ...stored]))
    window.dispatchEvent(new CustomEvent('fb-menu-changed'))
    toast(`“${item.name}” added to your menu`, '✅')
    setAdd(a => ({ ...a, name: '', price: '', img: '' }))
  }

  const removeItem = (id: string) => {
    const stored = JSON.parse(localStorage.getItem(`fb_menu_${store.slug}`) || '[]') as Item[]
    localStorage.setItem(
      `fb_menu_${store.slug}`,
      JSON.stringify(stored.filter(i => i.id !== id))
    )
    window.dispatchEvent(new CustomEvent('fb-menu-changed'))
    toast('Item removed', '🗑️')
  }

  const resetMenu = () => {
    localStorage.removeItem(`fb_menu_${store.slug}`)
    window.dispatchEvent(new CustomEvent('fb-menu-changed'))
    toast('Menu reset to the default catalog', '♻️')
  }

  const downloadQR = () => {
    const c = document.getElementById('qr-main') as HTMLCanvasElement | null
    if (!c) return
    const a = document.createElement('a')
    a.href = c.toDataURL('image/png')
    a.download = `${store.slug}-qr-code.png`
    a.click()
    toast('QR code downloaded', '⬇️')
  }

  const copyLink = async () => {
    const ok = await copyText(link)
    toast(ok ? 'Link copied to clipboard' : 'Could not copy — select it manually', ok ? '📋' : '⚠️')
  }

  const custom = items.filter(i => i.custom)

  return (
    <div className="wrap page store-page">
      <header className="page-head center">
        <span className="eyebrow">For restaurant &amp; shop owners</span>
        <h2>Put your menu on every table</h2>
        <p>
          Set up your store below — your QR code updates live. Customers scan it with their
          camera, build a cart, and the order lands on <b>your WhatsApp</b>.
        </p>
      </header>

      <div className="store-grid">
        <section className="card">
          <h3 className="card-h">1 · Your details</h3>
          <div className="frow">
            <label className="flabel">
              <span>Store name</span>
              <input
                value={store.name}
                onChange={e => setStore({ ...store, name: e.target.value })}
                placeholder="Fresh Bites"
              />
            </label>
            <label className="flabel">
              <span>Tagline</span>
              <input
                value={store.tagline}
                onChange={e => setStore({ ...store, tagline: e.target.value })}
                placeholder="Kitchen + market, delivered"
              />
            </label>
          </div>
          <div className="frow">
            <label className="flabel">
              <span>WhatsApp number (with country code)</span>
              <input
                value={store.whatsapp}
                onChange={e => setStore({ ...store, whatsapp: e.target.value.replace(/[^\d+]/g, '') })}
                placeholder="15551234567"
                inputMode="tel"
              />
            </label>
            <label className="flabel">
              <span>City</span>
              <input value={store.city} onChange={e => setStore({ ...store, city: e.target.value })} />
            </label>
          </div>
          <div className="frow">
            <label>
              <span>Delivery fee</span>
              <input
                type="number"
                min="0"
                step="0.5"
                value={store.fee}
                onChange={e => setStore({ ...store, fee: Math.max(0, parseFloat(e.target.value) || 0) })}
              />
            </label>
            <label>
              <span>Free delivery over</span>
              <input
                type="number"
                min="0"
                step="1"
                value={store.freeAt}
                onChange={e => setStore({ ...store, freeAt: Math.max(0, parseFloat(e.target.value) || 0) })}
              />
            </label>
            <label>
              <span>Currency</span>
              <select value={store.currency} onChange={e => setStore({ ...store, currency: e.target.value })}>
                {CURRENCIES.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="pick-row">
            <span className="pick-label">Logo</span>
            <div className="chip-btns">
              {EMOJIS.map(e => (
                <button
                  key={e}
                  className={cls('emoji-pick', store.emoji === e && 'on')}
                  onClick={() => setStore({ ...store, emoji: e })}
                  aria-label={`Use ${e}`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
          <div className="pick-row">
            <span className="pick-label">Accent</span>
            <div className="chip-btns">
              {ACCENTS.map(a => (
                <button
                  key={a.c}
                  className={cls('swatch', store.accent === a.c && 'on')}
                  style={{ background: a.c }}
                  onClick={() => setStore({ ...store, accent: a.c })}
                  title={a.name}
                  aria-label={`Accent ${a.name}`}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="card">
          <h3 className="card-h">2 · Your QR code</h3>
          <div className="qr-frame">
            <QR value={link} size={216} canvasId="qr-main" />
          </div>
          <p className="qr-link" title={link}>{link}</p>
          <div className="btn-row">
            <button className="btn btn-primary btn-sm" onClick={downloadQR}>⬇ Download PNG</button>
            <button className="btn btn-ghost btn-sm" onClick={copyLink}>📋 Copy link</button>
            <button className="btn btn-wa btn-sm" onClick={() => window.print()}>🖨 Print table tents</button>
          </div>
          <div className="qr-sizes">
            {[
              { s: 56, label: 'table tent' },
              { s: 84, label: 'shelf tag' },
              { s: 112, label: 'A-frame' },
            ].map(({ s, label }) => (
              <div key={label} className="qr-size">
                <div className="qr-size-frame">
                  <QR value={link} size={s} />
                </div>
                <span>{label}</span>
              </div>
            ))}
          </div>
          <p className="qr-note">
            Print it, stick it on every table &amp; shelf. It opens <b>your</b> branded
            storefront — the order goes to <b>{store.whatsapp}</b> on WhatsApp.
          </p>
        </section>
      </div>

      {/* printable table tents */}
      <section className="tents" id="tents" aria-label="Printable table tents">
        <h3 className="no-print">Printable table tents</h3>
        {[0, 1, 2].map(i => (
          <div key={i} className="tent">
            <div className="tent-qr">
              <QR value={link} size={120} dark="#111418" light="#ffffff" />
            </div>
            <b className="tent-name">{store.emoji} {store.name}</b>
            <span className="tent-slogan">{store.tagline}</span>
            <span className="tent-cta">Scan · Order · Eat</span>
            <span className="tent-foot">QR ordering via WhatsApp</span>
          </div>
        ))}
      </section>

      <section className="card">
        <div className="card-h-row">
          <h3 className="card-h">3 · Manage your menu</h3>
          {custom.length > 0 && (
            <button className="btn btn-ghost btn-sm" onClick={resetMenu}>
              ♻️ Reset to default menu
            </button>
          )}
        </div>
        <p className="card-sub">
          Items you add appear in your scanned storefront instantly.
        </p>

        <form className="add-item" onSubmit={submitItem}>
          <input
            required
            value={add.name}
            onChange={e => setAdd(a => ({ ...a, name: e.target.value }))}
            placeholder="Item name — e.g. Truffle Fries"
          />
          <input
            required
            type="number"
            min="0.5"
            step="0.1"
            value={add.price}
            onChange={e => setAdd(a => ({ ...a, price: e.target.value }))}
            placeholder={`Price (${store.currency})`}
          />
          <select value={add.kind} onChange={e => changeKind(e.target.value as Kind)}>
            <option value="menu">🍽️ Restaurant</option>
            <option value="grocery">🛒 Grocery</option>
          </select>
          <select
            value={add.category}
            onChange={e => setAdd(a => ({ ...a, category: e.target.value }))}
          >
            {catsFor(add.kind).map(c => (
              <option key={c.id} value={c.id}>
                {c.emoji} {c.label}
              </option>
            ))}
          </select>
          <input
            value={add.emoji}
            onChange={e => setAdd(a => ({ ...a, emoji: e.target.value }))}
            placeholder="🍽️"
            maxLength={4}
            aria-label="Emoji"
          />
          <input
            value={add.img}
            onChange={e => setAdd(a => ({ ...a, img: e.target.value }))}
            placeholder="Image URL (optional)"
          />
          <button className="btn btn-primary btn-sm" type="submit">
            + Add item
          </button>
        </form>

        <ul className="menu-list">
          {items.map(i => (
            <li key={i.id}>
              <span className="ml-thumb">
                <Img item={i} />
              </span>
              <span className="ml-name">{i.name}</span>
              <span className="ml-cat">
                {CATEGORIES.find(c => c.id === i.category)?.label ?? i.category}
                <em>{i.kind === 'menu' ? '🍽️ menu' : '🛒 market'}</em>
              </span>
              <span className="ml-price">{money(i.price, store.currency)}</span>
              {i.custom ? (
                <button className="ml-del" onClick={() => removeItem(i.id)} aria-label={`Delete ${i.name}`}>
                  🗑
                </button>
              ) : (
                <span className="ml-del" />
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="how-strip">
        <div>
          <b>① Print &amp; place</b>
          <p>Tables, shelves, window, receipt.</p>
        </div>
        <span className="how-arrow" aria-hidden>→</span>
        <div>
          <b>② Customer scans</b>
          <p>Your menu, in their camera — no app.</p>
        </div>
        <span className="how-arrow" aria-hidden>→</span>
        <div>
          <b>③ Order on your WhatsApp</b>
          <p>Itemized, addressed, ready to confirm.</p>
        </div>
        <button className="btn btn-wa btn-sm" onClick={() => go('home')}>
          See your storefront <Arrow size={14} />
        </button>
      </section>
    </div>
  )
}
