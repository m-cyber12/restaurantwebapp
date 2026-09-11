import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { CATALOG, DEFAULT_STORE } from './data'
import { EMPTY_MENU } from './types'
import type {
  CartLine,
  Item,
  MenuState,
  Order,
  OrderStatus,
  OwnerTab,
  StoreConfig,
  ToastMsg,
  View,
} from './types'
import { load, save, shade, slugify } from './lib/util'
import { buildOrderMessage, waDigits, waLink } from './lib/whatsapp'

const VIEWS: View[] = ['home', 'menu', 'grocery', 'checkout', 'track', 'store']

export const OWNER_TABS: OwnerTab[] = [
  'overview', 'orders', 'menu', 'grocery', 'qr', 'settings', 'appearance',
]

interface Route {
  view: View
  tab: OwnerTab
}

/** `#/store/orders` → owner mode, Orders panel. Anything unknown → home. */
function parseHash(): Route {
  const raw = window.location.hash.replace(/^#\/?/, '').split('?')[0]
  const [first, second] = raw.split('/')
  const view = VIEWS.includes(first as View) ? (first as View) : 'home'
  const tab =
    view === 'store' && OWNER_TABS.includes(second as OwnerTab)
      ? (second as OwnerTab)
      : 'overview'
  return { view, tab }
}

function viewFromHash(): View {
  return parseHash().view
}

// ── URL parameters ─────────────────────────────────────────────
// Plan §21: never trust query parameters. Everything a scanned QR can carry
// is validated and clamped here, in one place, before it reaches any state.

const MAX_SLUG = 48
const MAX_NAME = 60
const MAX_CITY = 40
const MAX_TABLE = 12

export function cleanSlug(raw: string | null): string | null {
  if (!raw) return null
  const s = raw.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '')
  return s ? s.slice(0, MAX_SLUG) : null
}

export function cleanName(raw: string | null, fallback: string): string {
  if (!raw) return fallback
  // strip control characters and any tag markup; React escapes on render, but
  // this keeps the persisted value clean too
  const s = raw.replace(/[<>]/g, '').replace(/[\u0000-\u001f\u007f]/g, '').trim()
  return s ? s.slice(0, MAX_NAME) : fallback
}

export function cleanText(raw: string | null, fallback: string, max: number): string {
  if (!raw) return fallback
  const s = raw.replace(/[<>]/g, '').replace(/[\u0000-\u001f\u007f]/g, '').trim()
  return s ? s.slice(0, max) : fallback
}

export function cleanTable(raw: string | null): string | null {
  if (!raw) return null
  const s = raw.replace(/[^A-Za-z0-9 -]/g, '').trim()
  return s ? s.slice(0, MAX_TABLE) : null
}

export function cleanFee(raw: string | null, fallback: number): number {
  const n = parseFloat(raw ?? '')
  return Number.isFinite(n) && n >= 0 && n <= 10_000 ? Math.round(n * 100) / 100 : fallback
}

/** Build the shareable / printable storefront URL, optionally for one table. */
export function storeLink(store: StoreConfig, table?: string | null): string {
  const p = new URLSearchParams()
  p.set('store', store.slug)
  p.set('name', store.name)
  p.set('wa', store.whatsapp)
  p.set('emoji', store.emoji)
  p.set('fee', String(store.fee))
  if (table) p.set('table', table)
  return `${window.location.origin}${window.location.pathname}?${p.toString()}`
}

interface Session {
  store: StoreConfig
  /** true when the storefront came from a scanned QR rather than the owner's own setup */
  scanned: boolean
  table: string | null
}

