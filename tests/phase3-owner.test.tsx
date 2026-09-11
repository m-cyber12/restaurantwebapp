/**
 * Phase 3 — Owner Dashboard
 * Covers plan §3–§10 and §25, plus the end-to-end Scenarios A, C, D and E.
 */
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, within, act } from '@testing-library/react'
import App from '../src/App'
import { CATALOG } from '../src/data'

const $ = (sel: string) => document.querySelector(sel)
const $$ = (sel: string) => Array.from(document.querySelectorAll(sel))

function renderApp(url = 'http://localhost:3000/') {
  window.history.replaceState({}, '', url)
  return render(<App />)
}
const tab = (name: RegExp) =>
  within($('.ownernav') as HTMLElement).getByRole('button', { name })
const settle = () => new Promise(r => setTimeout(r, 400))

/** Navigate by hash inside the one mounted app and let `hashchange` land. */
async function goto(hash: string) {
  window.location.hash = hash
  await act(async () => {
    await new Promise(r => setTimeout(r, 0))
  })
}

/** Fill in checkout and place the order. Returns the order id. */
async function placeOrder(name = 'Omar', address = '42 Maple Ave') {
  fireEvent.click(screen.getByRole('button', { name: /Open cart/i }))
  fireEvent.click(within($('.drawer') as HTMLElement).getByText('Checkout'))
  fireEvent.change(screen.getByPlaceholderText('Amina T.'), { target: { value: name } })
  fireEvent.change(screen.getByPlaceholderText('+1 555 010 2030'), { target: { value: '+1 555 010 2030' } })
  const addr = screen.queryByPlaceholderText('42 Maple Ave, Apt 3')
  if (addr) fireEvent.change(addr, { target: { value: address } })
  fireEvent.keyDown($('.slide') as HTMLElement, { key: 'Enter' })
  await settle()
  return JSON.parse(localStorage.getItem('fb_orders')!)[0]
}

describe('§3/§25 · Owner dashboard exists and is separate from customer mode', () => {
  it('all seven panels are reachable from the owner nav', () => {
    renderApp('http://localhost:3000/#/store')
    const labels = $$('.ownertab').map(b => b.getAttribute('aria-label') || b.textContent!.replace(/^[^A-Za-z]+/, ''))
    expect(labels).toEqual([
      'Overview', 'Orders', 'Menu', 'Grocery', 'QR Codes', 'Settings', 'Appearance',
    ])
  })

  it('each panel renders its own content', () => {
    renderApp('http://localhost:3000/#/store')
    expect($('.stat-grid')).toBeTruthy()
    fireEvent.click(tab(/Orders/))
    expect(screen.getByRole('heading', { level: 2, name: 'Orders' })).toBeInTheDocument()
    fireEvent.click(tab(/Menu/))
    expect($('.plist')).toBeTruthy()
    fireEvent.click(tab(/Grocery/))
    expect($('.plist')).toBeTruthy()
    fireEvent.click(tab(/QR Codes/))
    expect($('.qr-frame')).toBeTruthy()
    fireEvent.click(tab(/Settings/))
    expect(screen.getByPlaceholderText('Fresh Bites')).toBeInTheDocument()
    fireEvent.click(tab(/Appearance/))
    expect($('.preview')).toBeTruthy()
  })

  it('panels are deep-linkable by hash', () => {
    renderApp('http://localhost:3000/#/store/qr')
    expect($('.qr-frame')).toBeTruthy()
    expect($('.ownertab.on')!.textContent).toContain('QR Codes')
  })

  it('an unknown owner tab falls back to Overview', () => {
    renderApp('http://localhost:3000/#/store/nonsense')
    expect($('.stat-grid')).toBeTruthy()
  })

  it('owner mode hides the customer nav and shows the owner nav', () => {
    renderApp('http://localhost:3000/#/store')
    expect($('.tabs')).toBeNull()
    expect($('.bottomnav')).toBeNull()
    expect($('.ownernav')).toBeTruthy()
    expect($('.mode-pill')!.textContent).toContain('Owner mode')
  })

  it('customer mode has no owner chrome', () => {
    renderApp('http://localhost:3000/#/')
    expect($('.tabs')).toBeTruthy()
    expect($('.ownernav')).toBeNull()
    expect($('.mode-pill')).toBeNull()
  })

  it('the customer entry point reads "Manage Store", not "For owners"', () => {
    renderApp('http://localhost:3000/#/')
    expect(within($('.tabs') as HTMLElement).getByRole('button', { name: 'Manage Store' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: /For owners/ })).toBeNull()
  })
})

