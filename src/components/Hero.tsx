import { useEffect, useState } from 'react'
import { HERO_ITEM, MARQUEE, TICKER } from '../data'
import { useApp } from '../store'
import { greetingLink } from '../lib/whatsapp'
import { bestScore, searchCatalog } from '../lib/search'
import QR from './QR'
import Img from './Img'
import { Arrow, SearchIcon, WAIcon } from './icons'

export default function Hero() {
  const { store, link, go, search, setSearch, items, setCatFilter, table } = useApp()
  const [ti, setTi] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setTi(i => (i + 1) % TICKER.length), 3400)
    return () => clearInterval(t)
  }, [])

  /**
   * Route the hero search to whichever catalog actually has hits, so typing
   * "avocado" lands in the market instead of an empty menu.
   */
  const heroItem = store.heroImg.trim()
    ? { ...HERO_ITEM, img: store.heroImg.trim() }
    : HERO_ITEM

  const doSearch = () => {
    setCatFilter(null)
    const menu = searchCatalog(items, 'menu', search).primary
    const market = searchCatalog(items, 'grocery', search).primary
    // Route by match *strength*, not count: an exact product name in the market
    // beats an incidental mention of that word in a menu description.
    go(bestScore(market, search) > bestScore(menu, search) ? 'grocery' : 'menu')
  }

  return (
    <section className="hero">
      <div className="hero-glow" aria-hidden />
      <div className="wrap hero-in">
        <div className="hero-copy">
          <span className="eyebrow">
            <span className="dot-live" aria-hidden />
            {table
              ? `Table ${table} · ${store.name}`
              : store.city} · {store.open ? `Open ${store.hours}` : 'Closed now'} · QR &amp; WhatsApp ordering
          </span>
          <h1>
            Scan. Tap.
            <br />
            <span className="grad">Devour.</span>
          </h1>
          <p className="lede">
            Restaurant dishes and daily groceries in one cart. Scan the table QR code and
            your order lands straight on our <b>WhatsApp</b> — no app to install, no
            account to create.
          </p>

          <div className="hero-search" role="search">
            <SearchIcon size={17} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && doSearch()}
              placeholder="Search burgers, sushi, avocados…"
              aria-label="Search the menu"
            />
            <button className="btn btn-primary btn-sm" onClick={doSearch}>
              Search
            </button>
          </div>

          <div className="hero-ctas">
            <button className="btn btn-primary" onClick={() => go('menu')}>
              Browse the menu <Arrow size={15} />
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
            <div>
              <b>{store.stats.rating}</b>
              <span>{store.stats.reviews}</span>
            </div>
            <div className="hstat-div" aria-hidden />
            <div>
              <b>{store.stats.delivery}</b>
              <span>average delivery</span>
            </div>
            <div className="hstat-div" aria-hidden />
            <div>
              <b>100%</b>
              <span>QR + WhatsApp</span>
            </div>
          </div>
        </div>

        <div className="hero-art">
          <div className="hero-img">
            <Img item={heroItem} eager className="hero-img-photo" />
            <div className="steam" aria-hidden>
              <i />
              <i />
              <i />
            </div>
            <div className="hero-img-shade" aria-hidden />
          </div>

          <div className="float-card fc-ticker" key={ti}>
            <span className="ticker-dot" aria-hidden />
            <span className="ticker-text">{TICKER[ti]}</span>
            <span className="ticker-time">just now</span>
          </div>

          <div className="float-card fc-qr">
            <div className="fc-qr-frame">
              <QR value={link} size={72} />
            </div>
            <div>
              <b>Scan at our tables</b>
              <span>Order in 30 seconds</span>
            </div>
          </div>

          <div className="float-badge">
            ⏱ <b>25 min</b>
            <span>to your door</span>
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
