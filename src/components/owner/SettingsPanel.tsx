import { useState } from 'react'
import { CURRENCIES } from '../../data'
import { useApp } from '../../store'
import { cls, slugify } from '../../lib/util'

export default function SettingsPanel() {
  const { store, setStore, toast, scanned } = useApp()
  const [err, setErr] = useState<string | null>(null)

  const set = (patch: Partial<typeof store>) => {
    setErr(null)
    setStore({ ...store, ...patch })
  }

  const setNum = (key: 'fee' | 'freeAt', raw: string) => {
    const n = parseFloat(raw)
    if (raw === '') return set({ [key]: 0 } as never)
    if (!Number.isFinite(n) || n < 0) return setErr(`${key === 'fee' ? 'Delivery fee' : 'Free-delivery threshold'} must be a positive number.`)
    if (n > 100_000) return setErr('That number looks too high — check it.')
    set({ [key]: Math.round(n * 100) / 100 } as never)
  }

  const waError =
    store.whatsapp.replace(/\D/g, '').length > 0 && store.whatsapp.replace(/\D/g, '').length < 8
      ? 'A WhatsApp number needs its country code and at least 8 digits.'
      : null

  const slug = slugify(store.name || '')

  return (
    <div className="owner-settings">
      {scanned && (
        <p className="owner-note warn">
          ℹ️ You opened this page from a scanned QR, so changes apply to this
          session only — open the app without <code>?store=</code> in the address
          bar to edit your own saved store.
        </p>
      )}

      <section className="card">
        <h3 className="card-h">Identity</h3>
        <div className="frow">
          <label className="flabel">
            <span>Store name</span>
            <input
              value={store.name}
              onChange={e => set({ name: e.target.value.slice(0, 60) })}
              placeholder="Fresh Bites"
              maxLength={60}
              required
            />
          </label>
          <label className="flabel">
            <span>Tagline</span>
            <input
              value={store.tagline}
              onChange={e => set({ tagline: e.target.value.slice(0, 60) })}
              placeholder="Kitchen + market, delivered"
              maxLength={60}
            />
          </label>
        </div>
        <p className="card-sub">
          Public link: <code>/?store={slug || 'my-store'}</code>
        </p>
      </section>

      <section className="card">
        <h3 className="card-h">Contact</h3>
        <div className="frow">
          <label className="flabel">
            <span>WhatsApp number (with country code)</span>
            <input
              value={store.whatsapp}
              onChange={e => set({ whatsapp: e.target.value.replace(/[^\d+]/g, '').slice(0, 20) })}
              placeholder="15551234567"
              inputMode="tel"
              aria-invalid={!!waError}
            />
          </label>
          <label className="flabel">
            <span>City / area</span>
            <input
              value={store.city}
              onChange={e => set({ city: e.target.value.slice(0, 40) })}
              maxLength={40}
            />
          </label>
        </div>
        <label className="flabel">
          <span>Street address</span>
          <input
            value={store.address}
            onChange={e => set({ address: e.target.value.slice(0, 80) })}
            placeholder="12 Market Street"
            maxLength={80}
            autoComplete="street-address"
          />
        </label>
        {waError && (
          <p className="form-error" role="alert">
            {waError}
          </p>
        )}
      </section>

      <section className="card">
        <h3 className="card-h">Hours &amp; availability</h3>
        <div className="frow">
          <label className="flabel">
            <span>Opening hours (shown to customers)</span>
            <input
              value={store.hours}
              onChange={e => set({ hours: e.target.value.slice(0, 32) })}
              placeholder="11:00 – 23:00"
              maxLength={32}
            />
          </label>
          <label className="switch-row switch-row-lg">
            <span>
              <b>Store open</b>
              <small>{store.open ? 'Customers can order right now' : 'Ordering is paused at checkout'}</small>
            </span>
            <span
              className={cls('switch', store.open && 'on')}
              role="switch"
              aria-label="Store open"
              aria-checked={store.open}
              tabIndex={0}
              onClick={() => {
                set({ open: !store.open })
                toast(!store.open ? 'Store is open' : 'Store closed — ordering paused', !store.open ? '🟢' : '🔴')
              }}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  set({ open: !store.open })
                }
              }}
            >
              <i />
            </span>
          </label>
        </div>
      </section>

      <section className="card">
        <h3 className="card-h">Delivery &amp; pricing</h3>
        <div className="frow">
          <label className="flabel">
            <span>Delivery fee</span>
            <input
              type="number"
              min="0"
              step="any"
              value={store.fee}
              onChange={e => setNum('fee', e.target.value)}
              inputMode="decimal"
            />
          </label>
          <label className="flabel">
            <span>Free delivery over</span>
            <input
              type="number"
              min="0"
              step="any"
              value={store.freeAt}
              onChange={e => setNum('freeAt', e.target.value)}
              inputMode="decimal"
            />
          </label>
          <label className="flabel">
            <span>Currency</span>
            <select value={store.currency} onChange={e => set({ currency: e.target.value })}>
              {CURRENCIES.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        </div>
        {store.freeAt > 0 && store.fee > store.freeAt && (
          <p className="form-error" role="alert">
            The delivery fee is higher than the free-delivery threshold — that is
            usually a typo.
          </p>
        )}
        {err && (
          <p className="form-error" role="alert">
            {err}
          </p>
        )}
      </section>

      <section className="card">
        <h3 className="card-h">USDT wallet (optional)</h3>
        <label className="flabel">
          <span>TRC-20 address</span>
          <input
            value={store.usdt}
            onChange={e => set({ usdt: e.target.value.trim().slice(0, 64) })}
            placeholder="T…"
            maxLength={64}
          />
        </label>
        <p className="card-sub">
          Shown at checkout only when a customer picks USDT. Clear it to hide that
          payment method from the footer.
        </p>
      </section>
    </div>
  )
}
