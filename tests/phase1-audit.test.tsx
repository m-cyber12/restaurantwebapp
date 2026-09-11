/**
 * Phase 1 — FULL AUDIT
 * Exercises every flow the improvement plan lists as P0, against the
 * *current* code, and records what works / what is broken.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, within, act } from '@testing-library/react'
import App from '../src/App'
import { CATALOG } from '../src/data'
import { buildOrderMessage, waLink, waDigits } from '../src/lib/whatsapp'
import { money } from '../src/lib/util'
import type { Order, StoreConfig } from '../src/types'

const $ = (sel: string) => document.querySelector(sel)
const $$ = (sel: string) => Array.from(document.querySelectorAll(sel))

function renderApp(url = 'http://localhost:3000/') {
  window.history.replaceState({}, '', url)
  return render(<App />)
}

const btn = (name: RegExp | string) => screen.getByRole('button', { name })
const allBtn = (name: RegExp | string) => screen.getAllByRole('button', { name })
/** The desktop tab bar (the brand button is also labelled "Home"). */
const topBtn = (name: RegExp | string) =>
  within($('.tabs') as HTMLElement).getByRole('button', { name })

/** SlideToOrder fires onDone on a 320ms timer — wait for it to land. */
const settle = () => act(async () => { await new Promise(r => setTimeout(r, 400)) })