describe('§4 · Overview', () => {
  it('shows the four headline numbers', async () => {
    renderApp('http://localhost:3000/#/menu')
    fireEvent.click($$('article.pcard button.quick-add')[0])
    await placeOrder()
    window.history.replaceState({}, '', 'http://localhost:3000/#/store')
    render(<App />)
    const labels = $$('.stat-label').map(e => e.textContent)
    expect(labels).toEqual(["Today's orders", 'Revenue today', 'Pending orders', 'Average order'])
    const values = $$('.stat-value').map(e => e.textContent)
    expect(values[0]).toBe('1')
    expect(values[1]).toBe('$15.89') // 12.90 + 2.99
    expect(values[3]).toBe('$15.89')
  })

  it('is honest that the numbers are local demo data', () => {
    renderApp('http://localhost:3000/#/store')
    expect($('.owner-note')!.textContent).toMatch(/no server/i)
    expect($('.eyebrow')!.textContent).toMatch(/demo data/i)
  })

  it('has the four quick actions', () => {
    renderApp('http://localhost:3000/#/store')
    const qa = within($('.quick-actions') as HTMLElement)
    expect(qa.getByRole('button', { name: /Add product/ })).toBeTruthy()
    expect(qa.getByRole('button', { name: /View orders/ })).toBeTruthy()
    expect(qa.getByRole('button', { name: /Generate QR/ })).toBeTruthy()
    expect(qa.getByRole('button', { name: /Edit store/ })).toBeTruthy()
    fireEvent.click(qa.getByRole('button', { name: /Generate QR/ }))
    expect($('.qr-frame')).toBeTruthy()
  })

  it('shows the empty states before any order exists', () => {
    renderApp('http://localhost:3000/#/store')
    expect(screen.getByText(/No orders yet/i)).toBeInTheDocument()
    expect(screen.getByText(/Nothing yet/i)).toBeInTheDocument()
  })

  it('reports live vs switched-off products', () => {
    renderApp('http://localhost:3000/#/store/menu')
    fireEvent.click(within($$('.prow')[0] as HTMLElement).getByRole('button', { name: /^Disable$/ }))
    fireEvent.click(tab(/Overview/))
    expect($('.spark')!.parentElement!.textContent).toMatch(/1 switched off/)
  })
})

describe('§5 · Scenario E — order management', () => {
  it('walks an order New → Accepted → Preparing → Ready → Out → Completed', async () => {
    renderApp('http://localhost:3000/#/menu')
    fireEvent.click($$('article.pcard button.quick-add')[0])
    const order = await placeOrder()
    window.history.replaceState({}, '', 'http://localhost:3000/#/store/orders')
    render(<App />)

    const card = $('.order-card') as HTMLElement
    expect(within(card).getByText(`#${order.id}`)).toBeInTheDocument()
    expect(within(card).getByText('New')).toBeInTheDocument()

    const click = (label: RegExp) =>
      fireEvent.click(within($('.order-card') as HTMLElement).getByRole('button', { name: label }))

    click(/^✅ Accept$/)
    expect($('.order-card .status-pill')!.textContent).toBe('Accepted')
    click(/Start preparing/)
    expect($('.order-card .status-pill')!.textContent).toBe('Preparing')
    click(/Mark ready/)
    expect($('.order-card .status-pill')!.textContent).toBe('Ready')
    click(/Send out for delivery/)
    expect($('.order-card .status-pill')!.textContent).toBe('Out for delivery')
    click(/Mark completed/)
    expect($('.order-card .status-pill')!.textContent).toBe('Completed')

    const saved = JSON.parse(localStorage.getItem('fb_orders')!)[0]
    expect(saved.status).toBe('completed')
  })

  it('Reject on a new order cancels it', async () => {
    renderApp('http://localhost:3000/#/menu')
    fireEvent.click($$('article.pcard button.quick-add')[0])
    await placeOrder()
    window.history.replaceState({}, '', 'http://localhost:3000/#/store/orders')
    render(<App />)
    fireEvent.click(within($('.order-card') as HTMLElement).getByRole('button', { name: /^Reject$/ }))
    expect($('.order-card .status-pill')!.textContent).toContain('Cancelled')
    expect(JSON.parse(localStorage.getItem('fb_orders')!)[0].status).toBe('cancelled')
  })

  it('the customer track view reflects the owner status (Scenario E)', async () => {
    renderApp('http://localhost:3000/#/menu')
    fireEvent.click($$('article.pcard button.quick-add')[0])
    await placeOrder()
    // One app instance, navigated by hash — the way a real browser behaves.
    await goto('#/store/orders')
    fireEvent.click(within($('.order-card') as HTMLElement).getByRole('button', { name: /^✅ Accept$/ }))
    fireEvent.click(within($('.order-card') as HTMLElement).getByRole('button', { name: /Start preparing/ }))

    await goto('#/track')
    expect($('.track .status-pill')!.textContent).toBe('Preparing')
    expect($('.track-status-note')!.textContent).toContain('Preparing')
  })

  it('filters orders by active / completed', async () => {
    renderApp('http://localhost:3000/#/menu')
    fireEvent.click($$('article.pcard button.quick-add')[0])
    await placeOrder()
    window.history.replaceState({}, '', 'http://localhost:3000/#/store/orders')
    render(<App />)
    expect($$('.pill')[1].textContent).toContain('1') // Active
    fireEvent.click(within($('.order-card') as HTMLElement).getByRole('button', { name: /^✅ Accept$/ }))
    fireEvent.click(within($('.order-card') as HTMLElement).getByRole('button', { name: /Start preparing/ }))
    fireEvent.click(within($('.order-card') as HTMLElement).getByRole('button', { name: /Mark ready/ }))
    fireEvent.click(within($('.order-card') as HTMLElement).getByRole('button', { name: /Send out for delivery/ }))
    fireEvent.click(within($('.order-card') as HTMLElement).getByRole('button', { name: /Mark completed/ }))
    fireEvent.click($$('.pill')[2]) // Completed
    expect($$('.order-card').length).toBe(1)
    fireEvent.click($$('.pill')[1]) // Active
    expect(screen.getByText(/Nothing in this view/i)).toBeInTheDocument()
  })

  it('shows the empty state when there are no orders at all', () => {
    renderApp('http://localhost:3000/#/store/orders')
    expect(screen.getByText(/No orders yet/i)).toBeInTheDocument()
  })
})

