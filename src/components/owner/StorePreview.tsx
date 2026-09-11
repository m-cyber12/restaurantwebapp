import { useApp } from '../../store'
import { money } from '../../lib/util'
import { HERO_ITEM } from '../../data'
import Img from '../Img'

/**
 * Live storefront preview (plan §9). A scaled-down slice of the real home page
 * built from the same config the customer sees, so branding changes are
 * verifiable without leaving the dashboard.
 */
export default function StorePreview() {
  const { store, items } = useApp()
  const heroItem = store.heroImg.trim() ? { ...HERO_ITEM, img: store.heroImg.trim() } : HERO_ITEM
  const featured = items.filter(i => i.featured || i.popular).slice(0, 3)

  return (
    <div className="preview" aria-label="Live storefront preview">
      <div className="preview-bar">
        <span className="preview-dots" aria-hidden><i /><i /><i /></span>
        <span className="preview-url">/?store={store.slug}</span>
      </div>
      <div className="preview-body">
        <div className="preview-nav">
          <span className="preview-brand">
            <span className="preview-mark">{store.emoji}</span>
            <span>
              <b>{store.name}</b>
              <em>{store.city} · {store.open ? `Open ${store.hours}` : 'Closed'}</em>
            </span>
          </span>
          <span className="preview-wa">WhatsApp</span>
        </div>

        <div className="preview-hero">
          <div className="preview-copy">
            <span className="eyebrow">{store.city} · QR &amp; WhatsApp ordering</span>
            <h4>{store.name}</h4>
            <p>{store.tagline}</p>
            <div className="preview-stats">
              <span><b>{store.stats.rating}</b> {store.stats.reviews}</span>
              <span><b>{store.stats.delivery}</b> delivery</span>
            </div>
            <div className="preview-ctas">
              <span className="preview-btn primary">Browse the menu</span>
              <span className="preview-btn wa">Order via WhatsApp</span>
            </div>
          </div>
          <div className="preview-art">
            <Img item={heroItem} eager />
          </div>
        </div>

        {featured.length > 0 && (
          <div className="preview-rail">
            {featured.map(i => (
              <span key={i.id} className="preview-card">
                <b>{i.emoji}</b>
                <em>{i.name}</em>
                <span>{money(i.price, store.currency)}</span>
              </span>
            ))}
          </div>
        )}

        <div className="preview-foot">
          Delivery {money(store.fee, store.currency)} · free over {money(store.freeAt, store.currency)}
        </div>
      </div>
    </div>
  )
}
