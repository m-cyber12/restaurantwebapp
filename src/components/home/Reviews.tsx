import { REVIEWS } from '../../data'
import { useApp } from '../../store'
import Reveal from '../Reveal'
import { StarIcon } from '../icons'

/**
 * Social proof on paper. The whole section flips to the light token set, which
 * is what breaks the dark rhythm of the page and makes the quotes read like
 * editorial rather than another card grid.
 */
export default function Reviews() {
  const { store } = useApp()

  return (
    <section className="paper-surface reviews-band" aria-labelledby="reviews-title">
      <div className="wrap">
        <Reveal className="reviews-head">
          <span className="kicker">Word of mouth</span>
          <h2 id="reviews-title">
            People are raving about <span className="reviews-accent">{store.name}</span>
          </h2>
        </Reveal>

        <div className="reviews">
          {REVIEWS.map((r, i) => (
            <Reveal as="figure" key={r.name} delay={i * 110} className={`review review-${i}`}>
              <span className="review-stars" aria-label={`${r.stars} out of 5 stars`}>
                {Array.from({ length: r.stars }).map((_, s) => (
                  <StarIcon key={s} size={13} />
                ))}
              </span>
              <blockquote>“{r.text}”</blockquote>
              <figcaption>
                <span className="review-avatar" aria-hidden>
                  {r.avatar}
                </span>
                <span>
                  <b>{r.name}</b>
                  <em>{i === 2 ? 'Verified owner' : 'Verified customer'}</em>
                </span>
              </figcaption>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
