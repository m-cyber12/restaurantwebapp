import { useApp } from '../../store'
import { money } from '../../lib/util'
import { dayStats, weekSeries } from '../../lib/analytics'
import Reveal from '../Reveal'
import QR from '../QR'
import { Arrow, CheckIcon, QrIcon, ShieldIcon, SparkIcon, StoreIcon } from '../icons'

const POINTS = [
  {
    icon: QrIcon,
    title: 'A code for the window, and one per table',
    body: 'Download a 1024px PNG, print table tents, or copy the link. Table numbers travel with the order.',
  },
  {
    icon: CheckIcon,
    title: 'Orders land on your WhatsApp, formatted',
    body: 'Itemised, totalled, with the customer, the address or the table, and how they are paying.',
  },
  {
    icon: SparkIcon,
    title: 'Your menu, your prices, your brand',
    body: 'Add products, switch items off, change the accent colour and the logo — the storefront rebrands live.',
  },
  {
    icon: ShieldIcon,
    title: 'Nothing to install, anywhere',
    body: 'It runs in the customer’s browser. You manage it from the same link you printed.',
  },
]

/**
 * The "this is a product, not a landing page" moment. Everything shown here is
 * real: the QR encodes the actual storefront link, and the numbers come from
 * the orders held in this browser (the panel says so).
 */
export default function OwnersBand() {
  const { store, link, go, goOwner, orders } = useApp()
  const stats = dayStats(orders)
  const week = weekSeries(orders)
  const peak = Math.max(1, ...week.map(d => d.value))

  return (
    <section className="owners" aria-labelledby="owners-title">
      <span className="owners-glow" aria-hidden />
      <div className="wrap owners-in">
        <div className="owners-copy">
          <Reveal>
            <span className="kicker kicker-accent">
              <StoreIcon size={14} /> For restaurant &amp; shop owners
            </span>
          </Reveal>
          <Reveal delay={60}>
            <h2 id="owners-title">Put your menu on every table.</h2>
          </Reveal>
          <Reveal delay={110}>
            <p className="owners-lede">
              Print the code, stick it on your tables and shelves. Customers scan, browse and
              order — and every single order arrives on <b>your</b> WhatsApp, ready to confirm.
            </p>
          </Reveal>

          <ul className="owners-points">
            {POINTS.map((p, i) => (
              <Reveal as="li" key={p.title} delay={140 + i * 80} className="owners-point">
                <span className="owners-point-icon" aria-hidden>
                  <p.icon size={17} />
                </span>
                <span>
                  <b>{p.title}</b>
                  <span>{p.body}</span>
                </span>
              </Reveal>
            ))}
          </ul>

          <Reveal className="owners-ctas" delay={420}>
            <button className="btn btn-primary" onClick={() => go('store')}>
              Open the owner dashboard <Arrow size={15} />
            </button>
            <button className="btn btn-ghost" onClick={() => goOwner('qr')}>
              <QrIcon size={16} /> Generate my QR
            </button>
          </Reveal>
        </div>

        <Reveal className="owners-art" variant="scale" delay={160}>
          <div className="mock">
            <div className="mock-bar">
              <span className="mock-dots" aria-hidden>
                <i />
                <i />
                <i />
              </span>
              <span className="mock-url">/?store={store.slug}</span>
              <span className="mock-live">
                <span className="dot-live" aria-hidden /> live
              </span>
            </div>

            <div className="mock-body">
              <div className="mock-stats">
                <div className="mock-stat">
                  <span>{stats.orders}</span>
                  <em>orders today</em>
                </div>
                <div className="mock-stat">
                  <span>{money(stats.revenue, store.currency)}</span>
                  <em>revenue</em>
                </div>
                <div className="mock-stat">
                  <span>{stats.pending}</span>
                  <em>to confirm</em>
                </div>
              </div>

              <div className="mock-chart" aria-hidden>
                {week.map((d, i) => (
                  <i
                    key={i}
                    style={{ height: `${Math.max(4, (d.value / peak) * 100)}%` }}
                    className={i === week.length - 1 ? 'today' : ''}
                  />
                ))}
              </div>

              <div className="mock-row">
                <span className="mock-qr">
                  <QR value={link} size={84} />
                </span>
                <span className="mock-row-copy">
                  <b>{store.emoji} {store.name}</b>
                  <em>Scan · order · we confirm on WhatsApp</em>
                  <span className="mock-btn">Download QR</span>
                </span>
              </div>
            </div>
          </div>

          <div className="owners-art-note">
            Dashboard preview · numbers come from this browser, there is no server in this demo
          </div>
        </Reveal>
      </div>
    </section>
  )
}
