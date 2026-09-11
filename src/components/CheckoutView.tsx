import { useEffect, useMemo, useState } from 'react'
import { PAYMENTS, WHEN_OPTIONS } from '../data'
import { useApp } from '../store'
import { cls, load, money, save } from '../lib/util'
import Img from './Img'
import SlideToOrder from './SlideToOrder'
import { Arrow } from './icons'

interface Form {
  name: string
  phone: string
  address: string
  city: string
  note: string
  when: string
  payment: string
  sendWA: boolean
}

const EMPTY_CARD = { number: '', holder: '', exp: '', cvc: '' }

export default function CheckoutView() {
  const { store, cart, byId, subtotal, deliveryFee, total, go, placeOrder, toast, table, setTable } = useApp()
  const saved = useMemo(
    () => load('fb_customer', { name: '', phone: '', address: '', city: store.city }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )
  const [form, setForm] = useState<Form>({
    name: saved.name,
    phone: saved.phone,
    address: saved.address,
    city: saved.city || store.city,
    note: '',
    when: WHEN_OPTIONS[0],
    payment: 'cash',
    sendWA: true,
  })
  const [card, setCard] = useState(EMPTY_CARD)

  useEffect(() => {
    save('fb_customer', {
      name: form.name,
      phone: form.phone,
      address: form.address,
      city: form.city,
    })
  }, [form.name, form.phone, form.address, form.city])

  const lines = cart.map(l => ({ line: l, item: byId(l.id) })).filter(x => x.item)
  const payMeta = PAYMENTS.find(p => p.id === form.payment)
  const cardOk =
    card.number.replace(/\D/g, '').length >= 12 &&
    card.holder.trim().length > 1 &&
    card.exp.trim().length >= 4 &&
    card.cvc.trim().length >= 3
  const dineIn = !!table
  const missing = [
    !form.name.trim() && 'name',
    !form.phone.trim() && 'phone',
    !dineIn && !form.address.trim() && 'address',
    form.payment === 'card' && !cardOk && 'card details',
  ].filter(Boolean) as string[]
  const valid = missing.length === 0

  const set = (k: keyof Form, v: string | boolean) => setForm(f => ({ ...f, [k]: v }))

  const submit = () => {
    const order = placeOrder({
      name: form.name.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      when: form.when,
      payment: payMeta?.label ?? form.payment,
      note: form.note.trim(),
      sendWA: form.sendWA,
      channel: dineIn ? 'table' : 'delivery',
    })
    if (order) {
      toast(`Order ${order.id} placed — ${form.sendWA ? 'sent to WhatsApp' : 'confirmed here'} 🎉`, '🛵')
      go('track')
    }
  }

  if (!store.open) {
    return (
      <div className="wrap page">
        <div className="empty">
          <span className="empty-icon">🔴</span>
          <h3>{store.name} is closed</h3>
          <p>
            We are not taking orders right now. Our hours are {store.hours} —
            your cart is saved, come back then.
          </p>
          <button className="btn btn-primary" onClick={() => go('menu')}>
            Browse the menu <Arrow size={15} />
          </button>
        </div>
      </div>
    )
  }

  if (lines.length === 0) {
    return (
      <div className="wrap page">
        <div className="empty">
          <span className="empty-icon">🛒</span>
          <h3>Nothing to check out</h3>
          <p>Your cart is empty — let’s fix that with something delicious.</p>
          <button className="btn btn-primary" onClick={() => go('menu')}>
            Browse the menu <Arrow size={15} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="wrap page checkout">
      <header className="page-head">
        <div>
          <h2>Checkout</h2>
          <p>
            {store.name} · {store.city} ·{' '}
            {dineIn ? `dine-in at table ${table}` : `delivery in ~${store.stats.delivery}`}
          </p>
        </div>
      </header>

      <div className="checkout-grid">
        <div className="checkout-left">
          <section className="card cform">
            <h3><span className="cnum">1</span> Contact</h3>
            <div className="frow">
              <label>
                <span>Your name</span>
                <input
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  placeholder="Amina T."
                  autoComplete="name"
                />
              </label>
              <label>
                <span>Phone (for the rider)</span>
                <input
                  value={form.phone}
                  onChange={e => set('phone', e.target.value)}
                  placeholder="+1 555 010 2030"
                  inputMode="tel"
                  autoComplete="tel"
                />
              </label>
            </div>
          </section>

          <section className="card cform">
            <h3><span className="cnum">2</span> {dineIn ? 'Your table' : 'Delivery address'}</h3>
            {dineIn ? (
              <div className="table-banner">
                <span className="table-banner-num">🪑 {table}</span>
                <div>
                  <b>Table {table}</b>
                  <span>Eating in — we will bring it over. No delivery fee.</span>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => setTable(null)}>
                  Switch to delivery
                </button>
              </div>
            ) : (
              <label className="flabel">
                <span>Street &amp; apartment</span>
                <input
                  value={form.address}
                  onChange={e => set('address', e.target.value)}
                  placeholder="42 Maple Ave, Apt 3"
                  autoComplete="street-address"
                />
              </label>
            )}
            <div className="frow">
              <label>
                <span>City / area</span>
                <input value={form.city} onChange={e => set('city', e.target.value)} />
              </label>
              <label>
                <span>Note for the kitchen (optional)</span>
                <input
                  value={form.note}
                  onChange={e => set('note', e.target.value)}
                  placeholder="No pickles, extra sauce…"
                />
              </label>
            </div>
            <div className="when-row">
              <span className="when-label">When?</span>
              <div className="chips">
                {WHEN_OPTIONS.map(w => (
                  <button
                    key={w}
                    className={cls('chip-btn', form.when === w && 'on')}
                    onClick={() => set('when', w)}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="card cform">
            <h3><span className="cnum">3</span> Payment</h3>
            <div className="pay-grid">
              {PAYMENTS.map(p => (
                <button
                  key={p.id}
                  className={cls('pay', form.payment === p.id && 'on')}
                  onClick={() => set('payment', p.id)}
                >
                  <span className="pay-icon">{p.icon}</span>
                  <span className="pay-label">{p.label}</span>
                  <span className="pay-hint">{p.hint}</span>
                </button>
              ))}
            </div>

            {form.payment === 'card' && (
              <div className="card-fields">
                <label className="flabel">
                  <span>Card number</span>
                  <input
                    value={card.number}
                    onChange={e => setCard(c => ({ ...c, number: e.target.value }))}
                    placeholder="4242 4242 4242 4242"
                    inputMode="numeric"
                  />
                </label>
                <label className="flabel">
                  <span>Name on card</span>
                  <input
                    value={card.holder}
                    onChange={e => setCard(c => ({ ...c, holder: e.target.value }))}
                    placeholder="A. TALEB"
                  />
                </label>
                <div className="frow">
                  <label>
                    <span>Expiry</span>
                    <input
                      value={card.exp}
                      onChange={e => setCard(c => ({ ...c, exp: e.target.value }))}
                      placeholder="12/28"
                    />
                  </label>
                  <label>
                    <span>CVC</span>
                    <input
                      value={card.cvc}
                      onChange={e => setCard(c => ({ ...c, cvc: e.target.value }))}
                      placeholder="123"
                      inputMode="numeric"
                    />
                  </label>
                </div>
              </div>
            )}

            {form.payment === 'usdt' && (
              <div className="usdt-box">
                <span>⚡ After we confirm on WhatsApp, send to:</span>
                <code>{store.usdt || 'No wallet configured'}</code>
                <span>USDT · TRON (TRC-20) · network fee included</span>
              </div>
            )}
          </section>
        </div>

        <aside className="checkout-right">
          <div className="card summary">
            <h3>Order summary</h3>
            <ul className="summary-lines">
              {lines.map(({ line, item }) => (
                <li key={line.id}>
                  <div className="sl-thumb">
                    <Img item={item!} />
                  </div>
                  <div className="sl-info">
                    <b>{item!.name}</b>
                    <span>× {line.qty}{item!.unit ? ` · ${item!.unit}` : ''}</span>
                  </div>
                  <b>{money(item!.price * line.qty, store.currency)}</b>
                </li>
              ))}
            </ul>
            <div className="drow">
              <span>Subtotal</span>
              <span>{money(subtotal, store.currency)}</span>
            </div>
            <div className="drow">
              <span>{dineIn ? `Table ${table} · dine-in` : 'Delivery'}</span>
              <span className={deliveryFee === 0 ? 'free' : ''}>
                {deliveryFee === 0 ? (dineIn ? 'No delivery' : 'FREE') : money(deliveryFee, store.currency)}
              </span>
            </div>
            <div className="drow drow-total">
              <span>Total</span>
              <span>{money(total, store.currency)}</span>
            </div>

            <label className="switch-row">
              <span>
                <b>Also send to our WhatsApp</b>
                <small>Recommended — we confirm faster 📲</small>
              </span>
              <span
                className={cls('switch', form.sendWA && 'on')}
                role="switch"
                aria-label="Also send this order to the store's WhatsApp"
                aria-checked={form.sendWA}
                tabIndex={0}
                onClick={() => set('sendWA', !form.sendWA)}
                onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && set('sendWA', !form.sendWA)}
              >
                <i />
              </span>
            </label>

            <SlideToOrder onDone={submit} disabled={!valid} />
            {!valid && (
              <p className="slide-hint">
                Almost there — add {missing.join(', ')}.
              </p>
            )}
            <p className="slide-hint subtle">
              Tip: you can also press <b>Enter</b> on the slider to place the order.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
