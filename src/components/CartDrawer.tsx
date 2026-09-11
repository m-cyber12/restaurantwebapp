import { useApp } from '../store'
import { cls, money } from '../lib/util'
import Img from './Img'
import { Arrow } from './icons'

export default function CartDrawer() {
  const {
    cartOpen, setCartOpen, cart, byId, setQty, removeLine, clearCart,
    subtotal, deliveryFee, total, store, go,
  } = useApp()

  const lines = cart.map(l => ({ line: l, item: byId(l.id) })).filter(x => x.item)
  const remaining = Math.max(0, store.freeAt - subtotal)
  const pct = Math.min(100, (subtotal / store.freeAt) * 100)

  return (
    <>
      <div
        className={cls('scrim', cartOpen && 'on')}
        onClick={() => setCartOpen(false)}
        aria-hidden
      />
      <aside className={cls('drawer', cartOpen && 'on')} aria-label="Your cart" aria-hidden={!cartOpen}>
        <header className="drawer-head">
          <h2>
            Your cart
            {cart.length > 0 && <span className="drawer-count">{cart.reduce((a, l) => a + l.qty, 0)}</span>}
          </h2>
          <button onClick={() => setCartOpen(false)} aria-label="Close cart">× </button>
        </header>

        {lines.length === 0 ? (
          <div className="drawer-empty">
            <span className="empty-icon">🛒</span>
            <h3>Your cart is hungry</h3>
            <p>Add something tasty — hot from the kitchen or fresh from the market.</p>
            <button className="btn btn-primary" onClick={() => go('menu')}>
              Browse the menu <Arrow size={15} />
            </button>
          </div>
        ) : (
          <>
            <div className="freedl">
              {remaining > 0 ? (
                <p>
                  Add <b>{money(remaining, store.currency)}</b> more for <b>free delivery</b> 🛵
                </p>
              ) : (
                <p>🎉 You’ve unlocked <b>free delivery</b>!</p>
              )}
              <div className="freedl-bar">
                <i style={{ width: `${pct}%` }} className={remaining === 0 ? 'full' : ''} />
              </div>
            </div>

            <ul className="drawer-lines">
              {lines.map(({ line, item }) => (
                <li key={line.id}>
                  <div className="dl-thumb">
                    <Img item={item!} />
                  </div>
                  <div className="dl-info">
                    <b>{item!.name}</b>
                    <span>{item!.unit ? `${item!.unit} · ` : ''}{money(item!.price, store.currency)}</span>
                    <button className="dl-remove" onClick={() => removeLine(line.id)}>
                      Remove
                    </button>
                  </div>
                  <div className="dl-right">
                    <div className="stepper stepper-sm">
                      <button onClick={() => setQty(line.id, line.qty - 1)} aria-label="Less">−</button>
                      <span>{line.qty}</span>
                      <button onClick={() => setQty(line.id, line.qty + 1)} aria-label="More">+</button>
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
                <span>Delivery</span>
                <span className={deliveryFee === 0 ? 'free' : ''}>
                  {deliveryFee === 0 ? 'FREE' : money(deliveryFee, store.currency)}
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
              <button className="btn-ghost btn-sm" onClick={clearCart}>
                Clear cart
              </button>
            </footer>
          </>
        )}
      </aside>
    </>
  )
}
