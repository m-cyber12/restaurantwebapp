import { useApp } from '../store'
import { cls, money } from '../lib/util'
import { greetingLink } from '../lib/whatsapp'
import { useScrolled, useScrollProgress } from '../lib/motion'
import { WAIcon, CartIcon, PinIcon, Arrow } from './icons'
import type { View } from '../types'

const TABS: Array<[View, string]> = [
  ['home', 'Home'],
  ['menu', 'Menu'],
  ['grocery', 'Grocery'],
  ['track', 'Track order'],
  ['store', 'Manage Store'],
]

/**
 * Floating command bar. One element carries the brand, the route, the
 * WhatsApp escape hatch and the cart — the four things a customer needs from
 * anywhere in the product. It gains a surface once the page scrolls, and a
 * hairline at its edge doubles as the document scroll progress.
 */
export default function TopNav() {
  const { view, go, store, cartCount, total, setCartOpen } = useApp()
  const stuck = useScrolled(14)
  const progress = useScrollProgress()
  const owner = view === 'store'

  return (
    <header className={cls('topnav', stuck && 'stuck', owner && 'owner')}>
      <div className="wrap topnav-in">
        <button
          className="brand"
          onClick={() => go('home')}
          aria-label={`${store.name} — go to the storefront home`}
        >
          <span className="brand-mark" aria-hidden>
            {store.emoji}
          </span>
          <span className="brand-text">
            <span className="brand-name">{store.name}</span>
            <span className="brand-sub">
              <span className={cls('dot-live', !store.open && 'off')} aria-hidden />
              <PinIcon size={11} />
              {store.city} · {store.open ? `Open ${store.hours}` : 'Closed'}
            </span>
          </span>
        </button>

        {owner ? (
          <span className="mode-pill">
            <span className="dot-live" aria-hidden />
            Owner mode
          </span>
        ) : (
          <nav className="tabs" aria-label="Main">
            {TABS.map(([v, label]) => (
              <button
                key={v}
                className={cls('tab', view === v && 'on')}
                onClick={() => go(v)}
                aria-current={view === v ? 'page' : undefined}
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
            className={cls('cartbtn', cartCount > 0 && 'has')}
            onClick={() => setCartOpen(true)}
            aria-label={`Open cart, ${cartCount} items`}
          >
            <CartIcon size={19} />
            <span className="cartbtn-label">Cart</span>
            {cartCount > 0 && (
              <>
                <span className="cartbadge" key={cartCount}>
                  {cartCount}
                </span>
                <span className="cartbtn-total" aria-hidden>
                  {money(total, store.currency)}
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      <span className="nav-progress" aria-hidden>
        <i style={{ transform: `scaleX(${progress})` }} />
      </span>
    </header>
  )
}
