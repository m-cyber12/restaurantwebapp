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
  ['store', 'Manage Store'],
]

export default function TopNav() {
  const { view, go, store, cartCount, setCartOpen } = useApp()
  const owner = view === 'store'
  return (
    <header className={cls('topnav', owner && 'owner')}>
      <div className="wrap topnav-in">
        <button className="brand" onClick={() => go('home')} aria-label="Go to the storefront home">
          <span className="brand-mark">{store.emoji}</span>
          <span className="brand-text">
            <span className="brand-name">{store.name}</span>
            <span className="brand-sub">
              <PinIcon size={11} /> {store.city} · {store.open ? `Open ${store.hours}` : 'Closed'}
            </span>
          </span>
        </button>

        {owner ? (
          <span className="mode-pill" aria-label="Owner mode">
            <span className="dot-live" aria-hidden /> Owner mode
          </span>
        ) : (
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
        )}

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