describe('P0-1 · Navigation: every nav target resolves to a real view', () => {
  it('renders the home view and all top-nav tabs', () => {
    renderApp()
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    for (const label of ['Home', 'Menu', 'Grocery', 'Track order', 'For owners']) {
      expect(screen.getAllByRole('button', { name: new RegExp(label, 'i') }).length).toBeGreaterThan(0)
    }
  })

  it('navigates to each view via top nav', () => {
    renderApp()
    fireEvent.click(topBtn(/^Menu$/))
    expect(screen.getByRole('heading', { level: 2, name: /Menu/i })).toBeInTheDocument()
    fireEvent.click(topBtn(/^Grocery$/))
    expect($('.page-head h2')!.textContent).toBe('The Market')
    fireEvent.click(topBtn(/^Track order$/))
    expect(screen.getByRole('heading', { name: /Track your order|No orders yet/i })).toBeInTheDocument()
    fireEvent.click(topBtn(/^For owners$/))
    expect(screen.getByText(/Put your menu on every table/i)).toBeInTheDocument()
  })

  it('unknown hash routes fall back to home (no blank screen)', () => {
    renderApp('http://localhost:3000/#/does-not-exist')
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('deep-linking to #/checkout, #/track, #/store works on cold load', () => {
    renderApp('http://localhost:3000/#/checkout')
    expect(screen.getByText(/Nothing to check out|Checkout/i)).toBeInTheDocument()
  })

  it('has no <a href> pointing at a dead route', () => {
    renderApp()
    const hrefs = $$('a[href]').map(a => a.getAttribute('href')!)
    const internal = hrefs.filter(h => h.startsWith('/') || h.startsWith('#'))
    // every internal link must either be a hash route we know or a real path
    const known = ['#/', '#/menu', '#/grocery', '#/checkout', '#/track', '#/store']
    for (const h of internal) {
      const clean = h.replace(/^#\/?/, '')
      expect(
        [''].concat(known.map(k => k.replace('#/', ''))).includes(h === '#/' ? '' : clean)
      ).toBe(true)
    }
  })
})

describe('P0-3 · Cart functionality', () => {
  it('adds a product from the catalog card', () => {
    renderApp('http://localhost:3000/#/menu')
    const addBtns = $$('button.quick-add')
    expect(addBtns.length).toBeGreaterThan(0)
    fireEvent.click(addBtns[0])
    expect(localStorage.getItem('fb_cart')).toContain('qty')
  })

  it('quantity stepper increases, decreases and removes at zero', () => {
    renderApp('http://localhost:3000/#/menu')
    fireEvent.click($$('button.quick-add')[0])
    const stepper = $('.stepper')!
    const [minus, plus] = Array.from(stepper.querySelectorAll('button'))
    fireEvent.click(plus)
    let cart = JSON.parse(localStorage.getItem('fb_cart')!)
    expect(cart[0].qty).toBe(2)
    fireEvent.click(minus)
    cart = JSON.parse(localStorage.getItem('fb_cart')!)
    expect(cart[0].qty).toBe(1)
    fireEvent.click(minus)
    cart = JSON.parse(localStorage.getItem('fb_cart')!)
    expect(cart.length).toBe(0)
  })

  it('drawer opens, clears cart, and shows the empty state', () => {
    renderApp('http://localhost:3000/#/menu')
    fireEvent.click($$('button.quick-add')[0])
    fireEvent.click(screen.getByRole('button', { name: /Open cart/i }))
    const drawer = $('.drawer')!
    expect(within(drawer as HTMLElement).getByText('Your cart')).toBeInTheDocument()
    fireEvent.click(within(drawer as HTMLElement).getByText('Clear cart'))
    expect(JSON.parse(localStorage.getItem('fb_cart')!)).toEqual([])
    expect(within(drawer as HTMLElement).getByText(/Your cart is hungry/i)).toBeInTheDocument()
  })

  it('subtotal / delivery fee / free-delivery threshold are exact (no FP drift)', () => {
    // 12.90 + 11.50 = 24.40 ; threshold 30 ; fee 2.99
    renderApp('http://localhost:3000/#/menu')
    const cards = $$('article.pcard')
    fireEvent.click(within(cards[0] as HTMLElement).getByRole('button', { name: /Add .* to cart/ }))
    fireEvent.click(within(cards[1] as HTMLElement).getByRole('button', { name: /Add .* to cart/ }))
    fireEvent.click(screen.getByRole('button', { name: /Open cart/i }))
    const drawer = $('.drawer') as HTMLElement
    const rows = within(drawer).getAllByText(/Subtotal|Delivery|Total/)
    expect(rows.length).toBe(3)
    const drawerText = drawer.textContent!
    expect(drawerText).toContain('$24.40')
    expect(drawerText).toContain('$2.99')
    // total must be exactly 27.39
    expect(drawerText).toContain('$27.39')
    // and never a float artifact like 27.389999999999997
    expect(drawerText).not.toMatch(/\$\d+\.\d{3,}/)
  })

  it('free delivery kicks in at the threshold', () => {
    renderApp('http://localhost:3000/#/menu')
    // add enough of the first item (12.90) to cross 30
    const card = $$('article.pcard')[0] as HTMLElement
    const addBtn = within(card).getByRole('button', { name: /Add .* to cart/ })
    fireEvent.click(addBtn)
    const plus = within(card.querySelector('.stepper')!).getAllByRole('button')[1]
    fireEvent.click(plus)
    fireEvent.click(plus) // 3 × 12.90 = 38.70
    fireEvent.click(screen.getByRole('button', { name: /Open cart/i }))
    const drawer = $('.drawer') as HTMLElement
    expect(drawer.textContent).toContain('FREE')
  })

  it('cart persists across a full remount (page refresh)', () => {
    const first = renderApp('http://localhost:3000/#/menu')
    fireEvent.click($$('button.quick-add')[0])
    const saved = localStorage.getItem('fb_cart')
    expect(saved).toBeTruthy()
    first.unmount()
    renderApp('http://localhost:3000/#/menu')
    expect(localStorage.getItem('fb_cart')).toBe(saved)
    expect(JSON.parse(localStorage.getItem('fb_cart')!)[0].qty).toBe(1)
  })

  it('cart badge reflects total quantity', () => {
    renderApp('http://localhost:3000/#/menu')
    const cards = $$('article.pcard')
    fireEvent.click(within(cards[0] as HTMLElement).getByRole('button', { name: /Add .* to cart/ }))
    fireEvent.click(within((cards[0] as HTMLElement).querySelector('.stepper')!).getAllByRole('button')[1])
    expect($('.cartbadge')!.textContent).toBe('2')
  })
})

describe('P0-4 · Menu + P0-5 · Grocery functionality', () => {
  it('menu view lists only restaurant items', () => {
    renderApp('http://localhost:3000/#/menu')
    const names = $$('article.pcard h3').map(h => h.textContent)
    const menuNames = CATALOG.filter(i => i.kind === 'menu').map(i => i.name)
    expect(names.length).toBe(menuNames.length)
    for (const n of names) expect(menuNames).toContain(n)
  })

  it('grocery view lists only grocery items', () => {
    renderApp('http://localhost:3000/#/grocery')
    const names = $$('article.pcard h3').map(h => h.textContent)
    const gNames = CATALOG.filter(i => i.kind === 'grocery').map(i => i.name)
    expect(names.length).toBe(gNames.length)
    for (const n of names) expect(gNames).toContain(n)
  })

  it('category filter narrows the grid', () => {
    renderApp('http://localhost:3000/#/menu')
    fireEvent.click(screen.getByRole('button', { name: /Burgers/ }))
    const names = $$('article.pcard h3').map(h => h.textContent)
    expect(names).toEqual(expect.arrayContaining(['Double Smash Burger', 'Crispy Chicken Burger']))
    expect(names.length).toBe(2)
  })

  it('favourites filter shows saved items only', () => {
    renderApp('http://localhost:3000/#/menu')
    const fav = $$('article.pcard button.fav')[0]
    fireEvent.click(fav)
    fireEvent.click(screen.getByRole('button', { name: /Saved/ }))
    const names = $$('article.pcard h3').map(h => h.textContent)
    expect(names).toEqual(['Double Smash Burger'])
  })
})

describe('P0-14 · Search', () => {
  it('searches menu by name', () => {
    renderApp('http://localhost:3000/#/menu')
    fireEvent.change(screen.getByRole('textbox', { name: /^Search$/ }), { target: { value: 'pizza' } })
    const names = $$('article.pcard h3').map(h => h.textContent)
    expect(names).toEqual(['Pepperoni Supreme'])
  })

  it('is case-insensitive', () => {
    renderApp('http://localhost:3000/#/menu')
    fireEvent.change(screen.getByRole('textbox', { name: /^Search$/ }), { target: { value: 'BURGER' } })
    const names = $$('article.pcard h3').map(h => h.textContent)
    expect(names.length).toBeGreaterThan(0)
    expect(names.join()).toMatch(/Burger/i)
  })

  it('searches the grocery catalog too', () => {
    renderApp('http://localhost:3000/#/grocery')
    fireEvent.change(screen.getByRole('textbox', { name: /^Search$/ }), { target: { value: 'avocado' } })
    const names = $$('article.pcard h3').map(h => h.textContent)
    expect(names).toContain('Avocados')
  })

  it('shows an empty-result state', () => {
    renderApp('http://localhost:3000/#/menu')
    fireEvent.change(screen.getByRole('textbox', { name: /^Search$/ }), { target: { value: 'zzzzqqq' } })
    expect(screen.getByText(/No products found/i)).toBeInTheDocument()
  })

  it('cross-kind results appear (menu query finds groceries)', () => {
    renderApp('http://localhost:3000/#/menu')
    fireEvent.change(screen.getByRole('textbox', { name: /^Search$/ }), { target: { value: 'chocolate' } })
    const names = $$('article.pcard h3').map(h => h.textContent)
    expect(names.some(n => /chocolate|cake/i.test(n || ''))).toBe(true)
  })

  it('hero search navigates to the menu with the query applied', () => {
    renderApp('http://localhost:3000/#/')
    const input = screen.getByRole('textbox', { name: /Search the menu/i })
    fireEvent.change(input, { target: { value: 'sushi' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(screen.getByRole('heading', { level: 2, name: /Menu/i })).toBeInTheDocument()
    const names = $$('article.pcard h3').map(h => h.textContent)
    expect(names.join()).toMatch(/Dragon Roll/i)
  })
})

describe('P0-6 · WhatsApp ordering', () => {
  it('waDigits strips formatting', () => {
    expect(waDigits('+1 (555) 010-2030')).toBe('15550102030')
  })

  it('builds an itemised, totalled message', () => {
    const store: StoreConfig = {
      slug: 'fresh-bites', name: 'Fresh Bites', tagline: 't', whatsapp: '15551234567',
      city: 'Downtown', fee: 2.99, freeAt: 30, currency: '$', emoji: '🍔', accent: '#ff6a2b',
    }
    const byId = (id: string) => CATALOG.find(i => i.id === id)
    const order = {
      id: 'FB-1024', ts: Date.now(),
      lines: [{ id: 'smash', qty: 2 }, { id: 'avo', qty: 1 }],
      subtotal: 30.3, deliveryFee: 0, total: 30.3,
      name: 'Omar', phone: '+1 555 010 2030', address: '42 Maple Ave, Downtown',
      when: 'ASAP · ~25 min', payment: 'Cash on delivery', note: 'no pickles',
      sentWhatsApp: true,
    } as Order
    const msg = buildOrderMessage(store, order, byId)
    expect(msg).toContain('NEW ORDER — Fresh Bites')
    expect(msg).toContain('#FB-1024')
    expect(msg).toContain('2× Double Smash Burger')
    expect(msg).toContain('$25.80')
    expect(msg).toContain('1× Avocados (3 pack)')
    expect(msg).toContain('Subtotal')
    expect(msg).toContain('$30.30')
    expect(msg).toContain('FREE')
    expect(msg).toContain('Omar')
    expect(msg).toContain('+1 555 010 2030')
    expect(msg).toContain('no pickles')
    // no float artifacts
    expect(msg).not.toMatch(/\d+\.\d{3,}/)
  })

  it('end-to-end: checkout opens a wa.me link with the encoded order', async () => {
    renderApp('http://localhost:3000/#/menu')
    fireEvent.click($$('article.pcard button.quick-add')[0])
    fireEvent.click(screen.getByRole('button', { name: /Open cart/i }))
    fireEvent.click(within($('.drawer') as HTMLElement).getByText('Checkout'))
    fireEvent.change(screen.getByPlaceholderText('Amina T.'), { target: { value: 'Omar' } })
    fireEvent.change(screen.getByPlaceholderText('+1 555 010 2030'), { target: { value: '+1 555 010 2030' } })
    fireEvent.change(screen.getByPlaceholderText('42 Maple Ave, Apt 3'), { target: { value: '42 Maple Ave' } })
    const slider = $('.slide') as HTMLElement
    fireEvent.keyDown(slider, { key: "Enter" }); await settle()
    const wa = (globalThis as any).__opened as string[]
    expect(wa.length).toBe(1)
    expect(wa[0]).toMatch(/^https:\/\/wa\.me\/15551234567\?text=/)
    const text = decodeURIComponent(wa[0].split('text=')[1])
    expect(text).toContain('Double Smash Burger')
    expect(text).toContain('Omar')
  })

  it('respects the "do not send to WhatsApp" toggle', async () => {
    renderApp('http://localhost:3000/#/menu')
    fireEvent.click($$('article.pcard button.quick-add')[0])
    fireEvent.click(screen.getByRole('button', { name: /Open cart/i }))
    fireEvent.click(within($('.drawer') as HTMLElement).getByText('Checkout'))
    fireEvent.change(screen.getByPlaceholderText('Amina T.'), { target: { value: 'Omar' } })
    fireEvent.change(screen.getByPlaceholderText('+1 555 010 2030'), { target: { value: '+1 555 010 2030' } })
    fireEvent.change(screen.getByPlaceholderText('42 Maple Ave, Apt 3'), { target: { value: '42 Maple Ave' } })
    fireEvent.click($('.switch')!)
    fireEvent.keyDown($('.slide') as HTMLElement, { key: 'Enter' }); await settle()
    expect((globalThis as any).__opened.length).toBe(0)
  })

  it('blocks checkout when contact fields are missing', async () => {
    renderApp('http://localhost:3000/#/menu')
    fireEvent.click($$('article.pcard button.quick-add')[0])
    fireEvent.click(screen.getByRole('button', { name: /Open cart/i }))
    fireEvent.click(within($('.drawer') as HTMLElement).getByText('Checkout'))
    const slider = $('.slide') as HTMLElement
    expect(slider.textContent).toMatch(/Fill your details/i)
    fireEvent.keyDown(slider, { key: "Enter" }); await settle()
    expect((globalThis as any).__opened.length).toBe(0)
    expect(screen.getByText(/Almost there/i)).toBeInTheDocument()
  })
})

describe('P0-7 · QR generation', () => {
  it('renders a canvas per QR and the owner QR carries the store slug', () => {
    renderApp('http://localhost:3000/#/store')
    const canvases = $$('canvas')
    expect(canvases.length).toBeGreaterThan(0)
    // the main downloadable QR must exist with the id the download button looks up
    expect($('#qr-main')).toBeTruthy()
  })

  it('the QR encodes a URL that re-creates this store', () => {
    renderApp('http://localhost:3000/#/store')
    const linkEl = $('.qr-link')
    expect(linkEl).toBeTruthy()
    const url = new URL(linkEl!.textContent!)
    expect(url.searchParams.get('store')).toBe('fresh-bites')
    expect(url.searchParams.get('name')).toBe('Fresh Bites')
    expect(url.searchParams.get('wa')).toBe('15551234567')
  })

  it('scan → the scanned store is what the customer sees', () => {
    const link = 'http://localhost:3000/?store=mama-rosas&name=Mama%20Rosa%27s%20Pizzeria&wa=393331234567&emoji=%F0%9F%8D%95&fee=4.5'
    renderApp(link)
    expect(within($('.topnav') as HTMLElement).getByText(/Mama Rosa's Pizzeria/)).toBeInTheDocument()
    const wa = $('a.btn-wa')!.getAttribute('href')!
    expect(wa).toContain('wa.me/393331234567')
  })
})

describe('P0-8 · Owner setup', () => {
  it('renaming the store rebrands the storefront and the QR link', () => {
    renderApp('http://localhost:3000/#/store')
    const nameInput = screen.getByPlaceholderText('Fresh Bites')
    fireEvent.change(nameInput, { target: { value: "Mama Rosa's Pizzeria" } })
    // persisted
    const saved = JSON.parse(localStorage.getItem('fb_store')!)
    expect(saved.name).toBe("Mama Rosa's Pizzeria")
    expect(saved.slug).toBe('mama-rosas-pizzeria')
    // QR link follows
    expect($('.qr-link')!.textContent).toContain('mama-rosas-pizzeria')
  })

  it('changing the WhatsApp number changes every wa.me link', () => {
    renderApp('http://localhost:3000/#/store')
    fireEvent.change(screen.getByPlaceholderText('15551234567'), { target: { value: '393339998888' } })
    fireEvent.click(topBtn(/^Home$/))
    const wa = $('a.btn-wa')!.getAttribute('href')!
    expect(wa).toContain('wa.me/393339998888')
  })

  it('changing the delivery fee changes the cart total', () => {
    renderApp('http://localhost:3000/#/store')
    fireEvent.change(screen.getByDisplayValue('2.99'), { target: { value: '5' } })
    fireEvent.click(topBtn(/^Menu$/))
    fireEvent.click($$('article.pcard button.quick-add')[0])
    fireEvent.click(screen.getByRole('button', { name: /Open cart/i }))
    expect($('.drawer')!.textContent).toContain('$5.00')
  })

  it('currency switch re-labels all prices', () => {
    renderApp('http://localhost:3000/#/store')
    fireEvent.change(screen.getByDisplayValue('$'), { target: { value: '€' } })
    fireEvent.click(topBtn(/^Menu$/))
    expect($('.price')!.textContent).toBe('€12.90')
  })

  it('owner-added product appears in the customer menu (Scenario D)', () => {
    renderApp('http://localhost:3000/#/store')
    const form = $('.add-item') as HTMLFormElement
    fireEvent.change(within(form).getByPlaceholderText(/Item name/), { target: { value: 'Truffle Fries' } })
    fireEvent.change(within(form).getByPlaceholderText(/Price/), { target: { value: '7.5' } })
    fireEvent.submit(form)
    fireEvent.click(topBtn(/^Menu$/))
    const names = $$('article.pcard h3').map(h => h.textContent)
    expect(names).toContain('Truffle Fries')
  })

  it('owner-added product persists across a reload', () => {
    const r = renderApp('http://localhost:3000/#/store')
    const form = $('.add-item') as HTMLFormElement
    fireEvent.change(within(form).getByPlaceholderText(/Item name/), { target: { value: 'Truffle Fries' } })
    fireEvent.change(within(form).getByPlaceholderText(/Price/), { target: { value: '7.5' } })
    fireEvent.submit(form)
    r.unmount()
    renderApp('http://localhost:3000/#/menu')
    expect($$('article.pcard h3').map(h => h.textContent)).toContain('Truffle Fries')
  })

  it('owner can delete a custom product', () => {
    renderApp('http://localhost:3000/#/store')
    const form = $('.add-item') as HTMLFormElement
    fireEvent.change(within(form).getByPlaceholderText(/Item name/), { target: { value: 'Truffle Fries' } })
    fireEvent.change(within(form).getByPlaceholderText(/Price/), { target: { value: '7.5' } })
    fireEvent.submit(form)
    fireEvent.click(screen.getByRole('button', { name: /Delete Truffle Fries/ }))
    const menu = $$('.menu-list .ml-name').map(e => e.textContent)
    expect(menu).not.toContain('Truffle Fries')
  })

  it('rejects an item with no name / bad price', () => {
    renderApp('http://localhost:3000/#/store')
    const form = $('.add-item') as HTMLFormElement
    fireEvent.change(within(form).getByPlaceholderText(/Price/), { target: { value: '-5' } })
    fireEvent.submit(form)
    expect($$('.menu-list li').length).toBe(CATALOG.length)
  })
})

describe('P0-9 · Track order', () => {
  it('empty state before any order', () => {
    renderApp('http://localhost:3000/#/track')
    expect(screen.getByText(/No orders yet/i)).toBeInTheDocument()
  })

  it('shows the placed order with a live timeline after checkout', async () => {
    renderApp('http://localhost:3000/#/menu')
    fireEvent.click($$('article.pcard button.quick-add')[0])
    fireEvent.click(screen.getByRole('button', { name: /Open cart/i }))
    fireEvent.click(within($('.drawer') as HTMLElement).getByText('Checkout'))
    fireEvent.change(screen.getByPlaceholderText('Amina T.'), { target: { value: 'Omar' } })
    fireEvent.change(screen.getByPlaceholderText('+1 555 010 2030'), { target: { value: '+1 555 010 2030' } })
    fireEvent.change(screen.getByPlaceholderText('42 Maple Ave, Apt 3'), { target: { value: '42 Maple Ave' } })
    fireEvent.keyDown($('.slide') as HTMLElement, { key: 'Enter' }); await settle()
    expect(screen.getByRole('heading', { level: 2, name: /Track your order/i })).toBeInTheDocument()
    expect($('.timeline')).toBeTruthy()
    expect($$('.tnode').length).toBe(5)
  })

  it('stages advance over time (simulated clock)', async () => {
    const { stageOf, STAGES } = await import('../src/lib/order')
    const o = { id: 'FB-1', ts: Date.now(), lines: [], subtotal: 0, deliveryFee: 0, total: 0, name: '', phone: '', address: '', when: '', payment: '', sentWhatsApp: false } as Order
    expect(stageOf(o, o.ts)).toBe(0)
    expect(stageOf(o, o.ts + 13_000)).toBe(1)
    expect(stageOf(o, o.ts + 46_000)).toBe(2)
    expect(stageOf(o, o.ts + 131_000)).toBe(3)
    expect(stageOf(o, o.ts + 221_000)).toBe(4)
    expect(STAGES.length).toBe(5)
  })

  it('orders persist across reload', async () => {
    const r = renderApp('http://localhost:3000/#/menu')
    fireEvent.click($$('article.pcard button.quick-add')[0])
    fireEvent.click(screen.getByRole('button', { name: /Open cart/i }))
    fireEvent.click(within($('.drawer') as HTMLElement).getByText('Checkout'))
    fireEvent.change(screen.getByPlaceholderText('Amina T.'), { target: { value: 'Omar' } })
    fireEvent.change(screen.getByPlaceholderText('+1 555 010 2030'), { target: { value: '+1 555 010 2030' } })
    fireEvent.change(screen.getByPlaceholderText('42 Maple Ave, Apt 3'), { target: { value: '42 Maple Ave' } })
    fireEvent.keyDown($('.slide') as HTMLElement, { key: 'Enter' }); await settle()
    const saved = localStorage.getItem('fb_orders')!
    expect(JSON.parse(saved).length).toBe(1)
    r.unmount()
    renderApp('http://localhost:3000/#/track')
    expect(screen.getByRole('heading', { level: 2, name: /Track your order/i })).toBeInTheDocument()
  })
})

describe('P0-11 · Validation & edge cases', () => {
  it('a bogus ?store param does not break the app', () => {
    renderApp('http://localhost:3000/?store=%3Cscript%3Ealert(1)%3C/script%3E&name=%3Cb%3EX%3C/b%3E&wa=%22%3E%3Cimg%20src=x%3E&fee=NaN')
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    const wa = $('a.btn-wa')!.getAttribute('href')!
    expect(wa).not.toContain('<img')
    expect(wa).toMatch(/^https:\/\/wa\.me\/\d*\?text=/)
  })

  it('a cart referencing a deleted product does not crash and does not mis-total', () => {
    localStorage.setItem('fb_cart', JSON.stringify([{ id: 'ghost-item-404', qty: 3 }]))
    renderApp('http://localhost:3000/#/menu')
    expect($('.page-head h2')!.textContent).toMatch(/Menu/)
    fireEvent.click(screen.getByRole('button', { name: /Open cart/i }))
    expect($('.drawer')!.textContent).toMatch(/hungry/i)
  })

  it('checkout with an empty cart shows the empty state, not a broken form', () => {
    renderApp('http://localhost:3000/#/checkout')
    expect(screen.getByText(/Nothing to check out/i)).toBeInTheDocument()
  })

  it('money() never prints more than 2 decimals', () => {
    for (const n of [0, 0.1 + 0.2, 12.9 * 3, 99.999, 1e-9]) {
      expect(money(n)).toMatch(/^\$\d+\.\d{2}$/)
    }
  })

  it('phone input accepts only sane characters in the owner form', () => {
    renderApp('http://localhost:3000/#/store')
    fireEvent.change(screen.getByPlaceholderText('15551234567'), { target: { value: 'abc<script>12' } })
    expect(screen.getByPlaceholderText('15551234567')).toHaveValue('12')
  })
})

describe('P0-2 · Broken / decorative functionality check', () => {
  it('every button in the app is wired (no silent no-ops)', () => {
    renderApp()
    const buttons = $$('button')
    const dead: string[] = []
    for (const b of buttons) {
      const text = (b.textContent || '').trim()
      if (!text && !b.getAttribute('aria-label')) dead.push('[unnamed]')
    }
    expect(dead).toEqual([])
  })

  it('home page keeps every plan-required element', () => {
    renderApp('http://localhost:3000/#/')
    expect($('.eyebrow')).toBeTruthy()                       // status badge
    expect($('h1')).toBeTruthy()                              // hero heading
    expect($('.lede')).toBeTruthy()                           // description
    expect($('.hero-search')).toBeTruthy()                    // search
    expect($$('.hero-ctas .btn').length).toBe(2)             // CTA buttons
    expect($('.hero-stats')).toBeTruthy()                     // stats
    expect($('.hero-img')).toBeTruthy()                       // hero image
    expect($('.fc-qr')).toBeTruthy()                          // floating QR card
    expect($('.float-badge')).toBeTruthy()                    // delivery/status card
    expect($('.marquee')).toBeTruthy()                        // feature strip
  })
})

/* ═══════════════════════════════════════════════════════════════
   Phase 2 — regression tests for the bugs fixed in this phase
   ═══════════════════════════════════════════════════════════════ */
import { matchesQuery, fold, searchCatalog } from '../src/lib/search'
import { slugify } from '../src/lib/util'

describe('P2 · B1 search now covers name, category and description', () => {
  const find = (id: string) => CATALOG.find(i => i.id === id)!

  it('finds a product by its category label', () => {
    expect(matchesQuery(find('pep-pizza'), 'pizza')).toBe(true)
    expect(matchesQuery(find('dragon-roll'), 'sushi')).toBe(true)
    expect(matchesQuery(find('lava-cake'), 'dessert')).toBe(true)
  })

  it('finds a product by words in its description', () => {
    expect(matchesQuery(find('lava-cake'), 'chocolate')).toBe(true)
    expect(matchesQuery(find('sourdough'), 'ferment')).toBe(true)
  })

  it('still matches on the name', () => {
    expect(matchesQuery(find('smash'), 'smash')).toBe(true)
    expect(matchesQuery(find('smash'), 'Double Smash Burger')).toBe(true)
  })

  it('is case- and accent-insensitive', () => {
    expect(fold('CAFÉ Über')).toBe('cafe uber')
    expect(matchesQuery(find('smash'), 'SMASH')).toBe(true)
  })

  it('requires every query word (no over-matching)', () => {
    expect(matchesQuery(find('smash'), 'chicken burger')).toBe(false)
    expect(matchesQuery(find('chicken-burger'), 'chicken burger')).toBe(true)
  })

  it('distinguishes menu from grocery results', () => {
    const { primary, other } = searchCatalog(CATALOG, 'menu', 'chocolate')
    expect(primary.map(i => i.id)).toContain('lava-cake')
    expect(other.map(i => i.id)).toContain('choc')
  })

  it('UI: searching "pizza" on #/menu returns the pizza', () => {
    renderApp('http://localhost:3000/#/menu')
    fireEvent.change(screen.getByRole('textbox', { name: /^Search$/ }), { target: { value: 'pizza' } })
    expect($$('article.pcard h3').map(h => h.textContent)).toContain('Pepperoni Supreme')
  })

  it('UI: the hero placeholder promise holds — "sushi" finds the roll', () => {
    renderApp('http://localhost:3000/#/')
    fireEvent.change(screen.getByRole('textbox', { name: /Search the menu/i }), { target: { value: 'sushi' } })
    fireEvent.keyDown(screen.getByRole('textbox', { name: /Search the menu/i }), { key: 'Enter' })
    expect($$('article.pcard h3').map(h => h.textContent).join()).toMatch(/Dragon Roll/i)
  })

  it('UI: a grocery-only query routes the hero search to the market', () => {
    renderApp('http://localhost:3000/#/')
    const input = screen.getByRole('textbox', { name: /Search the menu/i })
    fireEvent.change(input, { target: { value: 'sourdough' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect($('.page-head h2')!.textContent).toBe('The Market')
    expect($$('article.pcard h3').map(h => h.textContent)).toContain('Sourdough Loaf')
  })

  it('UI: typing keeps keyboard focus in the search box (no remount per keystroke)', () => {
    renderApp('http://localhost:3000/#/menu')
    const input = screen.getByRole('textbox', { name: /^Search$/ }) as HTMLInputElement
    input.focus()
    fireEvent.change(input, { target: { value: 'b' } })
    fireEvent.change(input, { target: { value: 'bu' } })
    fireEvent.change(input, { target: { value: 'bur' } })
    expect(document.activeElement).toBe($('.page-search input'))
    expect(screen.getByRole('textbox', { name: /^Search$/ })).toHaveValue('bur')
  })

  it('UI: search narrows within an active category filter', () => {
    renderApp('http://localhost:3000/#/menu')
    fireEvent.click(screen.getByRole('button', { name: /Bowls/ }))
    fireEvent.change(screen.getByRole('textbox', { name: /^Search$/ }), { target: { value: 'chicken' } })
    expect($$('article.pcard h3').map(h => h.textContent)).toEqual(['Grilled Chicken Wrap'])
  })
})

describe('P2 · B2 slugify', () => {
  it("joins an apostrophe instead of hyphenating it", () => {
    expect(slugify("Mama Rosa's Pizzeria")).toBe('mama-rosas-pizzeria')
  })
  it('folds accents and clamps length', () => {
    expect(slugify('Café del Mar')).toBe('cafe-del-mar')
    expect(slugify('Şişli Kebap')).toBe('sisli-kebap')
    expect(slugify('x'.repeat(80))).toHaveLength(48)
  })
  it('falls back for unusable names', () => {
    expect(slugify('   ')).toBe('my-store')
    expect(slugify('!!!')).toBe('my-store')
  })
})

describe('P2 · R1 single data path for products', () => {
  it('no component writes localStorage directly any more', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fs = require('fs') as typeof import('fs')
    const path = require('path') as typeof import('path')
    const dir = path.join(__dirname, '..', 'src', 'components')
    const offenders = fs.readdirSync(dir)
      .filter(f => f.endsWith('.tsx'))
      .filter(f => fs.readFileSync(path.join(dir, f), 'utf8').includes('localStorage'))
    expect(offenders).toEqual([])
  })

  it('owner edits land in overrides, not in the shipped catalog', async () => {
    const { readMenu } = await import('../src/store')
    renderApp('http://localhost:3000/#/store')
    expect(CATALOG[0].price).toBe(12.9)
    expect(readMenu('fresh-bites').custom).toEqual([])
  })
})

describe('P2 · R2 no hard-coded demo values left in components', () => {
  it('the USDT address comes from store config', () => {
    renderApp('http://localhost:3000/#/store')
    fireEvent.change(screen.getByDisplayValue('$'), { target: { value: '$' } })
    const saved = JSON.parse(localStorage.getItem('fb_store')!)
    expect(saved.usdt).toBeTruthy()
  })
  it('hours and stats come from store config', () => {
    renderApp('http://localhost:3000/#/')
    const saved = JSON.parse(localStorage.getItem('fb_store')!)
    expect(saved.hours).toBe('11:00 – 23:00')
    expect(saved.stats.reviews).toBe('2,300+ reviews')
    expect($('.hero')!.textContent).toContain('2,300+ reviews')
    expect($('.topnav')!.textContent).toContain('11:00')
  })
})

describe('P2 · scanning a QR must not clobber the owner’s saved settings', () => {
  it('a scanned session leaves fb_store untouched', () => {
    // owner's own settings
    localStorage.setItem('fb_store', JSON.stringify({
      slug: 'my-diner', name: 'My Diner', tagline: 'Best in town', whatsapp: '15550001111',
      city: 'Uptown', address: '9 Elm St', hours: '10:00 – 22:00', open: true,
      fee: 1.5, freeAt: 20, currency: '€', emoji: '🍕', accent: '#7c5cff',
      heroImg: '', usdt: '', stats: { rating: '4.5★', reviews: '10 reviews', delivery: '30 min' },
    }))
    renderApp('http://localhost:3000/?store=other-place&name=Other%20Place&wa=393331112222&emoji=%F0%9F%8C%AE&fee=3')
    expect(localStorage.getItem('fb_store')!).toContain('My Diner')
    expect($('.topnav')!.textContent).toContain('Other Place')
  })

  it('the owner’s own edits still persist', () => {
    renderApp('http://localhost:3000/#/store')
    fireEvent.change(screen.getByPlaceholderText('Fresh Bites'), { target: { value: 'My Diner' } })
    expect(JSON.parse(localStorage.getItem('fb_store')!).name).toBe('My Diner')
  })
})

describe('P2 · URL parameter validation (plan §21)', () => {
  it('clamps a hostile slug', () => {
    renderApp('http://localhost:3000/?store=%3Cscript%3Ealert(1)%3C%2Fscript%3E')
    expect($('.topnav')).toBeTruthy()
    expect(document.body.innerHTML).not.toContain('<script>alert')
  })
  it('clamps an absurd fee instead of poisoning the cart', () => {
    renderApp('http://localhost:3000/?store=x&name=X&wa=1&fee=99999999')
    fireEvent.click(topBtn(/^Menu$/))
    fireEvent.click($$('article.pcard button.quick-add')[0])
    fireEvent.click(screen.getByRole('button', { name: /Open cart/i }))
    expect($('.drawer')!.textContent).toContain('$2.99')
  })
  it('truncates an over-long store name', () => {
    renderApp(`http://localhost:3000/?store=x&name=${encodeURIComponent('A'.repeat(400))}&wa=1`)
    expect(localStorage.getItem('fb_store')).toBeNull() // scanned session does not persist
    expect($('.brand-name')!.textContent!.length).toBeLessThanOrEqual(60)
  })

  it('a name match outranks a description mention', async () => {
    const { score } = await import('../src/lib/search')
    const find = (id: string) => CATALOG.find(i => i.id === id)!
    expect(score(find('smash'), 'smash')).toBeGreaterThan(score(find('lava-cake'), 'chocolate'))
    expect(score(find('pep-pizza'), 'pepperoni supreme')).toBeGreaterThan(score(find('caesar'), 'sourdough'))
  })

  it('UI: the market wins when the product is named there', () => {
    renderApp('http://localhost:3000/#/')
    const input = screen.getByRole('textbox', { name: /Search the menu/i })
    fireEvent.change(input, { target: { value: 'sourdough' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    const names = $$('article.pcard h3').map(h => h.textContent)
    expect(names[0]).toBe('Sourdough Loaf')
  })
})
