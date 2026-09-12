import { useEffect, useRef } from 'react'
import { useApp } from '../store'
import { cls, money } from '../lib/util'
import Img from './Img'
import { Arrow, CartIcon, ScooterIcon } from './icons'

/**
 * The cart. A right-hand drawer on desktop, a bottom sheet on mobile (pure
 * CSS). Same content either way: free-delivery progress, live line editing,
 * honest totals, and one obvious way forward.
 */
export default function CartDrawer() {
  const {
    cartOpen, setCartOpen, cart, byId, setQty, removeLine, clearCart,
    subtotal, deliveryFee, total, store, go, table, setTable,
  } = useApp()
  const panelRef = useRef<HTMLElement>(null)

  const lines = cart.map(l => ({ line: l, item: byId(l.id) })).filter(x => x.item)
  const remaining = Math.max(0, store.freeAt - subtotal)
  const pct = Math.min(100, store.freeAt > 0 ? (subtotal / store.freeAt) * 100 : 100)
  const count = cart.reduce((a, l) => a + l.qty, 0)

  // Escape closes, and the page behind stops scrolling while it is open.
  useEffect(() => {
    if (!cartOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setCartOpen(false)
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [cartOpen, setCartOpen])

  return (
    <>
      <div
        className={cls('scrim', cartOpen && 'on')}
        onClick={() => setCartOpen(false)}
        aria-hidden
      />
      <aside
        className={cls('drawer', cartOpen && 'on')}
        aria-label="Your cart"
        aria-hidden={!cartOpen}
        ref={panelRef}
      >
        <header className="drawer-head">
          <h2>
            Your cart
            {cart.length > 0 && (
              <span className="drawer-count" key={count}>
                {count}
              </span>
            )}
          </h2>
          <span className="drawer-store">
            {store.emoji} {store.name}
          </span>
          <button className="drawer-x" onClick={() => setCartOpen(false)} aria-label="Close cart">
            ×
          </button>
        </header>

        {lines.length === 0 ? (
          <div className="drawer-empty">
            <span className="empty-icon">
              <CartIcon size={24} />
            </span>
            <h3>Your cart is hungry</h3>
            <p>Add something tasty — hot from the kitchen or fresh from the market.</p>
            <button className="btn btn-primary" onClick={() => go('menu')}>
              Browse the menu <Arrow size={15} />
            </button>
            <button className="btn btn-quiet btn-sm" onClick={() => go('grocery')}>
              Or the market
            </button>
          </div>
        ) : (
          <>
            {table ? (
              <div className="freedl dinein">
                <span className="freedl-icon" aria-hidden>
                  🪑
                </span>
                <p>
                  Eating in at <b>table {table}</b> — no delivery fee.{' '}
                  <button className="link" onClick={() => setTable(null)}>
                    Switch to delivery
                  </button>
                </p>
              </div>
            ) : (
              <div className="freedl">
                <span className="freedl-icon" aria-hidden>
                  <ScooterIcon size={17} />
                </span>
                {remaining > 0 ? (
                  <p>
                    Add <b>{money(remaining, store.currency)}</b> more for <b>free delivery</b>
                  </p>
                ) : (
                  <p>
                    <b>Free delivery</b> unlocked 🎉
                  </p>
                )}
                <div className="freedl-bar">
                  <i style={{ width: `${pct}%` }} className={remaining === 0 ? 'full' : ''} />
                </div>
              </div>
            )}

            <ul className="drawer-lines">
              {lines.map(({ line, item }) => (
                <li key={line.id}>
                  <div className="dl-thumb">
                    <Img item={item!} />
                  </div>
                  <div className="dl-info">
                    <b>{item!.name}</b>
                    <span>
                      {item!.unit ? `${item!.unit} · ` : ''}
                      {money(item!.price, store.currency)}
                    </span>
                    <button className="dl-remove" onClick={() => removeLine(line.id)}>
                      Remove
                    </button>
                  </div>
                  <div className="dl-right">
                    <div className="stepper stepper-sm" role="group" aria-label={`Quantity of ${item!.name}`}>
                      <button onClick={() => setQty(line.id, line.qty - 1)} aria-label={`One less ${item!.name}`}>
                        −
                      </button>
                      <span aria-live="polite">{line.qty}</span>
                      <button onClick={() => setQty(line.id, line.qty + 1)} aria-label={`One more ${item!.name}`}>
                        +
                      </button>
                    </div>
                    <b className="dl-total">{money(item!.price * line.qty, store.currency)}</b>
                  </div>
                </li>
              ))}
            </ul>

            <footer className="drawer-foot">
              <div className="drow">
                <span>Subtotal</span>
                <span>{money(subtotal, store.currency)}</span>
              </div>
              <div className="drow">
                <span>{table ? `Table ${table} · dine-in` : 'Delivery'}</span>
                <span className={deliveryFee === 0 ? 'free' : ''}>
                  {deliveryFee === 0 ? (table ? 'No delivery' : 'FREE') : money(deliveryFee, store.currency)}
                </span>
              </div>
              <div className="drow drow-total">
                <span>Total</span>
                <span>{money(total, store.currency)}</span>
              </div>
              <button
                className="btn btn-primary btn-lg"
                onClick={() => {
                  setCartOpen(false)
                  go('checkout')
                }}
              >
                Checkout <Arrow size={15} />
              </button>
              <button className="btn btn-quiet btn-sm" onClick={clearCart}>
                Clear cart
              </button>
            </footer>
          </>
        )}
      </aside>
    </>
  )
}