function initSession(): Session {
  const p = new URLSearchParams(window.location.search)
  const slug = cleanSlug(p.get('store'))
  if (slug) {
    return {
      scanned: true,
      table: cleanTable(p.get('table')),
      store: {
        ...DEFAULT_STORE,
        slug,
        name: cleanName(p.get('name'), DEFAULT_STORE.name),
        whatsapp: waDigits(p.get('wa') || '').slice(0, 15) || DEFAULT_STORE.whatsapp,
        emoji: cleanText(p.get('emoji'), DEFAULT_STORE.emoji, 8),
        city: cleanText(p.get('city'), DEFAULT_STORE.city, MAX_CITY),
        fee: cleanFee(p.get('fee'), DEFAULT_STORE.fee),
      },
    }
  }
  const saved = load<Partial<StoreConfig> | null>('fb_store', null)
  return {
    scanned: false,
    table: cleanTable(p.get('table')),
    store: { ...DEFAULT_STORE, ...(saved || {}), stats: { ...DEFAULT_STORE.stats, ...(saved?.stats || {}) } },
  }
}

// ── per-store menu ─────────────────────────────────────────────
const menuKey = (slug: string) => `fb_menu_${slug}`

/** Reads a store's menu, migrating the pre-v2 (plain array) shape if present. */
export function readMenu(slug: string): MenuState {
  const raw = load<MenuState | Item[] | null>(menuKey(slug), null)
  if (!raw) return { ...EMPTY_MENU }
  if (Array.isArray(raw)) return { v: 2, custom: raw as Item[], overrides: {}, hidden: [] }
  if (raw.v === 2) {
    return {
      v: 2,
      custom: Array.isArray(raw.custom) ? raw.custom : [],
      overrides: raw.overrides && typeof raw.overrides === 'object' ? raw.overrides : {},
      hidden: Array.isArray(raw.hidden) ? raw.hidden : [],
    }
  }
  return { ...EMPTY_MENU }
}

export interface CustomerInfo {
  name: string
  phone: string
  address: string
  city: string
}

interface Ctx {
  view: View
  go: (v: View) => void
  /** Active owner panel while `view === 'store'`. */
  ownerTab: OwnerTab
  goOwner: (t: OwnerTab) => void

  store: StoreConfig
  setStore: (s: StoreConfig) => void
  /** The storefront was opened from a scanned QR, not the owner's own setup. */
  scanned: boolean
  /** Table from the scanned QR (plan §11 — must survive to the order). */
  table: string | null
  setTable: (t: string | null) => void
  link: string
  tableLink: (table: string) => string

  /** Everything the owner manages, including switched-off products. */
  catalog: Item[]
  /** Customer-visible catalog: built-ins minus hidden, plus custom, minus unavailable. */
  items: Item[]
  byId: (id: string) => Item | undefined

  menu: MenuState
  addItem: (item: Omit<Item, 'id'> & { id?: string }) => Item
  updateItem: (id: string, patch: Partial<Item>) => void
  removeItem: (id: string) => void
  resetMenu: () => void

  /** Tables that have their own QR code (plan §10). */
  tables: string[]
  addTable: (label: string) => boolean
  removeTable: (label: string) => void

  cart: CartLine[]
  cartCount: number
  subtotal: number
  deliveryFee: number
  total: number
  addToCart: (id: string, qty?: number) => void
  setQty: (id: string, qty: number) => void
  removeLine: (id: string) => void
  clearCart: () => void

  favs: string[]
  toggleFav: (id: string) => void

  orders: Order[]
  focusId: string | null
  setFocusId: (id: string | null) => void
  placeOrder: (info: CustomerInfo & {
    when: string
    payment: string
    note: string
    sendWA: boolean
    channel?: 'delivery' | 'table'
  }) => Order | null
  setOrderStatus: (id: string, status: OrderStatus) => void
  removeOrder: (id: string) => void

  toasts: ToastMsg[]
  toast: (text: string, icon?: string) => void

  cartOpen: boolean
  setCartOpen: (b: boolean) => void
  modalId: string | null
  openItem: (id: string | null) => void
  search: string
  setSearch: (s: string) => void
  catFilter: string | null
  setCatFilter: (c: string | null) => void

  tick: number
}

