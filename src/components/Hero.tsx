import { useEffect, useMemo, useState } from 'react'
import { HERO_ITEM, MARQUEE, TICKER } from '../data'
import { useApp } from '../store'
import { greetingLink } from '../lib/whatsapp'
import { bestScore, searchCatalog } from '../lib/search'
import { money } from '../lib/util'
import { useFinePointer, useMotionEnabled, usePointerParallax } from '../lib/motion'
import QR from './QR'
import Img from './Img'
import { Arrow, QrIcon, SearchIcon, SparkIcon, WAIcon } from './icons'

/**
 * The first screen has to answer four questions at once: what is this, is it
 * open, how fast, and why should I keep scrolling. So the composition layers
 * the storefront photo, a live order ticker, the real table QR and the
 * delivery promise — and the whole thing reacts to the pointer.
 */
export default function Hero() {
  const { store, link, go, search, setSearch, items, setCatFilter, table, openItem, addToCart } = useApp()
  const [ti, setTi] = useState(0)
  const [suggestOpen, setSuggestOpen] = useState(false)
  const motion = useMotionEnabled()
  const fine = useFinePointer()
  const live = motion && fine

  const artRef = usePointerParallax<HTMLDivElement>(live)
  const stageRef = usePointerParallax<HTMLElement>(live)

  useEffect(() => {
    const t = setInterval(() => setTi(i => (i + 1) % TICKER.length), 3400)
    return () => clearInterval(t)
  }, [])

  const heroItem = store.heroImg.trim() ? { ...HERO_ITEM, img: store.heroImg.trim() } : HERO_ITEM

  // Floating satellite dishes are real catalog products — tapping one opens
  // the real product sheet.
  const satellites = useMemo(
    () =>
      ['dragon-roll', 'lava-cake']
        .map(id => items.find(i => i.id === id))
        .filter((i): i is NonNullable<typeof i> => !!i && !!i.img),
    [items]
  )

  /**
   * Live suggestions while typing. Ranked by the same scorer the catalogs
   * use, across both kinds, so "avocado" surfaces the market product.
   */
  const suggestions = useMemo(() => {
    const q = search.trim()
    if (q.length < 2) return []
    const menu = searchCatalog(items, 'menu', q).primary
    const market = searchCatalog(items, 'grocery', q).primary
    return [...menu, ...market].slice(0, 5)
  }, [items, search])

  /**
   * Route the hero search to whichever catalog actually has hits, so typing
   * "avocado" lands in the market instead of an empty menu.
   */
  const doSearch = () => {
    setSuggestOpen(false)
    setCatFilter(null)
    const menu = searchCatalog(items, 'menu', search).primary
    const market = searchCatalog(items, 'grocery', search).primary
    // Route by match *strength*, not count: an exact product name in the market
    // beats an incidental mention of that word in a menu description.
    go(bestScore(market, search) > bestScore(menu, search) ? 'grocery' : 'menu')
  }

  return (
    <section className="hero" ref={stageRef}>
      <div className="hero-bg" aria-hidden>
        <span className="hero-spot" />
        <span className="hero-grid" />
      </div>

      <div className="wrap hero-in">
        <div className="hero-copy">
          <span className="eyebrow">
            <span className="dot-live" aria-hidden />
            {table
              ? `Table ${table} · ${store.name}`
              : `${store.city} · ${store.open ? `Open ${store.hours}` : 'Closed now'}`}
            <i aria-hidden>·</i>
            QR &amp; WhatsApp ordering
          </span>

          <h1 className="hero-title">
            <span className="hero-line">
              <span>Scan the table.</span>
            </span>
            <span className="hero-line">
              <span>
                Eat in <span className="hero-accent">minutes</span>
              </span>
            </span>
          </h1>

          <p className="lede">
            Restaurant dishes and daily groceries in one cart. Scan the code on any table or
            shelf and your order lands straight on our <b>WhatsApp</b> — no app to install, no
            account to create.
          </p>

          <div className="hero-search" role="search">
            <SearchIcon size={17} />
            <input
              value={search}
              onChange={e => {
                setSearch(e.target.value)
                setSuggestOpen(true)
              }}
              onFocus={() => setSuggestOpen(true)}
              onBlur={() => window.setTimeout(() => setSuggestOpen(false), 140)}
              onKeyDown={e => {
                if (e.key === 'Enter') doSearch()
                if (e.key === 'Escape') setSuggestOpen(false)
              }}
              placeholder="Search burgers, sushi, avocados…"
              aria-label="Search the menu and the market"
              autoComplete="off"
            />
            <button className="btn btn-primary btn-sm" onClick={doSearch}>
              Search
            </button>

            {suggestOpen && suggestions.length > 0 && (
              <div className="hero-suggest">
                <ul>
                  {suggestions.map(item => (
                    <li key={item.id}>
                      <button
                        className="hero-suggest-row"
                        onClick={() => {
                          addToCart(item.id)
                          setSuggestOpen(false)
                        }}
                      >
                        <span className="hero-suggest-emoji" aria-hidden>
                          {item.emoji}
                        </span>
                        <span className="hero-suggest-name">
                          {item.name}
                          <em>{item.kind === 'grocery' ? 'The Market' : 'Menu'}</em>
                        </span>
                        <span className="hero-suggest-price">{money(item.price, store.currency)}</span>
                      </button>
                    </li>
                  ))}
                </ul>
                <button className="hero-suggest-all" onClick={doSearch}>
                  See every result for “{search.trim()}” <Arrow size={13} />
                </button>
              </div>
            )}
          </div>

          <div className="hero-ctas">
            <button className="btn btn-primary" onClick={() => go('menu')}>
              <SparkIcon size={16} /> Browse the menu
            </button>
            <a
              className="btn btn-wa"
              href={greetingLink(store.whatsapp, store.name)}
              target="_blank"
              rel="noreferrer"
            >
              <WAIcon size={17} /> Order via WhatsApp
            </a>
          </div>

          <div className="hero-stats">
            <div className="hstat">
              <b>{store.stats.rating}</b>
              <span>{store.stats.reviews}</span>
            </div>
            <span className="hstat-div" aria-hidden />
            <div className="hstat">
              <b>{store.stats.delivery}</b>
              <span>average delivery</span>
            </div>
            <span className="hstat-div" aria-hidden />
            <div className="hstat">
              <b>{items.length}</b>
              <span>menu + market items</span>
            </div>
            <span className="hstat-div" aria-hidden />
            <div className="hstat">
              <b>0</b>
              <span>apps to install</span>
            </div>
          </div>
        </div>

        <div className="hero-art" ref={artRef}>
          <span className="hero-orb" aria-hidden />

          <div className="hero-img">
            <Img item={heroItem} eager className="hero-img-photo" />
            <div className="steam" aria-hidden>
              <i />
              <i />
              <i />
            </div>
            <div className="hero-img-shade" aria-hidden />
            <div className="hero-img-tag">
              <span className="hero-img-tag-k">Now serving</span>
              <b>{heroItem.name}</b>
              <span className="hero-img-tag-p">{money(heroItem.price, store.currency)}</span>
            </div>
          </div>

          {satellites.map((item, i) => (
            <button
              key={item.id}
              className={`hero-thumb hero-thumb-${i}`}
              onClick={() => openItem(item.id)}
              aria-label={`Open ${item.name} — ${money(item.price, store.currency)}`}
            >
              <Img item={item} />
              <span className="hero-thumb-meta">
                <b>{item.emoji}</b>
                {money(item.price, store.currency)}
              </span>
            </button>
          ))}

          <div className="float-card fc-ticker" key={ti}>
            <span className="ticker-dot" aria-hidden />
            <span className="ticker-text">{TICKER[ti]}</span>
            <span className="ticker-time">just now</span>
          </div>

          <button
            className="float-card fc-qr"
            onClick={() => go('store')}
            aria-label="See how the table QR ordering works"
          >
            <span className="fc-qr-frame">
              <QR value={link} size={76} />
              <span className="fc-qr-scan" aria-hidden />
            </span>
            <span className="fc-qr-copy">
              <b>
                <QrIcon size={13} /> Scan at our tables
              </b>
              <span>Order in 30 seconds</span>
            </span>
          </button>

          <div className="float-badge">
            <span className="float-badge-k">⏱</span>
            <span>
              <b>{store.stats.delivery}</b>
              <span>to your door</span>
            </span>
          </div>
        </div>
      </div>

      <div className="marquee" aria-hidden>
        <div className="marquee-track">
          {[...MARQUEE, ...MARQUEE, ...MARQUEE].map((m, i) => (
            <span key={i} className="marquee-item">
              {m} <i>✦</i>
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
