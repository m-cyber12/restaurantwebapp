import { useMemo, useState } from 'react'
import { STAGES, etaText, progressOf, stageOf } from '../lib/order'
import { useApp } from '../store'
import { cls, fmtDay, fmtTime, money } from '../lib/util'
import { buildOrderMessage, statusLink, waLink } from '../lib/whatsapp'
import Img from './Img'
import { Arrow, WAIcon } from './icons'

export default function TrackView() {
  const { orders, focusId, setFocusId, byId, store, go, tick, addToCart, setCartOpen, toast } = useApp()
  const now = Date.now()
  const [selId, setSelId] = useState<string | null>(null)

  const selected = useMemo(() => {
    const id = selId ?? focusId ?? orders[0]?.id
    return orders.find(o => o.id === id) ?? orders[0]
  }, [selId, focusId, orders]) // eslint-disable-line react-hooks/exhaustive-deps

  void tick

  if (orders.length === 0) {
    return (
      <div className="wrap page">
        <div className="empty">
          <span className="empty-icon">🛵</span>
          <h3>No orders yet</h3>
          <p>Place your first order and watch it come to life here — live, step by step.</p>
          <button className="btn btn-primary" onClick={() => go('menu')}>
            Order something tasty <Arrow size={15} />
          </button>
        </div>
      </div>
    )
  }

  if (!selected) return null
  const stage = stageOf(selected, now)
  const progress = progressOf(selected, now)
  const delivered = stage >= STAGES.length - 1

  const orderAgain = () => {
    selected.lines.forEach(l => addToCart(l.id, l.qty))
    toast('Items back in your cart 🛒', '♻️')
    setCartOpen(true)
  }

  return (
    <div className="wrap page track">
      <header className="page-head">
        <div>
          <h2>Track your order</h2>
          <p>Live status, from our kitchen to your door.</p>
        </div>
      </header>

      <div className="track-grid">
        <section className="card track-detail">
          <div className="track-head">
            <div>
              <span className="track-id">#{selected.id}</span>
              <h3>{fmtDay(selected.ts)} · {fmtTime(selected.ts)}</h3>
            </div>
            <span className={cls('status-pill', delivered && 'done')}>
              {delivered ? '🎉 Delivered' : STAGES[stage].label}
            </span>
          </div>

          <div className="track-eta">
            {etaText(selected, now)}
            <div className="track-progress-num">
              {Math.round(progress * 100)}% of the way there
            </div>
          </div>

          {/* Timeline */}
          <div className="timeline" role="img" aria-label={`Order status: ${STAGES[stage].label}`}>
            <div className="timeline-line">
              <i style={{ width: `${progress * 100}%` }} />
            </div>
            <div
              className="timeline-scooter"
              style={{ left: `${progress * 100}%` }}
              aria-hidden
            >
              {delivered ? '🏠' : '🛵'}
            </div>
            <ol className="timeline-nodes">
              {STAGES.map((s, i) => (
                <li
                  key={s.key}
                  className={cls(
                    'tnode',
                    i < stage && 'done',
                    i === stage && 'now',
                    i > stage && 'todo'
                  )}
                >
                  <span className="tnode-icon">{i <= stage ? s.icon : '•'}</span>
                  <span className="tnode-label">{s.label}</span>
                </li>
              ))}
            </ol>
          </div>

          {!delivered && stage >= 3 && (
            <div className="driver-card">
              <span className="driver-avatar">🧑🏽‍✈️</span>
              <div>
                <b>Karim is on the way</b>
                <span>🛵 Scooter · ★ 4.9 · Plate #{selected.id.slice(-4)}</span>
              </div>
              <a
                className="btn btn-ghost btn-sm"
                href={`tel:${selected.phone.replace(/[^\d+]/g, '')}`}
              >
                Call
              </a>
            </div>
          )}

          <div className="track-items">
            <ul>
              {selected.lines.map(l => {
                const it = byId(l.id)
                if (!it) return null
                return (
                  <li key={l.id}>
                    <div className="ti-thumb">
                      <Img item={it} />
                    </div>
                    <div className="ti-info">
                      <b>{it.name}</b>
                      <span>× {l.qty}</span>
                    </div>
                  </li>
                )
              })}
            </ul>
            <div className="track-totals">
              <div className="drow">
                <span>Subtotal</span>
                <span>{money(selected.subtotal, store.currency)}</span>
              </div>
              <div className="drow">
                <span>Delivery</span>
                <span>{selected.deliveryFee === 0 ? 'FREE' : money(selected.deliveryFee, store.currency)}</span>
              </div>
              <div className="drow drow-total">
                <span>Total · {selected.payment}</span>
                <span>{money(selected.total, store.currency)}</span>
              </div>
              <p className="track-addr">
                📍 {selected.address} · 🕒 {selected.when}
              </p>
            </div>
          </div>

          <div className="track-actions">
            <a
              className="btn btn-wa"
              href={statusLink(store, selected)}
              target="_blank"
              rel="noreferrer"
            >
              <WAIcon size={16} /> Chat with {store.name}
            </a>
            <button
              className="btn btn-ghost"
              onClick={() =>
                window.open(
                  waLink(store.whatsapp, buildOrderMessage(store, selected, byId)),
                  '_blank',
                  'noopener'
                )
              }
            >
              📤 Re-send order
            </button>
            <button className="btn btn-ghost" onClick={orderAgain}>
              ♻️ Order again
            </button>
          </div>
        </section>

        <aside className="track-list">
          <h3>Your orders</h3>
          <div className="tlist">
            {orders.map(o => {
              const s = stageOf(o, now)
              const d = s >= STAGES.length - 1
              return (
                <button
                  key={o.id}
                  className={cls('tcard', o.id === selected.id && 'on', d && 'delivered')}
                  onClick={() => setSelId(o.id)}
                >
                  <div className="tcard-top">
                    <b>#{o.id}</b>
                    <span className={cls('tcard-status', d && 'done')}>
                      {d ? 'Delivered 🎉' : STAGES[s].label}
                    </span>
                  </div>
                  <div className="tcard-mid">
                    <span>
                      {fmtDay(o.ts)} · {fmtTime(o.ts)} · {o.lines.reduce((a, l) => a + l.qty, 0)} items
                    </span>
                    <b>{money(o.total, store.currency)}</b>
                  </div>
                  <div className="tcard-bar">
                    <i style={{ width: `${progressOf(o, now) * 100}%` }} className={d ? 'full' : ''} />
                  </div>
                </button>
              )
            })}
          </div>
          <button className="btn btn-primary" onClick={() => go('menu')}>
            New order <Arrow size={15} />
          </button>
        </aside>
      </div>
    </div>
  )
}
