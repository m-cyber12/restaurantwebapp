import { useApp } from '../store'
import { cls } from '../lib/util'
import { greetingLink } from '../lib/whatsapp'
import { WAIcon, CartIcon, PinIcon } from './icons'
import type { View } from '../types'

const TABS: Array<[View, string]> = [
  ['home', 'Home'],
  ['menu', 'Menu'],
  ['grocery', 'Grocery'],
  ['track', 'Track order'],
  ['store', 'For owners'],
]

export default function TopNav() {
  const { view, go, store, cartCount, setCartOpen } = useApp()
  return (
    <header className="topnav">
      <div className="wrap topnav-in">
        <button className="brand" onClick={() => go('home')} aria-label="Home">
          <span className="brand-mark">{store.emoji}</span>
          <span className="brand-text">
            <span className="brand-name">{store.name}</span>
            <span className="brand-sub">
              <PinIcon size={11} /> {store.city} · Open till 23:00
            </span>
          </span>
        </button>

        <nav className="tabs" aria-label="Main">
          {TABS.map(([v, label]) => (
            <button
              key={v}
              className={cls('tab', view === v && 'on')}
              onClick={() => go(v)}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="topnav-actions">
          <a
            className="btn btn-wa btn-sm"
            href={greetingLink(store.whatsapp, store.name)}
            target="_blank"
            rel="noreferrer"
          >
            <WAIcon size={16} />
            <span className="wa-label">WhatsApp</span>
          </a>
          <button
            className="cartbtn"
            onClick={() => setCartOpen(true)}
            aria-label={`Open cart, ${cartCount} items`}
          >
            <CartIcon size={19} />
            <span className="cartbtn-label">Cart</span>
            {cartCount > 0 && (
              <span className="cartbadge" key={cartCount}>
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
