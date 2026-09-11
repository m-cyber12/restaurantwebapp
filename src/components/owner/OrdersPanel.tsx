import { useState } from 'react'
import { useApp } from '../../store'
import { cls, fmtDay, fmtTime, money } from '../../lib/util'
import { STAGES, isCancelled, stageOf } from '../../lib/order'
import { isPending } from '../../lib/analytics'
import type { Order, OrderStatus } from '../../types'
import { WAIcon } from '../icons'
import { waLink } from '../../lib/whatsapp'

const NEXT: Partial<Record<OrderStatus, { status: OrderStatus; label: string; icon: string }>> = {
  new: { status: 'accepted', label: 'Accept', icon: '✅' },
  accepted: { status: 'preparing', label: 'Start preparing', icon: '👨‍🍳' },
  preparing: { status: 'ready', label: 'Mark ready', icon: '🔔' },
  ready: { status: 'out', label: 'Send out for delivery', icon: '🛵' },
  out: { status: 'completed', label: 'Mark completed', icon: '🏁' },
}

const BADGE: Record<string, string> = {
  new: 'New',
  accepted: 'Accepted',
  preparing: 'Preparing',
  ready: 'Ready',
  out: 'Out for delivery',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

/** The status the customer sees: owner action if there is one, else the demo clock. */
export function effectiveStatus(o: Order, now: number): OrderStatus {
  if (o.status) return o.status
  return STAGES[stageOf(o, now)].status
}

type Filter = 'all' | 'active' | 'completed'

export default function OrdersPanel() {
  const { orders, setOrderStatus, removeOrder, store, byId, toast, tick } = useApp()
  const [filter, setFilter] = useState<Filter>('all')
  const now = Date.now()
  void tick // re-renders on the demo clock

  const matches = (o: Order) => {
    if (filter === 'active') return isPending(o)
    if (filter === 'completed') return !isPending(o)
    return true
  }
  const list = orders.filter(matches)
  const counts = {
    all: orders.length,
    active: orders.filter(isPending).length,
    completed: orders.filter(o => !isPending(o)).length,
  }

  const advance = (o: Order) => {
    const step = NEXT[effectiveStatus(o, now)]
    if (!step) return
    setOrderStatus(o.id, step.status)
    toast(`#${o.id} → ${BADGE[step.status]}`, step.icon)
  }

  const cancel = (o: Order) => {
    setOrderStatus(o.id, 'cancelled')
    toast(`#${o.id} cancelled`, '✖')
  }

  const messageTo = (o: Order) =>
    window.open(
      waLink(store.whatsapp, `Hi ${o.name || 'there'}! 👋 This is ${store.name} about your order #${o.id}.`),
      '_blank',
      'noopener'
    )

  return (
    <div className="owner-orders">
      <div className="pills" role="tablist" aria-label="Filter orders">
        {(['all', 'active', 'completed'] as Filter[]).map(f => (
          <button
            key={f}
            className={cls('pill', filter === f && 'on')}
            onClick={() => setFilter(f)}
            aria-selected={filter === f}
          >
            {f[0].toUpperCase() + f.slice(1)} <span className="pill-n">{counts[f]}</span>
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="empty">
          <span className="empty-icon">🧾</span>
          <h3>{orders.length === 0 ? 'No orders yet' : 'Nothing in this view'}</h3>
          <p>
            {orders.length === 0
              ? 'Orders customers place on the storefront appear here instantly — accept them, move them along, done.'
              : 'Try another filter.'}
          </p>
        </div>
      ) : (
        <ul className="order-list">
          {list.map(o => {
            const st = effectiveStatus(o, now)
            const dead = isCancelled(o)
            const step = NEXT[st]
            return (
              <li key={o.id} className={cls('order-card', dead && 'cancelled')}>
                <div className="oc-head">
                  <div>
                    <b className="oc-id">#{o.id}</b>
                    <span className="oc-when">
                      {fmtDay(o.ts)} · {fmtTime(o.ts)}
                    </span>
                  </div>
                  <span className={cls('status-pill', st === 'completed' && 'done', dead && 'cancelled')}>
                    {dead ? '✖ Cancelled' : BADGE[st]}
                  </span>
                </div>

                <ul className="oc-lines">
                  {o.lines.map(l => {
                    const it = byId(l.id)
                    return (
                      <li key={l.id}>
                        <span className="oc-qty">{l.qty}×</span>
                        <span className="oc-name">{it?.name ?? l.id}</span>
                        <b>{money((it?.price ?? 0) * l.qty, store.currency)}</b>
                      </li>
                    )
                  })}
                </ul>

                <div className="oc-meta">
                  <div className="oc-customer">
                    <b>{o.name || 'Guest'}</b>
                    <span>{o.phone}</span>
                    {o.channel === 'table' && o.table ? (
                      <span className="oc-table">🪑 Table {o.table} · dine-in</span>
                    ) : (
                      <span>📍 {o.address}</span>
                    )}
                  </div>
                  <div className="oc-total">
                    <span>
                      Delivery {o.deliveryFee === 0 ? 'FREE' : money(o.deliveryFee, store.currency)}
                    </span>
                    <b>{money(o.total, store.currency)}</b>
                    <em>{o.payment}</em>
                  </div>
                </div>

                {o.note && <p className="oc-note">📝 {o.note}</p>}

                <div className="oc-actions">
                  {step && !dead && (
                    <button className="btn btn-primary btn-sm" onClick={() => advance(o)}>
                      {step.icon} {step.label}
                    </button>
                  )}
                  {st === 'new' && !dead && (
                    <button className="btn btn-ghost btn-sm" onClick={() => cancel(o)}>
                      Reject
                    </button>
                  )}
                  {st !== 'new' && !dead && st !== 'completed' && (
                    <button className="btn btn-ghost btn-sm" onClick={() => cancel(o)}>
                      Cancel
                    </button>
                  )}
                  <a className="btn btn-wa btn-sm" href="#" onClick={e => { e.preventDefault(); messageTo(o) }}>
                    <WAIcon size={15} /> Message
                  </a>
                  <button className="btn btn-ghost btn-sm" onClick={() => { removeOrder(o.id); toast(`#${o.id} removed from this browser`, '🗑️') }}>
                    Delete
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
