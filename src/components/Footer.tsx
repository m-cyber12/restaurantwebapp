import { useApp } from '../store'
import { money } from '../lib/util'
import { greetingLink } from '../lib/whatsapp'
import { WAIcon } from './icons'
import type { View } from '../types'

export default function Footer() {
  const { store, go } = useApp()
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
          <div className="footer-logo">
            {store.emoji} <b>{store.name}</b>
          </div>
          <p>{store.tagline}. Scan the QR, build your cart, and your order lands on our WhatsApp.</p>
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
            </button>
          ))}
        </div>
        <div className="footer-col">
          <h4>Store</h4>
          <span>{store.city} · {store.open ? `Open ${store.hours}` : 'Closed now'}</span>
          {store.address && <span>{store.address}</span>}
          <span>Free delivery over {money(store.freeAt, store.currency)}</span>
          <span>Average delivery · {store.stats.delivery}</span>
        </div>
        <div className="footer-col">
          <h4>Payments</h4>
          <span>💵 Cash on delivery</span>
          <span>💳 Card</span>
          {store.usdt.trim() && <span>⚡ USDT (TRC-20)</span>}
        </div>
      </div>
      <div className="wrap footer-base">
        © {new Date().getFullYear()} {store.name} · QR · WhatsApp · Door-to-door
      </div>
    </footer>
  )
}