describe('§10/§11 · Scenario A — table ordering', () => {
  it('the owner can create a QR per table', () => {
    renderApp('http://localhost:3000/#/store/qr')
    fireEvent.change(screen.getByPlaceholderText(/Table number/), { target: { value: '12' } })
    fireEvent.click(screen.getByRole('button', { name: /\+ Add table/ }))
    expect($$('.table-card').length).toBe(1)
    expect($('.table-label')!.textContent).toBe('Table 12')
    expect($('.table-url')!.textContent).toBe('?table=12')
  })

  it('rejects a duplicate table and sanitises the label', () => {
    renderApp('http://localhost:3000/#/store/qr')
    fireEvent.change(screen.getByPlaceholderText(/Table number/), { target: { value: '12' } })
    fireEvent.click(screen.getByRole('button', { name: /\+ Add table/ }))
    fireEvent.change(screen.getByPlaceholderText(/Table number/), { target: { value: '12' } })
    fireEvent.click(screen.getByRole('button', { name: /\+ Add table/ }))
    expect($$('.table-card').length).toBe(1)

    fireEvent.change(screen.getByPlaceholderText(/Table number/), { target: { value: '<b>7</b>' } })
    fireEvent.click(screen.getByRole('button', { name: /\+ Add table/ }))
    expect($$('.table-label').map(e => e.textContent)).toContain('Table b7b')
  })

  it('can add tables 1–8 in one go', () => {
    renderApp('http://localhost:3000/#/store/qr')
    fireEvent.click(screen.getByRole('button', { name: /Add 1–8/ }))
    expect($$('.table-card').length).toBe(8)
  })

  it('table QRs persist across a reload', () => {
    const r = renderApp('http://localhost:3000/#/store/qr')
    fireEvent.change(screen.getByPlaceholderText(/Table number/), { target: { value: '12' } })
    fireEvent.click(screen.getByRole('button', { name: /\+ Add table/ }))
    r.unmount()
    renderApp('http://localhost:3000/#/store/qr')
    expect($$('.table-card').length).toBe(1)
  })

  it('scanning a table QR carries the table all the way to the order', async () => {
    const url = 'http://localhost:3000/?store=fresh-bites&name=Fresh%20Bites&wa=15551234567&emoji=%F0%9F%8D%94&fee=2.99&table=12'
    const first = renderApp(url)
    expect($('.hero')!.textContent).toContain('Table 12')
    first.unmount()

    window.history.replaceState({}, '', url + '#/menu')
    const r = render(<App />)
    fireEvent.click($$('article.pcard button.quick-add')[0])
    await placeOrder()

    const wa = (globalThis as any).__opened as string[]
    const text = decodeURIComponent(wa[wa.length - 1].split('text=')[1])
    expect(text).toContain('Table: 12')
    expect(text).toContain('Dine-in')
    expect(text).not.toContain('42 Maple Ave')

    const saved = JSON.parse(localStorage.getItem('fb_orders')!)[0]
    expect(saved.channel).toBe('table')
    expect(saved.table).toBe('12')
    expect(saved.deliveryFee).toBe(0)
    r.unmount()
  })

  it('a table order charges no delivery fee', () => {
    renderApp('http://localhost:3000/?store=fresh-bites&name=Fresh%20Bites&wa=1&table=12#/menu')
    fireEvent.click($$('article.pcard button.quick-add')[0])
    fireEvent.click(screen.getByRole('button', { name: /Open cart/i }))
    const drawer = $('.drawer') as HTMLElement
    expect(drawer.textContent).toContain('table 12')
    expect(drawer.textContent).toContain('No delivery')
  })

  it('the customer can switch a table order back to delivery', () => {
    renderApp('http://localhost:3000/?store=fresh-bites&name=Fresh%20Bites&wa=1&table=12#/menu')
    fireEvent.click($$('article.pcard button.quick-add')[0])
    fireEvent.click(screen.getByRole('button', { name: /Open cart/i }))
    fireEvent.click(within($('.drawer') as HTMLElement).getByText('Switch to delivery'))
    expect($('.drawer')!.textContent).toContain('$2.99')
  })

  it('prints one tent per table', () => {
    renderApp('http://localhost:3000/#/store/qr')
    fireEvent.click(screen.getByRole('button', { name: /Add 1–8/ }))
    expect($$('.tent').length).toBe(8)
    expect($$('.tent-table').map(e => e.textContent)).toContain('Table 3')
  })
})

