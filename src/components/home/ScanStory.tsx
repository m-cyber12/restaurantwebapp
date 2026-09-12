import { useMemo } from 'react'
import { WHEN_OPTIONS } from '../../data'
import { useApp } from '../../store'
import { cls, money } from '../../lib/util'
import { buildOrderMessage, waLink } from '../../lib/whatsapp'
import { useActiveStep, useMotionEnabled } from '../../lib/motion'
import Img from '../Img'
import QR from '../QR'
import Reveal from '../Reveal'
import { QrIcon, WAIcon } from '../icons'

/**
 * "One scan changes the whole ordering experience."
 *
 * A sticky phone on the left, four scroll steps on the right. Every screen the
 * phone shows is built from real data: the real storefront link, the real
 * catalog, the real cart, and the real WhatsApp message the order would send.
 * The add buttons in step two genuinely add to the cart.
 */

const STEPS = [
  {
    kicker: 'Step 01',
    title: 'One scan, no app',
    body: 'Every table, shelf and window carries the same code. A camera opens it, the browser does the rest — nothing to install, nothing to sign up for.',
  },
  {
    kicker: 'Step 02',
    title: 'Your menu, live',
    body: 'The full menu and the market in one place, with prices, photos and availability the moment you change them. Tap to add.',
  },
  {
    kicker: 'Step 03',
    title: 'One cart, everything',
    body: 'A pepperoni and six eggs in the same basket. The total, the delivery fee and the free-delivery threshold all update as you go.',
  },
  {
    kicker: 'Step 04',
    title: 'Straight to WhatsApp',
    body: 'The order arrives as a clean, itemised message on the restaurant’s WhatsApp — table number, contact, payment and all. They confirm, it cooks.',
  },
]

export default function ScanStory() {
  const { store, link, items, cart, byId, addToCart, subtotal } = useApp()
  const motion = useMotionEnabled()
  const [stepsRef, active] = useActiveStep<HTMLOListElement>(motion)

  /** Two real products stand in for a basket when the cart is empty. */
  const exampleLines = useMemo(() => {
    const picks = items.filter(i => i.popular || i.featured).slice(0, 2)
    const list = picks.length >= 2 ? picks : items.slice(0, 2)
    return list.map(i => ({ id: i.id, qty: i.id === list[0]?.id ? 2 : 1 }))
  }, [items])

  const shown = cart.length > 0 ? cart : exampleLines
  const shownSubtotal =
    cart.length > 0 ? subtotal : shown.reduce((a, l) => a + (byId(l.id)?.price ?? 0) * l.qty, 0)

  const preview = useMemo(
    () =>
      buildOrderMessage(
        store,
        {
          id: 'FB-0001',
          ts: Date.now(),
          lines: shown,
          subtotal: shownSubtotal,
          deliveryFee: 0,
          total: shownSubtotal,
          name: 'You',
          phone: '+1 555 010 2030',
          address: `${store.address}, ${store.city}`,
          when: WHEN_OPTIONS[0],
          payment: 'Cash on delivery',
          sentWhatsApp: true,
        },
        byId
      ),
    [store, shown, shownSubtotal, byId]
  )

  const menuSamples = items.filter(i => i.img).slice(0, 3)

  return (
    <section className="story" id="how-scan-works" aria-labelledby="story-title">
      <div className="wrap">
        <Reveal className="story-head">
          <span className="kicker kicker-accent">
            <QrIcon size={14} /> The scan
          </span>
          <h2 id="story-title">One scan changes the whole ordering experience.</h2>
          <p className="story-lede">
            No app store, no queue at the counter, no “sorry, the machine is down”. Scroll the
            four steps — the phone follows along.
          </p>
        </Reveal>

        <div className="story-grid">
          <div className="story-sticky">
            <div className="phone" data-step={active}>
              <span className="phone-notch" aria-hidden />
              <div className="phone-screen">
                {/* 0 · scan */}
                <div className={cls('phone-pane', active === 0 && 'on')} aria-hidden={active !== 0}>
                  <div className="pane-scan">
                    <span className="pane-scan-frame">
                      <QR value={link} size={150} />
                      <span className="pane-scan-line" aria-hidden />
                    </span>
                    <b>{store.emoji} {store.name}</b>
                    <span className="pane-url">{link.replace(/^https?:\/\//, '').slice(0, 44)}…</span>
                    <span className="pane-hint">Point your camera here</span>
                  </div>
                </div>

                {/* 1 · menu */}
                <div className={cls('phone-pane', active === 1 && 'on')} aria-hidden={active !== 1}>
                  <div className="pane-head">
                    <b>{store.name}</b>
                    <span>{store.city} · open</span>
                  </div>
                  <ul className="pane-list">
                    {menuSamples.map(i => (
                      <li key={i.id}>
                        <span className="pane-thumb">
                          <Img item={i} />
                        </span>
                        <span className="pane-item">
                          <b>{i.name}</b>
                          <span>{money(i.price, store.currency)}</span>
                        </span>
                        <button
                          className="pane-add"
                          onClick={() => addToCart(i.id)}
                          aria-label={`Add ${i.name} to your cart`}
                        >
                          +
                        </button>
                      </li>
                    ))}
                  </ul>
                  <span className="pane-foot">{items.length} items · menu + market</span>
                </div>

                {/* 2 · cart */}
                <div className={cls('phone-pane', active === 2 && 'on')} aria-hidden={active !== 2}>
                  <div className="pane-head">
                    <b>Your cart</b>
                    <span>{shown.reduce((a, l) => a + l.qty, 0)} items</span>
                  </div>
                  <ul className="pane-list">
                    {shown.slice(0, 4).map(l => {
                      const it = byId(l.id)
                      if (!it) return null
                      return (
                        <li key={l.id}>
                          <span className="pane-thumb">
                            <Img item={it} />
                          </span>
                          <span className="pane-item">
                            <b>{it.name}</b>
                            <span>
                              {l.qty}× {money(it.price, store.currency)}
                            </span>
                          </span>
                          <b className="pane-line-total">
                            {money(it.price * l.qty, store.currency)}
                          </b>
                        </li>
                      )
                    })}
                  </ul>
                  <div className="pane-total">
                    <span>Subtotal</span>
                    <b>{money(shownSubtotal, store.currency)}</b>
                  </div>
                  {cart.length === 0 && <span className="pane-foot">Example basket</span>}
                </div>

                {/* 3 · whatsapp */}
                <div className={cls('phone-pane pane-wa', active === 3 && 'on')} aria-hidden={active !== 3}>
                  <div className="pane-head pane-head-wa">
                    <WAIcon size={15} />
                    <b>{store.name}</b>
                    <span>online</span>
                  </div>
                  <div className="pane-bubble">
                    <pre>{preview}</pre>
                  </div>
                  <span className="pane-foot">Delivered to {store.whatsapp}</span>
                </div>
              </div>
            </div>
          </div>

          <ol className="story-steps" ref={stepsRef}>
            {STEPS.map((s, i) => (
              <li key={s.kicker} className={cls('story-step', active === i && 'on')} data-step={i}>
                <span className="story-step-n" aria-hidden>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="story-step-k">{s.kicker}</span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
                {i === STEPS.length - 1 && (
                  <a
                    className="btn btn-wa btn-sm"
                    href={waLink(store.whatsapp, `Hi ${store.name}! 👋 I'd like to place an order.`)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <WAIcon size={15} /> Say hello on WhatsApp
                  </a>
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
