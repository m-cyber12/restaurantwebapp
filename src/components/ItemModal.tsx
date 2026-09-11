import { useEffect, useState } from 'react'
import { CATEGORIES } from '../data'
import { useApp } from '../store'
import { money } from '../lib/util'
import Img from './Img'
import { WAIcon, Arrow } from './icons'

export default function ItemModal() {
  const { modalId, openItem, byId, store, addToCart, cart, go } = useApp()
  const [qty, setQty] = useState(1)

  useEffect(() => {
    setQty(1)
  }, [modalId])

  if (!modalId) return null
  const item = byId(modalId)
  if (!item) return null

  const cat = CATEGORIES.find(c => c.id === item.category)
  const inCart = cart.find(l => l.id === item.id)?.qty ?? 0

  const close = () => {
    openItem(null)
    setQty(1)
  }

  const orderViaWA = () => {
    addToCart(item.id, qty)
    openItem(null)
    setQty(1)
    go('checkout')
  }

  return (
    <div className="modal-scrim" onClick={close} role="presentation">
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={item.name}
        onClick={e => e.stopPropagation()}
      >
        <button className="modal-x" onClick={close} aria-label="Close">
          ×
        </button>
        <div className="modal-grid">
          <div className="modal-media">
            <Img item={item} eager />
            {item.popular && <span className="chip chip-pop modal-pop">🔥 Popular right now</span>}
          </div>
          <div className="modal-info">
            <span className="modal-cat">
              {cat ? `${cat.emoji} ${cat.label}` : item.kind === 'menu' ? 'Restaurant' : 'Market'}
            </span>
            <h2>{item.name}</h2>
            <div className="modal-rating">
              <b>★ {item.rating}</b>
              <span>· {item.reviews} reviews</span>
            </div>
            <div className="modal-chips">
              {item.unit && <span className="chip">{item.unit}</span>}
              {item.kcal && <span className="chip">{item.kcal} kcal</span>}
              {item.time && <span className="chip">⏱ {item.time}</span>}
              {item.kind === 'grocery' && <span className="chip">🌿 Fresh today</span>}
              {inCart > 0 && <span className="chip chip-cart">🛒 {inCart} in cart</span>}
            </div>
            <p className="modal-desc">{item.desc}</p>

            <div className="modal-buy">
              <div className="stepper stepper-lg">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} aria-label="Less">−</button>
                <span>{qty}</span>
                <button onClick={() => setQty(q => q + 1)} aria-label="More">+</button>
              </div>
              <button className="btn btn-primary btn-lg" onClick={() => { addToCart(item.id, qty); close() }}>
                Add · {money(item.price * qty, store.currency)}
              </button>
            </div>
            <button className="btn btn-wa btn-lg" onClick={orderViaWA}>
              <WAIcon size={18} /> Order via WhatsApp <Arrow size={15} />
            </button>
            <p className="modal-note">
              No app, no account — the order is sent to our WhatsApp and tracked live.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
