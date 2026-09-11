import { CATEGORIES, REVIEWS } from '../data'
import { useApp } from '../store'
import Hero from './Hero'
import QR from './QR'
import ProductCard from './ProductCard'
import { Arrow, WAIcon } from './icons'

export default function Home() {
  const { items, go, setCatFilter, setSearch, store, link } = useApp()
  const popular = items.filter(i => i.popular && i.kind === 'menu').slice(0, 4)
  const grocery = items.filter(i => i.kind === 'grocery')
  const menuCats = CATEGORIES.filter(c => c.kind === 'menu')
  const groceryCats = CATEGORIES.filter(c => c.kind === 'grocery')

  const pickCat = (catId: string, kind: 'menu' | 'grocery') => {
    setSearch('')
    setCatFilter(catId)
    go(kind)
  }

  return (
    <>
      <Hero />

      <div className="wrap home">
        {/* ── Categories ─────────────────────────────────────── */}
        <section className="section">
          <div className="section-head">
            <h2>Tonight</h2>
            <button className="link" onClick={() => { setSearch(''); setCatFilter(null); go('menu') }}>
              Full menu <Arrow size={14} />
            </button>
          </div>
          <div className="catrow">
            {menuCats.map(c => {
              const count = items.filter(i => i.kind === 'menu' && i.category === c.id).length
              return (
                <button key={c.id} className="cat" onClick={() => pickCat(c.id, 'menu')}>
                  <span className="cat-emoji">{c.emoji}</span>
                  <span className="cat-label">{c.label}</span>
                  <span className="cat-count">{count}</span>
                </button>
              )
            })}
          </div>
        </section>

        {/* ── Popular picks ──────────────────────────────────── */}
        <section className="section">
          <div className="section-head">
            <h2>Popular picks</h2>
            <button className="link" onClick={() => { setSearch(''); setCatFilter(null); go('menu') }}>
              View all <Arrow size={14} />
            </button>
          </div>
          <div className="grid grid-4">
            {popular.map(i => (
              <ProductCard key={i.id} item={i} />
            ))}
          </div>
        </section>

        {/* ── The Market ─────────────────────────────────────── */}
        <section className="section">
          <div className="section-head">
            <div>
              <h2>The Market <span className="h2-badge">fresh daily</span></h2>
              <p className="section-sub">Produce, bakery, butcher &amp; pantry — picked fresh this morning.</p>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setCatFilter(null); go('grocery') }}>
              Shop groceries <Arrow size={14} />
            </button>
          </div>
          <div className="catrow">
            {groceryCats.map(c => (
              <button key={c.id} className="cat" onClick={() => pickCat(c.id, 'grocery')}>
                <span className="cat-emoji">{c.emoji}</span>
                <span className="cat-label">{c.label}</span>
              </button>
            ))}
          </div>
          <div className="hscroll">
            {grocery.slice(0, 8).map(i => (
              <div key={i.id} className="hscroll-item">
                <ProductCard item={i} />
              </div>
            ))}
          </div>
        </section>

        {/* ── How it works ───────────────────────────────────── */}
        <section className="section">
          <div className="section-head">
            <h2>How it works</h2>
          </div>
          <div className="steps">
            <div className="step">
              <span className="step-num">1</span>
              <span className="step-icon">📲</span>
              <h3>Scan the QR</h3>
              <p>Find our code on any table, shelf or sign. Your camera opens this menu instantly — no app, no sign-up.</p>
            </div>
            <div className="step">
              <span className="step-num">2</span>
              <span className="step-icon">🛒</span>
              <h3>Build your cart</h3>
              <p>Mix restaurant dishes and groceries in one cart. Tap, add, adjust — your total updates live.</p>
            </div>
            <div className="step step-wa">
              <span className="step-num">3</span>
              <span className="step-icon"><WAIcon size={26} /></span>
              <h3>We get it on WhatsApp</h3>
              <p>Your order arrives in our WhatsApp chat, neatly formatted. We confirm, and it's on its way. 🛵</p>
            </div>
          </div>
        </section>

        {/* ── For owners ─────────────────────────────────────── */}
        <section className="section">
          <div className="owners">
            <div className="owners-copy">
              <span className="eyebrow">For restaurant &amp; shop owners</span>
              <h2>Your menu, on every table.</h2>
              <p>
                Print the QR code, stick it on your tables and shelves. Customers scan, browse
                and order — and every single order lands on <b>your</b> WhatsApp, perfectly
                formatted.
              </p>
              <ul className="owners-list">
                <li><b>No app for customers</b> — it runs in their camera &amp; browser</li>
                <li><b>Orders on your WhatsApp</b> — clean, itemized, ready to confirm</li>
                <li><b>Live order tracking</b> — every customer sees the journey to their door</li>
                <li><b>Your brand, your rules</b> — your name, your prices, your WhatsApp</li>
              </ul>
              <button className="btn btn-primary" onClick={() => go('store')}>
                Set up your store <Arrow size={15} />
              </button>
            </div>
            <div className="owners-qr">
              <div className="owners-qr-card">
                <QR value={link} size={150} />
                <div className="owners-qr-meta">
                  <b>{store.name}</b>
                  <span>Scan · Order · Eat</span>
                </div>
              </div>
              <span className="owners-qr-tag">your code · your WhatsApp</span>
            </div>
          </div>
        </section>

        {/* ── Reviews ────────────────────────────────────────── */}
        <section className="section">
          <div className="section-head">
            <h2>People are raving</h2>
          </div>
          <div className="reviews">
            {REVIEWS.map(r => (
              <figure key={r.name} className="review">
                <div className="review-stars" aria-label={`${r.stars} stars`}>
                  {'★'.repeat(r.stars)}
                </div>
                <blockquote>“{r.text}”</blockquote>
                <figcaption>
                  <span className="review-avatar">{r.avatar}</span>
                  {r.name}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}
