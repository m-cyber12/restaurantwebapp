import { useState } from 'react'
import { ACCENTS, EMOJIS } from '../../data'
import { useApp } from '../../store'
import { cls } from '../../lib/util'
import StorePreview from './StorePreview'

export default function AppearancePanel() {
  const { store, setStore, toast } = useApp()
  const [heroDraft, setHeroDraft] = useState(store.heroImg)
  const [heroErr, setHeroErr] = useState<string | null>(null)

  const set = (patch: Partial<typeof store>) => setStore({ ...store, ...patch })

  const applyHero = () => {
    const url = heroDraft.trim()
    if (url && !/^https?:\/\//i.test(url)) {
      setHeroErr('Enter a full image URL starting with http:// or https://')
      return
    }
    setHeroErr(null)
    set({ heroImg: url })
    toast(url ? 'Hero image updated' : 'Back to the default hero image', '🖼️')
  }

  return (
    <div className="appearance-grid">
      <div className="appearance-controls">
        <section className="card">
          <h3 className="card-h">Logo</h3>
          <div className="chip-btns">
            {EMOJIS.map(e => (
              <button
                key={e}
                className={cls('emoji-pick', store.emoji === e && 'on')}
                onClick={() => set({ emoji: e })}
                aria-label={`Use ${e} as the logo`}
                aria-pressed={store.emoji === e}
              >
                {e}
              </button>
            ))}
          </div>
        </section>

        <section className="card">
          <h3 className="card-h">Accent colour</h3>
          <div className="chip-btns">
            {ACCENTS.map(a => (
              <button
                key={a.c}
                className={cls('swatch', store.accent === a.c && 'on')}
                style={{ background: a.c }}
                onClick={() => set({ accent: a.c })}
                title={a.name}
                aria-label={`Accent ${a.name}`}
                aria-pressed={store.accent === a.c}
              />
            ))}
            <label className="swatch-custom">
              <input
                type="color"
                value={/^#[0-9a-f]{6}$/i.test(store.accent) ? store.accent : '#ff6a2b'}
                onChange={e => set({ accent: e.target.value })}
                aria-label="Custom accent colour"
              />
              <span>Custom</span>
            </label>
          </div>
        </section>

        <section className="card">
          <h3 className="card-h">Hero image</h3>
          <label className="flabel">
            <span>Image URL</span>
            <input
              value={heroDraft}
              onChange={e => setHeroDraft(e.target.value)}
              placeholder="https://…/hero.jpg"
              inputMode="url"
            />
          </label>
          <div className="btn-row">
            <button className="btn btn-primary btn-sm" onClick={applyHero}>
              Apply
            </button>
            {store.heroImg && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setHeroDraft('')
                  set({ heroImg: '' })
                  toast('Back to the default hero image', '🖼️')
                }}
              >
                Reset
              </button>
            )}
          </div>
          {heroErr && (
            <p className="form-error" role="alert">
              {heroErr}
            </p>
          )}
          <p className="card-sub">
            Leave it empty to keep the built-in photograph.
          </p>
        </section>

        <section className="card">
          <h3 className="card-h">Headline numbers</h3>
          <p className="card-sub">
            Shown on the home hero. These are demo figures — replace them with
            your own once you have them.
          </p>
          <div className="frow">
            <label className="flabel">
              <span>Rating</span>
              <input
                value={store.stats.rating}
                onChange={e => set({ stats: { ...store.stats, rating: e.target.value.slice(0, 12) } })}
                maxLength={12}
              />
            </label>
            <label className="flabel">
              <span>Reviews</span>
              <input
                value={store.stats.reviews}
                onChange={e => set({ stats: { ...store.stats, reviews: e.target.value.slice(0, 24) } })}
                maxLength={24}
              />
            </label>
            <label className="flabel">
              <span>Average delivery</span>
              <input
                value={store.stats.delivery}
                onChange={e => set({ stats: { ...store.stats, delivery: e.target.value.slice(0, 12) } })}
                maxLength={12}
              />
            </label>
          </div>
        </section>
      </div>

      <div className="appearance-preview">
        <h3 className="card-h">Store preview</h3>
        <StorePreview />
        <p className="card-sub">
          This is your live storefront configuration — the same values a
          customer sees when they scan your QR.
        </p>
      </div>
    </div>
  )
}