describe('§8 · Store settings', () => {
  it('closing the store blocks checkout', async () => {
    renderApp('http://localhost:3000/#/store/settings')
    fireEvent.click(screen.getByRole('switch', { name: /Store open/i }))
    expect(JSON.parse(localStorage.getItem('fb_store')!).open).toBe(false)

    window.history.replaceState({}, '', 'http://localhost:3000/#/menu')
    render(<App />)
    // adding is refused
    const before = localStorage.getItem('fb_cart')
    fireEvent.click($$('article.pcard button.quick-add')[0])
    expect(localStorage.getItem('fb_cart')).toBe(before)
    expect($('.topnav')!.textContent).toContain('Closed')
  })

  it('a closed store shows a clear message at checkout', () => {
    localStorage.setItem('fb_cart', JSON.stringify([{ id: 'smash', qty: 1 }]))
    localStorage.setItem('fb_store', JSON.stringify({
      slug: 'fresh-bites', name: 'Fresh Bites', tagline: 't', whatsapp: '15551234567',
      city: 'Downtown', address: '12 Market St', hours: '11:00 – 23:00', open: false,
      fee: 2.99, freeAt: 30, currency: '$', emoji: '🍔', accent: '#ff6a2b',
      heroImg: '', usdt: '', stats: { rating: '4.8★', reviews: 'r', delivery: '25 min' },
    }))
    renderApp('http://localhost:3000/#/checkout')
    expect(screen.getByText(/is closed/i)).toBeInTheDocument()
    expect($('.slide')).toBeNull()
  })

  it('validates the WhatsApp number', () => {
    renderApp('http://localhost:3000/#/store/settings')
    fireEvent.change(screen.getByPlaceholderText('15551234567'), { target: { value: '123' } })
    expect(screen.getByRole('alert').textContent).toMatch(/country code/i)
  })

  it('warns when the delivery fee exceeds the free threshold', () => {
    renderApp('http://localhost:3000/#/store/settings')
    fireEvent.change(screen.getByDisplayValue('2.99'), { target: { value: '50' } })
    expect(screen.getByRole('alert').textContent).toMatch(/threshold/i)
  })

  it('rejects a negative delivery fee', () => {
    renderApp('http://localhost:3000/#/store/settings')
    fireEvent.change(screen.getByDisplayValue('2.99'), { target: { value: '-4' } })
    expect(screen.getByRole('alert').textContent).toMatch(/positive number/i)
  })

  it('persists address and opening hours', () => {
    renderApp('http://localhost:3000/#/store/settings')
    fireEvent.change(screen.getByPlaceholderText('12 Market Street'), { target: { value: '9 Elm St' } })
    fireEvent.change(screen.getByPlaceholderText('11:00 – 23:00'), { target: { value: '09:00 – 21:00' } })
    const saved = JSON.parse(localStorage.getItem('fb_store')!)
    expect(saved.address).toBe('9 Elm St')
    expect(saved.hours).toBe('09:00 – 21:00')
  })

  it('the hours reach the customer-facing chrome', () => {
    renderApp('http://localhost:3000/#/store/settings')
    fireEvent.change(screen.getByPlaceholderText('11:00 – 23:00'), { target: { value: '09:00 – 21:00' } })
    fireEvent.click(screen.getByRole('button', { name: /View storefront/ }))
    expect($('.topnav')!.textContent).toContain('09:00 – 21:00')
    expect($('.footer')!.textContent).toContain('09:00 – 21:00')
  })
})

