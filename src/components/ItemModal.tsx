import { useEffect, useRef, useState } from 'react'
import { CATEGORIES } from '../data'
import { useApp } from '../store'
import { cls, money } from '../lib/util'
import Img from './Img'
import { Arrow, ClockIcon, CheckIcon, StarIcon, WAIcon } from './icons'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * The product sheet. Opens on any card, traps focus, closes on Escape or
 * backdrop, and offers both ways out: into the cart, or straight to checkout.
 */
export default function ItemModal() {
  const { modalId, openItem, byId, store, addToCart, cart, go } = useApp()
  const [qty, setQty] = useState(1)
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  const item = modalId ? byId(modalId) : undefined

  // Reset the quantity whenever a different product is opened.
  useEffect(() => {
    setQty(1)
  }, [modalId])

  // Focus in on open, Escape to close, Tab kept inside the sheet.
  useEffect(() => {
    if (!modalId) return
    const previous = document.activeElement as HTMLElement | null
    closeRef.current?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        openItem(null)
        return
      }
      if (e.key !== 'Tab' || !dialogRef.current) return
      const nodes = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE))
      if (nodes.length === 0) return
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      previous?.focus?.()
    }
  }, [modalId, openItem])

  if (!modalId || !item) return null

  const cat = CATEGORIES.find(c => c.id === item.category)
  const inCart = cart.find(l => l.id === item.id)?.qty ?? 0

  const close = () => openItem(null)

  const orderNow = () => {
    addToCart(item.id, qty)
    openItem(null)
    go('checkout')
  }

  return (
    <div className="modal-scrim" onClick={close} role="presentation">
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={item.name}
        ref={dialogRef}
        onClick={e => e.stopPropagation()}
      >
        <button className="modal-x" onClick={close} aria-label="Close" ref={closeRef}>
          ×
        </button>

        <div className="modal-grid">
          <div className="modal-media">
            <Img item={item} eager />
            {item.popular && <span className="chip chip-pop modal-pop">Popular right now</span>}
          </div>

          <div className="modal-info">
            <span className="modal-cat">
              {cat ? `${cat.emoji} ${cat.label}` : item.kind === 'menu' ? 'Restaurant' : 'Market'}
            </span>
            <h2>{item.name}</h2>

            <div className="modal-rating">
              <b>
                <StarIcon size={13} /> {item.rating}
              </b>
              <span>· {item.reviews} reviews</span>
            </div>

            <div className="modal-chips">
              {item.unit && <span className="chip">{item.unit}</span>}
              {item.kcal && <span className="chip">{item.kcal} kcal</span>}
              {item.time && (
                <span className="chip">
                  <ClockIcon size={12} /> {item.time}
                </span>
              )}
              {item.kind === 'grocery' && <span className="chip">Fresh today</span>}
              {inCart > 0 && <span className="chip chip-cart">{inCart} in cart</span>}
            </div>

            <p className="modal-desc">{item.desc}</p>

            <div className="modal-buy">
              <div className="stepper stepper-lg" role="group" aria-label="Quantity">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} aria-label="One less">
                  −
                </button>
                <span aria-live="polite">{qty}</span>
                <button onClick={() => setQty(q => Math.min(99, q + 1))} aria-label="One more">
                  +
                </button>
              </div>
              <button
                className="btn btn-primary btn-lg"
                onClick={() => {
                  addToCart(item.id, qty)
                  close()
                }}
              >
                <CheckIcon size={16} /> Add · {money(item.price * qty, store.currency)}
              </button>
            </div>

            <button className={cls('btn btn-wa btn-lg')} onClick={orderNow}>
              <WAIcon size={18} /> Order now on WhatsApp <Arrow size={15} />
            </button>

            <p className="modal-note">
              No app, no account — the order goes to our WhatsApp and you can track it live.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