const AppCtx = createContext<Ctx | null>(null)

export function useApp(): Ctx {
  const c = useContext(AppCtx)
  if (!c) throw new Error('useApp outside provider')
  return c
}

let toastSeq = 1
let customSeq = 0

export function AppProvider({ children }: { children: React.ReactNode }) {
  const session = useRef<Session>(null as unknown as Session)
  if (session.current === null) session.current = initSession()

  const [store, setStoreState] = useState<StoreConfig>(session.current.store)
  const scanned = session.current.scanned
  const [table, setTable] = useState<string | null>(session.current.table)
  const [view, setView] = useState<View>(viewFromHash)
  const [ownerTab, setOwnerTab] = useState<OwnerTab>(() => parseHash().tab)
  const [cart, setCart] = useState<CartLine[]>(() => load('fb_cart', [] as CartLine[]))
  const [favs, setFavs] = useState<string[]>(() => load('fb_favs', [] as string[]))
  const [orders, setOrders] = useState<Order[]>(() => load('fb_orders', [] as Order[]))
  const [focusId, setFocusId] = useState<string | null>(null)
  const [menu, setMenu] = useState<MenuState>(() => readMenu(session.current.store.slug))
  const [tables, setTables] = useState<string[]>(() =>
    load(`fb_tables_${session.current.store.slug}`, [] as string[])
  )
  const [toasts, setToasts] = useState<ToastMsg[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [modalId, setModalId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState<string | null>(null)
  const [tick, setTick] = useState(0)
  const toastTimers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map())

  // ── accent theme ────────────────────────────────────────────
  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--accent', store.accent)
    root.style.setProperty('--accent2', shade(store.accent, 0.42))
  }, [store.accent])

  // ── persistence ─────────────────────────────────────────────
  useEffect(() => save('fb_cart', cart), [cart])
  useEffect(() => save('fb_favs', favs), [favs])
  useEffect(() => save('fb_orders', orders.slice(0, 30)), [orders])
  useEffect(() => save(menuKey(store.slug), menu), [store.slug, menu])
  // A customer who scans somebody else's QR must not overwrite the owner's
  // own saved store settings with the URL-derived subset.
  useEffect(() => {
    if (!scanned) save('fb_store', store)
  }, [store, scanned])

  // Reload per-store data when a different store's QR is opened.
  useEffect(() => {
    setMenu(readMenu(store.slug))
    setTables(load(`fb_tables_${store.slug}`, [] as string[]))
  }, [store.slug])

  useEffect(() => save(`fb_tables_${store.slug}`, tables), [store.slug, tables])

  // ── router ──────────────────────────────────────────────────
  useEffect(() => {
    const onHash = () => {
      const r = parseHash()
      setView(prev => (prev === r.view ? prev : r.view))
      setOwnerTab(prev => (prev === r.tab ? prev : r.tab))
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const navigate = useCallback((target: string, v: View, t?: OwnerTab) => {
    setCartOpen(false)
    setModalId(null)
    if (window.location.hash !== target) window.location.hash = target
    setView(v)
    if (t) setOwnerTab(t)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const go = useCallback(
    (v: View) => navigate(v === 'home' ? '#/' : `#/${v}`, v),
    [navigate]
  )

  const goOwner = useCallback(
    (t: OwnerTab) => navigate(`#/store/${t}`, 'store', t),
    [navigate]
  )

  // ── live order simulation ───────────────────────────────────
  useEffect(() => {
    const anyActive = orders.some(o => Date.now() - o.ts < 240_000)
    if (!anyActive) return
    const t = setInterval(() => setTick(x => x + 1), 2000)
    return () => clearInterval(t)
  }, [orders])

  // ── data ────────────────────────────────────────────────────
  const catalog = useMemo(() => {
    const builtIn = CATALOG.filter(i => !menu.hidden.includes(i.id)).map(i =>
      menu.overrides[i.id] ? { ...i, ...menu.overrides[i.id] } : i
    )
    return [...builtIn, ...menu.custom]
  }, [menu])

  const items = useMemo(
    () => catalog.filter(i => i.available !== false),
    [catalog]
  )

  const byId = useCallback((id: string) => catalog.find(i => i.id === id), [catalog])

  const cartCount = useMemo(() => cart.reduce((a, l) => a + l.qty, 0), [cart])
  const subtotal = useMemo(
    () => cart.reduce((a, l) => a + (byId(l.id)?.price ?? 0) * l.qty, 0),
    [cart, byId]
  )
  const deliveryFee = useMemo(
    // Dine-in at a table is never charged delivery.
    () => (cart.length === 0 || table ? 0 : subtotal >= store.freeAt ? 0 : store.fee),
    [cart.length, subtotal, store, table]
  )
  const total = subtotal + deliveryFee

  // ── menu management (the single write path for products) ────
  const addItem = useCallback(
    (item: Omit<Item, 'id'> & { id?: string }): Item => {
      const created: Item = {
        ...item,
        id: item.id || `c${Date.now().toString(36)}${(customSeq++).toString(36)}`,
        custom: true,
      }
      setMenu(m => ({ ...m, custom: [created, ...m.custom] }))
      return created
    },
    []
  )

  const updateItem = useCallback((id: string, patch: Partial<Item>) => {
    setMenu(m => {
      if (m.custom.some(i => i.id === id)) {
        return {
          ...m,
          custom: m.custom.map(i => (i.id === id ? { ...i, ...patch, id } : i)),
        }
      }
      return { ...m, overrides: { ...m.overrides, [id]: { ...m.overrides[id], ...patch } } }
    })
  }, [])

  const removeItem = useCallback((id: string) => {
    setMenu(m =>
      m.custom.some(i => i.id === id)
        ? { ...m, custom: m.custom.filter(i => i.id !== id) }
        : { ...m, hidden: m.hidden.includes(id) ? m.hidden : [...m.hidden, id] }
    )
  }, [])

  const resetMenu = useCallback(() => setMenu({ ...EMPTY_MENU }), [])

  // ── table QR codes (plan §10) ───────────────────────────────
  const addTable = useCallback((label: string): boolean => {
    const clean = cleanTable(label)
    if (!clean) return false
    let added = false
    setTables(ts => {
      if (ts.some(t => t.toLowerCase() === clean.toLowerCase())) return ts
      added = true
      return [...ts, clean].slice(0, 100)
    })
    return added || !tables.some(t => t.toLowerCase() === clean.toLowerCase())
  }, [tables])

  const removeTable = useCallback((label: string) => {
    setTables(ts => ts.filter(t => t !== label))
  }, [])

  // ── actions ─────────────────────────────────────────────────
  const toast = useCallback((text: string, icon?: string) => {
    const id = toastSeq++
    setToasts(ts => [...ts.slice(-2), { id, text, icon }])
    const timer = setTimeout(() => {
      setToasts(ts => ts.filter(t => t.id !== id))
      toastTimers.current.delete(id)
    }, 2600)
    toastTimers.current.set(id, timer)
  }, [])

  useEffect(
    () => () => {
      toastTimers.current.forEach(t => clearTimeout(t))
      toastTimers.current.clear()
    },
    []
  )

  const addToCart = useCallback(
    (id: string, qty = 1) => {
      if (byId(id)?.available === false) return
      if (!store.open) {
        toast(`${store.name} is closed right now`, '🔴')
        return
      }
      setCart(c => {
        const line = c.find(l => l.id === id)
        if (line) return c.map(l => (l.id === id ? { ...l, qty: l.qty + qty } : l))
        return [...c, { id, qty }]
      })
      toast(`${byId(id)?.name ?? 'Item'} added to cart`, '🛒')
    },
    [byId, toast, store.open, store.name]
  )

  const setQty = useCallback((id: string, qty: number) => {
    const safe = Math.max(0, Math.min(99, Math.floor(qty) || 0))
    setCart(c =>
      safe <= 0
        ? c.filter(l => l.id !== id)
        : c.some(l => l.id === id)
          ? c.map(l => (l.id === id ? { ...l, qty: safe } : l))
          : [...c, { id, qty: safe }]
    )
  }, [])

  const removeLine = useCallback(
    (id: string) => setCart(c => c.filter(l => l.id !== id)),
    []
  )

  const clearCart = useCallback(() => setCart([]), [])

  const toggleFav = useCallback(
    (id: string) => {
      setFavs(f => {
        const on = f.includes(id)
        if (!on) toast('Saved to favorites', '♥')
        return on ? f.filter(x => x !== id) : [...f, id]
      })
    },
    [toast]
  )

  const setStore = useCallback((s: StoreConfig) => {
    setStoreState(prev => {
      const nextSlug = slugify(s.name || prev.name)
      return { ...s, slug: nextSlug }
    })
  }, [])

  const openItem = useCallback((id: string | null) => setModalId(id), [])

  const placeOrder = useCallback(
    (
      info: CustomerInfo & {
        when: string
        payment: string
        note: string
        sendWA: boolean
        channel?: 'delivery' | 'table'
      }
    ): Order | null => {
      const lines = cart.filter(l => byId(l.id))
      if (lines.length === 0 || !store.open) return null
      const prefix =
        store.slug.replace(/[^a-z]/gi, '').slice(0, 2).toUpperCase() || 'FB'
      const channel = info.channel ?? (table ? 'table' : 'delivery')
      const order: Order = {
        id: `${prefix}-${1000 + Math.floor(Math.random() * 9000)}`,
        ts: Date.now(),
        lines,
        subtotal,
        deliveryFee,
        total,
        name: info.name,
        phone: info.phone,
        address: info.address ? `${info.address}, ${info.city}`.replace(/,\s*$/, '') : info.city,
        when: info.when,
        payment: info.payment,
        note: info.note,
        sentWhatsApp: info.sendWA,
        channel,
        table: channel === 'table' ? table ?? undefined : undefined,
      }
      setOrders(o => [order, ...o])
      setFocusId(order.id)
      setCart([])
      setCartOpen(false)
      if (info.sendWA) {
        window.open(waLink(store.whatsapp, buildOrderMessage(store, order, byId)), '_blank', 'noopener')
      }
      return order
    },
    [cart, subtotal, deliveryFee, total, store, byId, table]
  )

  const setOrderStatus = useCallback((id: string, status: OrderStatus) => {
    setOrders(os =>
      os.map(o => (o.id === id ? { ...o, status, statusAt: Date.now() } : o))
    )
  }, [])

  const removeOrder = useCallback((id: string) => {
    setOrders(os => os.filter(o => o.id !== id))
    setFocusId(f => (f === id ? null : f))
  }, [])

  const link = useMemo(() => storeLink(store), [store])
  const tableLink = useCallback((t: string) => storeLink(store, t), [store])

  const value: Ctx = {
    view,
    go,
    ownerTab,
    goOwner,
    store,
    setStore,
    scanned,
    table,
    setTable,
    link,
    tableLink,
    catalog,
    items,
    byId,
    menu,
    addItem,
    updateItem,
    removeItem,
    resetMenu,
    tables,
    addTable,
    removeTable,
    cart,
    cartCount,
    subtotal,
    deliveryFee,
    total,
    addToCart,
    setQty,
    removeLine,
    clearCart,
    favs,
    toggleFav,
    orders,
    focusId,
    setFocusId,
    placeOrder,
    setOrderStatus,
    removeOrder,
    toasts,
    toast,
    cartOpen,
    setCartOpen,
    modalId,
    openItem,
    search,
    setSearch,
    catFilter,
    setCatFilter,
    tick,
  }

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>
}
