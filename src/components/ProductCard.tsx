import { useApp } from '../store'
import { cls, money } from '../lib/util'
import { CATEGORIES } from '../data'
import type { Item } from '../types'
import Img from './Img'

export default function ProductCard({ item }: { item: Item }) {
  const { cart, addToCart, setQty, favs, toggleFav, openItem, store } = useApp()
  const line = cart.find(l => l.id === item.id)
  const cat = CATEGORIES.find(c => c.id === item.category)

  return (
    /*
     * The card itself stays clickable as a convenience, but the *accessible*
     * affordance is the real <button> on the title. Wrapping the whole card in
     * role="button" hid the favourite and quantity controls from assistive
     * tech, because interactive elements cannot nest inside a button.
     */
    <article className="pcard" onClick={() => openItem(item.id)}>
      <div className="pcard-media">
        <Img item={item} />
        <div className="pcard-chips">
          <span className="chip chip-rate">★ {item.rating}</span>
          {item.popular && <span className="chip chip-pop">🔥 Popular</span>}
        </div>
        <button
          className={cls('fav', favs.includes(item.id) && 'on')}
          onClick={e => {
            e.stopPropagation()
            toggleFav(item.id)
          }}
          aria-label={favs.includes(item.id) ? 'Remove from favorites' : 'Save to favorites'}
        >
          {favs.includes(item.id) ? '♥' : '♡'}
        </button>
        {line ? (
          <div className="stepper" onClick={e => e.stopPropagation()}>
            <button onClick={() => setQty(item.id, line.qty - 1)} aria-label="Less">−</button>
            <span>{line.qty}</span>
            <button onClick={() => setQty(item.id, line.qty + 1)} aria-label="More">+</button>
          </div>
        ) : (
          <button
            className="quick-add"
            onClick={e => {
              e.stopPropagation()
              addToCart(item.id)
            }}
            aria-label={`Add ${item.name} to cart`}
          >
            +
          </button>
        )}
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
          {cat ? `${cat.emoji} ${cat.label}` : ''}
          {item.unit ? ` · ${item.unit}` : ''}
          {item.kcal ? ` · ${item.kcal} kcal` : item.kind === 'grocery' ? ' · Fresh today' : ''}
        </p>
        <div className="pcard-foot">
          <span className="price">{money(item.price, store.currency)}</span>
          {item.reviews > 0 && <span className="pcard-rev">{item.reviews} reviews</span>}
        </div>
      </div>
    </article>
  )
}
