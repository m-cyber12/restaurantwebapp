import { useApp } from '../store'
import { money } from '../lib/util'
import { greetingLink } from '../lib/whatsapp'
import QR from './QR'
import { Arrow, ClockIcon, PinIcon, WAIcon } from './icons'
import type { View } from '../types'

export default function Footer() {
  const { store, go, goOwner, link } = useApp()
  const links: Array<[View, string]> = [
    ['menu', 'Restaurant menu'],
    ['grocery', 'Grocery market'],
    ['track', 'Track an order'],
    ['store', 'Set up your store'],
  ]

  return (
    <footer className="footer">
      <div className="wrap footer-in">
        <div className="footer-brand">
          <span className="footer-logo">
            <span className="footer-mark" aria-hidden>
              {store.emoji}
            </span>
            <b>{store.name}</b>
          </span>
          <p>
            {store.tagline}. Scan the QR, build your cart, and your order lands on our WhatsApp.
          </p>
          <a
            className="btn btn-wa btn-sm"
            href={greetingLink(store.whatsapp, store.name)}
            target="_blank"
            rel="noreferrer"
          >
            <WAIcon size={15} /> WhatsApp us
          </a>
        </div>

        <div className="footer-col">
          <h4>Explore</h4>
          {links.map(([v, l]) => (
            <button key={v} onClick={() => go(v)}>
              {l}
              <Arrow size={12} />
            </button>
          ))}
        </div>

        <div className="footer-col">
          <h4>Store</h4>
          <span className="footer-fact">
            <PinIcon size={13} /> {store.city}
          </span>
          <span className="footer-fact">
            <ClockIcon size={13} /> {store.open ? `Open ${store.hours}` : 'Closed now'}
          </span>
          {store.address && <span className="footer-fact">{store.address}</span>}
          <span className="footer-fact">Free delivery over {money(store.freeAt, store.currency)}</span>
          <span className="footer-fact">Average delivery · {store.stats.delivery}</span>
        </div>

        <div className="footer-col">
          <h4>Payments</h4>
          <span className="footer-fact">💵 Cash on delivery</span>
          <span className="footer-fact">💳 Card</span>
          {store.usdt.trim() && <span className="footer-fact">⚡ USDT (TRC-20)</span>}
        </div>

        <div className="footer-col">
          <h4>Scan to order</h4>
          <button className="footer-qr-btn" onClick={() => goOwner('qr')} aria-label="Open the QR studio">
            <QR value={link} size={96} />
            <span>Open the QR studio</span>
          </button>
        </div>
      </div>

      <div className="wrap footer-base">
        <span>
          © {new Date().getFullYear()} {store.name} · QR · WhatsApp · Door-to-door
        </span>
        <span className="footer-base-note">
          Demo storefront — orders and settings live in this browser only
        </span>
      </div>
    </footer>
  )
}
