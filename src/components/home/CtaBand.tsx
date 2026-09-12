import { useApp } from '../../store'
import { greetingLink } from '../../lib/whatsapp'
import Reveal from '../Reveal'
import { Arrow, WAIcon } from '../icons'

/** The last thing on the page: two ways in, one for eaters, one for owners. */
export default function CtaBand() {
  const { store, go, goOwner } = useApp()

  return (
    <section className="cta-band" aria-labelledby="cta-title">
      <div className="wrap">
        <Reveal className="cta-in">
          <span className="cta-copy">
            <span className="kicker kicker-accent">Ready when you are</span>
            <h2 id="cta-title">Hungry now, or setting up a restaurant?</h2>
            <p>
              Both take about a minute. The menu is live, and the owner dashboard is one tap
              away.
            </p>
          </span>
          <span className="cta-actions">
            <button className="btn btn-primary btn-lg" onClick={() => go('menu')}>
              Order from {store.name} <Arrow size={16} />
            </button>
            <a
              className="btn btn-wa"
              href={greetingLink(store.whatsapp, store.name)}
              target="_blank"
              rel="noreferrer"
            >
              <WAIcon size={17} /> Message us
            </a>
            <button className="btn btn-quiet" onClick={() => goOwner('qr')}>
              I run a restaurant <Arrow size={14} />
            </button>
          </span>
        </Reveal>
      </div>
    </section>
  )
}
