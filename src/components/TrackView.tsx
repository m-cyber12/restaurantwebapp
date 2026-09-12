import { useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { STAGES, etaText, isCancelled, progressOf, stageOf, statusLabel } from '../lib/order'
import { useApp } from '../store'
import { cls, fmtDay, fmtTime, money } from '../lib/util'
import { buildOrderMessage, statusLink, waLink } from '../lib/whatsapp'
import Img from './Img'
import { Arrow, ClockIcon, PinIcon, ScooterIcon, WAIcon } from './icons'

/**
 * Order tracking. The timeline is the hero of the page: a line that fills,
 * five nodes that light up, and a rider that actually travels along it.
 * Horizontal on desktop, a vertical story on mobile (pure CSS).
 */
export default function TrackView() {
  const { orders, focusId, byId, store, go, tick, addToCart, setCartOpen, toast } = useApp()
  const now = Date.now()
  const [selId, setSelId] = useState<string | null>(null)

  const selected = useMemo(() => {
    const id = selId ?? focusId ?? orders[0]?.id
    return orders.find(o => o.id === id) ?? orders[0]
  }, [selId, focusId, orders]) // eslint-disable-line react-hooks/exhaustive-deps

  void tick // re-renders on the demo clock

  if (orders.length === 0) {
    return (
      <div className="wrap page">
        <div className="empty">
          <span className="empty-icon">
            <ScooterIcon size={26} />
          </span>
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
  const cancelled = isCancelled(selected)
  const headline = cancelled ? 'Cancelled' : delivered ? 'Delivered' : statusLabel(selected)

  const orderAgain = () => {
    selected.lines.forEach(l => addToCart(l.id, l.qty))
    toast('Items back in your cart 🛒', '♻️')
    setCartOpen(true)
  }

  return (
    <div className="wrap page track">
      <header className="page-head">
        <div className="page-head-copy">
          <span className="kicker">
            <span className={cls('dot-live', delivered && 'off')} aria-hidden />
            Live status
          </span>
          <h2>Track your order</h2>
          <p>From our kitchen to your door — updated as it happens.</p>
        </div>
      </header>

      <div className="track-grid">
        <section className="card track-detail">
          <div className="track-head">
            <div className="track-id-block">
              <span className="track-id">#{selected.id}</span>
              <h3>
                {fmtDay(selected.ts)} · {fmtTime(selected.ts)}
              </h3>
              <span className="track-channel">
                {selected.channel === 'table' && selected.table ? (
                  <>🪑 Table {selected.table} · dine-in</>
                ) : (
                  <>
                    <PinIcon size={12} /> {selected.address}
                  </>
                )}
              </span>
            </div>
            <span className={cls('status-pill', delivered && 'done', cancelled && 'cancelled')}>
              {headline}
            </span>
          </div>

          <div className="track-eta">
            <span className="track-eta-text">{etaText(selected, now)}</span>
            <span className="track-progress-num">
              <b>{Math.round(progress * 100)}%</b> of the way there
            </span>
          </div>

          {/* Timeline */}
          <div
            className={cls('timeline', cancelled && 'cancelled')}
            style={{ '--p': progress } as CSSProperties}
            role="img"
            aria-label={`Order status: ${headline}`}
          >
            <div className="timeline-line">
              <i />
            </div>
            <div className="timeline-scooter" aria-hidden>
              {delivered ? '🏠' : '🛵'}
            </div>
            <ol className="timeline-nodes">
              {STAGES.map((s, i) => (
                <li
                  key={s.key}
                  className={cls('tnode', i < stage && 'done', i === stage && 'now', i > stage && 'todo')}
                >
                  <span className="tnode-icon">{i <= stage ? s.icon : '•'}</span>
                  <span className="tnode-label">{s.label}</span>
                </li>
              ))}
            </ol>
          </div>

          {!cancelled && !delivered && stage >= 3 && (
            <div className="driver-card">
              <span className="driver-avatar" aria-hidden>
                🧑🏽‍✈️
              </span>
              <div className="driver-copy">
                <b>Your rider is on the way</b>
                <span>
                  Order #{selected.id} · {etaText(selected, now)}
                </span>
              </div>
              <a
                className="btn btn-ghost btn-sm"
                href={statusLink(store, selected)}
                target="_blank"
                rel="noreferrer"
              >
                <WAIcon size={15} /> Contact
              </a>
            </div>
          )}

          <div className="track-items">
            <ul className="track-lines">
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
                      <span>
                        × {l.qty}
                        {it.unit ? ` · ${it.unit}` : ''}
                      </span>
                    </div>
                    <b className="ti-total">{money(it.price * l.qty, store.currency)}</b>
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
                <ClockIcon size={13} /> {selected.when}
              </p>
            </div>
          </div>

          <div className="track-actions">
            <span className="track-status-note" aria-live="polite">
              Status: {cancelled ? 'Cancelled' : statusLabel(selected)}
            </span>
            <span className="track-actions-btns">
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
                Re-send order
              </button>
              <button className="btn btn-ghost" onClick={orderAgain}>
                Order again
              </button>
            </span>
          </div>
        </section>

        <aside className="track-list">
          <h3>Your orders</h3>
          <div className="tlist">
            {orders.map(o => {
              const s = stageOf(o, now)
              const d = s >= STAGES.length - 1
              const c = isCancelled(o)
              return (
                <button
                  key={o.id}
                  className={cls('tcard', o.id === selected.id && 'on', d && 'delivered', c && 'cancelled')}
                  onClick={() => setSelId(o.id)}
                  aria-pressed={o.id === selected.id}
                >
                  <div className="tcard-top">
                    <b>#{o.id}</b>
                    <span className={cls('tcard-status', d && 'done', c && 'cancelled')}>
                      {c ? 'Cancelled' : d ? 'Delivered' : STAGES[s].label}
                    </span>
                  </div>
                  <div className="tcard-mid">
                    <span>
                      {fmtDay(o.ts)} · {fmtTime(o.ts)} · {o.lines.reduce((a, l) => a + l.qty, 0)} items
                      {o.channel === 'table' && o.table ? ` · Table ${o.table}` : ''}
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
