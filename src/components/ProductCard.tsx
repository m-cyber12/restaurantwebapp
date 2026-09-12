import { useRef } from 'react'
import { useApp } from '../store'
import { cls, money } from '../lib/util'
import { CATEGORIES } from '../data'
import { flyToCart, useMotionEnabled } from '../lib/motion'
import type { Item } from '../types'
import Img from './Img'
import { HeartIcon, PlusIcon, StarIcon } from './icons'

/**
 * The workhorse of the catalog. Media zooms, the card lifts, the add button
 * morphs into a quantity control the moment the item is in the basket, and a
 * dot flies to the cart so the action is felt, not just counted.
 */
export default function ProductCard({ item }: { item: Item }) {
  const { cart, addToCart, setQty, favs, toggleFav, openItem, store } = useApp()
  const motion = useMotionEnabled()
  const addRef = useRef<HTMLButtonElement>(null)
  const line = cart.find(l => l.id === item.id)
  const cat = CATEGORIES.find(c => c.id === item.category)
  const faved = favs.includes(item.id)

  const add = () => {
    if (addRef.current) flyToCart(addRef.current, motion)
    addToCart(item.id)
  }

  return (
    /*
     * The card itself stays clickable as a convenience, but the *accessible*
     * affordance is the real <button> on the title. Wrapping the whole card in
     * role="button" hid the favourite and quantity controls from assistive
     * tech, because interactive elements cannot nest inside a button.
     */
    <article className={cls('pcard', line && 'in-cart')} onClick={() => openItem(item.id)}>
      <div className="pcard-media">
        <Img item={item} />
        <span className="pcard-shade" aria-hidden />

        <div className="pcard-chips">
          <span className="chip chip-rate">
            <StarIcon size={11} /> {item.rating}
          </span>
          {item.popular && <span className="chip chip-pop">Popular</span>}
          {cat && <span className="chip pcard-cat">{cat.label}</span>}
        </div>

        <button
          className={cls('fav', faved && 'on')}
          onClick={e => {
            e.stopPropagation()
            toggleFav(item.id)
          }}
          aria-label={faved ? `Remove ${item.name} from favorites` : `Save ${item.name} to favorites`}
          aria-pressed={faved}
        >
          <HeartIcon size={16} filled={faved} />
        </button>

        <div className="pcard-buy" onClick={e => e.stopPropagation()}>
          {line ? (
            <div className="stepper" role="group" aria-label={`Quantity of ${item.name}`}>
              <button onClick={() => setQty(item.id, line.qty - 1)} aria-label={`One less ${item.name}`}>
                −
              </button>
              <span aria-live="polite">{line.qty}</span>
              <button onClick={() => setQty(item.id, line.qty + 1)} aria-label={`One more ${item.name}`}>
                +
              </button>
            </div>
          ) : (
            <button
              className="quick-add"
              ref={addRef}
              onClick={add}
              aria-label={`Add ${item.name} to cart`}
            >
              <PlusIcon size={17} />
              <span className="quick-add-label">Add</span>
            </button>
          )}
        </div>
      </div>

      <div className="pcard-body">
        <h3>
          <button
            className="pcard-title"
            onClick={e => {
              e.stopPropagation()
              openItem(item.id)
            }}
          >
            {item.name}
          </button>
        </h3>
        <p className="pcard-meta">
          {item.unit ?? (item.kcal ? `${item.kcal} kcal` : item.time ?? 'Fresh today')}
          {item.time && item.unit && <span className="pcard-rev">· {item.time}</span>}
        </p>
        <div className="pcard-foot">
          <span className="price">{money(item.price, store.currency)}</span>
          {item.reviews > 0 && <span className="pcard-rev">{item.reviews} reviews</span>}
        </div>
      </div>
    </article>
  )
}