describe('§9 · Appearance & store preview', () => {
  it('changing the accent recolours the live preview', () => {
    renderApp('http://localhost:3000/#/store/appearance')
    fireEvent.click(screen.getByRole('button', { name: /Accent Leaf/ }))
    expect(document.documentElement.style.getPropertyValue('--accent')).toBe('#25d366')
    expect(JSON.parse(localStorage.getItem('fb_store')!).accent).toBe('#25d366')
  })

  it('changing the logo emoji updates the preview and the nav', () => {
    renderApp('http://localhost:3000/#/store/appearance')
    fireEvent.click(screen.getByRole('button', { name: /Use 🍕 as the logo/ }))
    expect($('.preview-mark')!.textContent).toBe('🍕')
  })

  it('the store preview shows the live name, tagline and prices', () => {
    renderApp('http://localhost:3000/#/store/appearance')
    const prev = $('.preview') as HTMLElement
    expect(prev.textContent).toContain('Fresh Bites')
    expect(prev.textContent).toContain('Kitchen + market, delivered')
    expect(prev.textContent).toContain('$12.90')
  })

  it('rejects a hero image URL that is not a URL', () => {
    renderApp('http://localhost:3000/#/store/appearance')
    fireEvent.change(screen.getByPlaceholderText('https://…/hero.jpg'), { target: { value: 'not-a-url' } })
    fireEvent.click(screen.getByRole('button', { name: /^Apply$/ }))
    expect(screen.getByRole('alert').textContent).toMatch(/http/i)
  })

  it('accepts a hero image and shows it in the preview', () => {
    renderApp('http://localhost:3000/#/store/appearance')
    fireEvent.change(screen.getByPlaceholderText('https://…/hero.jpg'), {
      target: { value: 'https://example.com/hero.jpg' },
    })
    fireEvent.click(screen.getByRole('button', { name: /^Apply$/ }))
    expect($('.preview-art img')!.getAttribute('src')).toBe('https://example.com/hero.jpg')
    expect(JSON.parse(localStorage.getItem('fb_store')!).heroImg).toBe('https://example.com/hero.jpg')
  })

  it('the headline numbers are owner-editable and reach the hero', () => {
    renderApp('http://localhost:3000/#/store/appearance')
    fireEvent.change(screen.getByDisplayValue('2,300+ reviews'), { target: { value: '120 reviews' } })
    fireEvent.click(screen.getByRole('button', { name: /View storefront/ }))
    expect($('.hero-stats')!.textContent).toContain('120 reviews')
  })
})

