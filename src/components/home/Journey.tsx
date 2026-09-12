import { STAGES } from '../../lib/order'
import { useApp } from '../../store'
import { useElementProgress, useMotionEnabled } from '../../lib/motion'
import Reveal from '../Reveal'
import { ClockIcon, ScooterIcon } from '../icons'

const NOTES = [
  'The moment you slide to order — the kitchen sees it instantly.',
  'A human confirms on WhatsApp. Usually within a minute.',
  'Your dish is on the pass. You can watch the status move.',
  'Bagged, checked and handed to the rider. Table orders walk over.',
  'At the door, or on your table. That is the whole journey.',
]

/**
 * "From table to door." The same five nodes the tracking page uses, drawn as
 * a line that fills as the section scrolls through the viewport — so the
 * customer learns the vocabulary of the tracker before they ever need it.
 */
export default function Journey() {
  const { store } = useApp()
  const motion = useMotionEnabled()
  const [ref, progress] = useElementProgress<HTMLDivElement>(motion)
  const lit = Math.min(STAGES.length - 1, Math.floor(progress * STAGES.length * 1.05))

  return (
    <section className="journey" aria-labelledby="journey-title">
      <div className="wrap">
        <Reveal className="journey-head">
          <span className="kicker">
            <ScooterIcon size={14} /> The journey
          </span>
          <h2 id="journey-title">From table to door, in five honest steps.</h2>
          <p className="journey-lede">
            Every order you place gets its own live timeline. No guessing, no “we’ll text you”.
          </p>
        </Reveal>

        <div className="journey-track" ref={ref}>
          <span className="journey-line" aria-hidden>
            <i style={{ transform: `scaleX(${progress})` }} />
          </span>

          <ol className="journey-nodes">
            {STAGES.map((s, i) => (
              <Reveal as="li" key={s.key} delay={i * 90} className="jnode-wrap">
                <div className={`jnode ${i <= lit ? 'lit' : ''}`}>
                  <span className="jnode-icon" aria-hidden>
                    {s.icon}
                  </span>
                  <span className="jnode-k">{String(i + 1).padStart(2, '0')}</span>
                  <h3>{s.label}</h3>
                  <p>{NOTES[i]}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>

        <Reveal className="journey-foot" variant="fade">
          <span className="journey-foot-item">
            <ClockIcon size={15} /> Average {store.stats.delivery} end to end
          </span>
          <span className="journey-foot-item">
            <ScooterIcon size={15} /> Free delivery over{' '}
            {store.currency === 'USDT' ? `USDT ${store.freeAt}` : `${store.currency}${store.freeAt}`}
          </span>
        </Reveal>
      </div>
    </section>
  )
}
