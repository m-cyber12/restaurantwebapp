import { useApp } from '../../store'
import { cls, money } from '../../lib/util'
import { dayStats, topProducts, weekSeries } from '../../lib/analytics'
import { isCancelled, statusLabel } from '../../lib/order'
import { fmtTime } from '../../lib/util'
import { Arrow } from '../icons'

export default function OverviewPanel() {
  const { store, orders, byId, goOwner, catalog, tables } = useApp()
  const stats = dayStats(orders)
  const best = topProducts(orders, byId, 5)
  const week = weekSeries(orders)
  const peak = Math.max(1, ...week.map(d => d.value))
  const recent = orders.slice(0, 5)
  const live = catalog.filter(i => i.available !== false).length
  const off = catalog.length - live

  const cards = [
    { label: "Today's orders", value: String(stats.orders), icon: '🧾' },
    { label: 'Revenue today', value: money(stats.revenue, store.currency), icon: '💰' },
    { label: 'Pending orders', value: String(stats.pending), icon: '⏳', alert: stats.pending > 0 },
    { label: 'Average order', value: money(stats.avg, store.currency), icon: '📈' },
  ]

  return (
    <div className="owner-overview">
      <div className="stat-grid">
        {cards.map(c => (
          <div key={c.label} className={cls('stat-card', c.alert && 'alert')}>
            <span className="stat-icon" aria-hidden>{c.icon}</span>
            <b className="stat-value">{c.value}</b>
            <span className="stat-label">{c.label}</span>
          </div>
        ))}
      </div>

      <div className="owner-two">
        <section className="card">
          <h3 className="card-h">Store status</h3>
          <div className="status-row">
            <span className={cls('status-orb', store.open && 'on')} aria-hidden />
            <div>
              <b>{store.open ? 'Open' : 'Closed'}</b>
              <span>{store.open ? `Taking orders · ${store.hours}` : 'Ordering is paused for customers'}</span>
            </div>
            <button
              className={cls('btn btn-sm', store.open ? 'btn-ghost' : 'btn-primary')}
              onClick={() => goOwner('settings')}
            >
              Change hours <Arrow size={14} />
            </button>
          </div>

          <h3 className="card-h sub">Quick actions</h3>
          <div className="quick-actions">
            <button className="btn btn-primary btn-sm" onClick={() => goOwner('menu')}>
              + Add product
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => goOwner('orders')}>
              View orders{stats.pending > 0 ? ` (${stats.pending})` : ''}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => goOwner('qr')}>
              Generate QR
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => goOwner('settings')}>
              Edit store
            </button>
          </div>
        </section>

        <section className="card">
          <h3 className="card-h">Last 7 days</h3>
          <div className="spark" role="img" aria-label={`Revenue for the last 7 days: ${week.map(d => `${d.label} ${money(d.value, store.currency)}`).join(', ')}`}>
            {week.map((d, i) => (
              <div key={i} className="spark-col">
                <i style={{ height: `${Math.max(3, (d.value / peak) * 100)}%` }} className={i === week.length - 1 ? 'today' : ''} />
                <span>{d.label[0]}</span>
              </div>
            ))}
          </div>
          <p className="card-sub">
            {live} product{live === 1 ? '' : 's'} live
            {off > 0 ? ` · ${off} switched off` : ''} ·{' '}
            {tables.length > 0 ? `${tables.length} table QR${tables.length === 1 ? '' : 's'} · ` : ''}
            delivery {money(store.fee, store.currency)} · free over{' '}
            {money(store.freeAt, store.currency)}
          </p>
        </section>
      </div>

      <div className="owner-two">
        <section className="card">
          <h3 className="card-h">Best sellers</h3>
          {best.length === 0 ? (
            <div className="empty empty-sm">
              <span className="empty-icon">📊</span>
              <h3>No orders yet</h3>
              <p>Place a test order from the storefront and it will show up here.</p>
            </div>
          ) : (
            <ul className="rank">
              {best.map((p, i) => (
                <li key={p.id}>
                  <span className="rank-n">{i + 1}</span>
                  <span className="rank-name">{p.name}</span>
                  <span className="rank-qty">×{p.qty}</span>
                  <b>{money(p.revenue, store.currency)}</b>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card">
          <div className="card-h-row">
            <h3 className="card-h">Recent orders</h3>
            {orders.length > 0 && (
              <button className="link" onClick={() => goOwner('orders')}>
                All orders <Arrow size={13} />
              </button>
            )}
          </div>
          {recent.length === 0 ? (
            <div className="empty empty-sm">
              <span className="empty-icon">🧾</span>
              <h3>Nothing yet</h3>
              <p>Orders your customers place appear here instantly.</p>
            </div>
          ) : (
            <ul className="mini-orders">
              {recent.map(o => (
                <li key={o.id} className={cls(isCancelled(o) && 'cancelled')}>
                  <b>#{o.id}</b>
                  <span>{o.name || 'Guest'} · {fmtTime(o.ts)}</span>
                  <em>{isCancelled(o) ? 'Cancelled' : statusLabel(o)}</em>
                  <b>{money(o.total, store.currency)}</b>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <p className="owner-note">
        ℹ️ There is no server behind this demo — every number is computed from the
        orders stored in <b>this browser</b>. Connect a real backend to make them
        shared across devices.
      </p>
    </div>
  )
}
