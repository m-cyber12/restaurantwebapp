import { CATEGORIES } from '../../data'
import { useApp } from '../../store'
import Hero from '../Hero'
import ProductCard from '../ProductCard'
import Reveal from '../Reveal'
import ScanStory from './ScanStory'
import Journey from './Journey'
import OwnersBand from './OwnersBand'
import Reviews from './Reviews'
import CtaBand from './CtaBand'
import { Arrow, BasketIcon } from '../icons'

/**
 * The home page is a journey, not a stack of card grids:
 *
 *   hero → tonight's categories → popular picks → the market (paper)
 *   → the scan story (sticky) → the delivery journey → owners → reviews → CTA
 *
 * Section rhythm alternates dense / visual / interactive / editorial so the
 * page never settles into "title, cards, title, cards".
 */
export default function Home() {
  const { items, go, setCatFilter, setSearch } = useApp()

  // Owner-pinned products come first, then the built-in popular flags.
  const popular = items
    .filter(i => i.kind === 'menu' && (i.featured || i.popular))
    .sort((a, b) => Number(!!b.featured) - Number(!!a.featured))
    .slice(0, 4)
  const grocery = items.filter(i => i.kind === 'grocery')
  const menuCats = CATEGORIES.filter(c => c.kind === 'menu')
  const groceryCats = CATEGORIES.filter(c => c.kind === 'grocery')

  const pickCat = (catId: string, kind: 'menu' | 'grocery') => {
    setSearch('')
    setCatFilter(catId)
    go(kind)
  }

  const openCatalog = (kind: 'menu' | 'grocery') => {
    setSearch('')
    setCatFilter(null)
    go(kind)
  }

  return (
    <>
      <Hero />

      <div className="wrap home">
        {/* ── 0 · Tonight ─────────────────────────────────────── */}
        <section className="section" aria-labelledby="tonight-title">
          <Reveal className="section-head">
            <div>
              <span className="kicker">Kitchen open now</span>
              <h2 id="tonight-title">What are you in the mood for?</h2>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => openCatalog('menu')}>
              Full menu <Arrow size={14} />
            </button>
          </Reveal>

          <div className="catrow">
            {menuCats.map((c, i) => {
              const count = items.filter(i2 => i2.kind === 'menu' && i2.category === c.id).length
              return (
                <Reveal key={c.id} delay={i * 55} className="cat-cell-wrap">
                  <button className="cat" onClick={() => pickCat(c.id, 'menu')}>
                    <span className="cat-emoji" aria-hidden>
                      {c.emoji}
                    </span>
                    <span className="cat-label">{c.label}</span>
                    <span className="cat-count">{count} items</span>
                    <span className="cat-go" aria-hidden>
                      <Arrow size={14} />
                    </span>
                  </button>
                </Reveal>
              )
            })}
          </div>
        </section>

        {/* ── 1 · Popular picks ───────────────────────────────── */}
        <section className="section" aria-labelledby="popular-title">
          <Reveal className="section-head">
            <div>
              <span className="kicker kicker-accent">Ordered most this week</span>
              <h2 id="popular-title">Popular picks</h2>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => openCatalog('menu')}>
              View all <Arrow size={14} />
            </button>
          </Reveal>

          <div className="grid grid-4">
            {popular.map((i, idx) => (
              <Reveal key={i.id} delay={idx * 70}>
                <ProductCard item={i} />
              </Reveal>
            ))}
          </div>
        </section>
      </div>

      {/* ── The Market (paper section) ────────────────────────── */}
      <section className="paper-surface market-band" aria-labelledby="market-title">
        <div className="wrap">
          <Reveal className="section-head">
            <div>
              <span className="kicker">
                <BasketIcon size={14} /> The Market · fresh daily
              </span>
              <h2 id="market-title">Dinner and the weekly shop, one cart.</h2>
              <p className="section-sub">
                Produce, bakery, butcher and pantry — picked this morning, delivered with your
                order.
              </p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => openCatalog('grocery')}>
              Shop groceries <Arrow size={14} />
            </button>
          </Reveal>

          <Reveal className="catrow catrow-market" variant="fade">
            {groceryCats.map(c => (
              <button key={c.id} className="cat cat-sm" onClick={() => pickCat(c.id, 'grocery')}>
                <span className="cat-emoji" aria-hidden>
                  {c.emoji}
                </span>
                <span className="cat-label">{c.label}</span>
              </button>
            ))}
          </Reveal>

          <div className="hscroll" role="list">
            {grocery.slice(0, 8).map((i, idx) => (
              <Reveal key={i.id} className="hscroll-item" delay={idx * 55} variant="right">
                <ProductCard item={i} />
              </Reveal>
            ))}
          </div>
          <p className="hscroll-hint">Scroll sideways — or open the market for everything.</p>
        </div>
      </section>

      <ScanStory />
      <Journey />
      <OwnersBand />
      <Reviews />
      <CtaBand />
    </>
  )
}