describe('§6/§7 · Product management (Scenario D)', () => {
  it('a featured product leads the home "Popular picks" rail', () => {
    renderApp('http://localhost:3000/#/store/menu')
    fireEvent.click(within($$('.prow')[2] as HTMLElement).getByRole('button', { name: /^Edit$/ }))
    const form = $('.pform') as HTMLElement
    fireEvent.click(within(form).getByRole('switch', { name: /Featured/ }))
    // Click the real button, not fireEvent.submit — that runs the browser's
    // constraint validation, which is what silently broke this form.
    fireEvent.click(within(form).getByRole('button', { name: /Save changes/ }))
    expect($('.pform')).toBeNull()
    expect($$('.tag-featured').length).toBe(1)

    fireEvent.click(screen.getByRole('button', { name: /View storefront/ }))
    const grid = $$('.section')[1].querySelector('.grid') as HTMLElement
    // First card title in the rail = the newly featured product.
    const titles = within(grid)
      .getAllByRole('button')
      .map(b => b.textContent!)
      .filter(t => t.length > 3)
    expect(titles[0]).toContain(CATALOG[2].name)
  })

  it('searching the owner product list works', () => {
    renderApp('http://localhost:3000/#/store/menu')
    fireEvent.change(screen.getByRole('textbox', { name: /Search menu products/i }), {
      target: { value: 'pizza' },
    })
    expect($$('.prow').length).toBe(1)
    expect($('.prow-main b')!.textContent).toContain('Pepperoni Supreme')
  })

  it('resetting the catalog restores the defaults', () => {
    renderApp('http://localhost:3000/#/store/menu')
    fireEvent.click(within($$('.prow')[0] as HTMLElement).getByRole('button', { name: /^Disable$/ }))
    expect(screen.getByRole('button', { name: /Reset catalog/ })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Reset catalog/ }))
    expect(screen.queryByRole('button', { name: /Reset catalog/ })).toBeNull()
    expect($$('.prow-status')[0].textContent).toBe('Available')
  })

  it('the market panel adds grocery items with a pack size', () => {
    renderApp('http://localhost:3000/#/store/grocery')
    fireEvent.click(screen.getByRole('button', { name: /\+ Add product/ }))
    const form = $('.pform') as HTMLFormElement
    fireEvent.change(within(form).getByPlaceholderText('Truffle Fries'), { target: { value: 'Oat Milk' } })
    fireEvent.change(within(form).getByPlaceholderText('7.50'), { target: { value: '2.4' } })
    expect(within(form).getByPlaceholderText('500 g')).toHaveValue('per item')
    fireEvent.submit(form)
    expect($('.prow-main b')!.textContent).toContain('Oat Milk')

    fireEvent.click(screen.getByRole('button', { name: /View storefront/ }))
    window.history.replaceState({}, '', 'http://localhost:3000/#/grocery')
    render(<App />)
    expect($$('article.pcard h3').map(h => h.textContent)).toContain('Oat Milk')
  })
})

describe('Phase 3 · regression: form submission must survive browser validation', () => {
  it('the price input accepts ordinary prices like 14.00 (no step grid)', () => {
    renderApp('http://localhost:3000/#/store/menu')
    fireEvent.click(within($$('.prow')[0] as HTMLElement).getByRole('button', { name: /^Edit$/ }))
    const form = $('.pform') as HTMLFormElement
    expect(form.checkValidity()).toBe(true)
    const price = within(form).getByPlaceholderText('7.50') as HTMLInputElement
    expect(price.value).toBe('12.9')
    expect(price.checkValidity()).toBe(true)
  })

  it('clicking "Save changes" on a $14.00 product actually saves', () => {
    renderApp('http://localhost:3000/#/store/menu')
    fireEvent.click(within($$('.prow')[2] as HTMLElement).getByRole('button', { name: /^Edit$/ }))
    const form = $('.pform') as HTMLFormElement
    fireEvent.change(within(form).getByPlaceholderText('7.50'), { target: { value: '15.75' } })
    expect(form.checkValidity()).toBe(true)
    fireEvent.click(within(form).getByRole('button', { name: /Save changes/ }))
    expect($('.pform')).toBeNull()
    expect($$('.prow-price')[2].textContent).toBe('$15.75')
  })

  it('clicking "+ Add product" actually adds', () => {
    renderApp('http://localhost:3000/#/store/menu')
    const before = $$('.prow').length
    fireEvent.click(screen.getByRole('button', { name: /\+ Add product/ }))
    const form = $('.pform') as HTMLFormElement
    fireEvent.change(within(form).getByPlaceholderText('Truffle Fries'), { target: { value: 'Truffle Fries' } })
    fireEvent.change(within(form).getByPlaceholderText('7.50'), { target: { value: '7.50' } })
    expect(form.checkValidity()).toBe(true)
    fireEvent.click(within(form).getByRole('button', { name: /\+ Add product/ }))
    expect($('.pform')).toBeNull()
    expect($$('.prow').length).toBe(before + 1)
    expect($('.prow-main b')!.textContent).toContain('Truffle Fries')
  })

  it('the settings number inputs have no step grid either', () => {
    renderApp('http://localhost:3000/#/store/settings')
    const fee = screen.getByDisplayValue('2.99') as HTMLInputElement
    expect(fee.checkValidity()).toBe(true)
    fireEvent.change(fee, { target: { value: '3.49' } })
    expect(fee.checkValidity()).toBe(true)
  })
})
