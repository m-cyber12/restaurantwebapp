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
import type { CartLine, Item, Order, StoreConfig, ToastMsg, View } from './types'
import { load, save, shade, slugify } from './lib/util'
import { buildOrderMessage, waLink } from './lib/whatsapp'

const VIEWS: View[] = ['home', 'menu', 'grocery', 'checkout', 'track', 'store']

function viewFromHash(): View {
  const p = window.location.hash.replace(/^#\/?/, '').split('?')[0] as View
  return VIEWS.includes(p) ? p : 'home'
}

export function storeLink(store: StoreConfig): string {
  const p = new URLSearchParams()
  p.set('store', store.slug)
  p.set('name', store.name)
  p.set('wa', store.whatsapp)
  p.set('emoji', store.emoji)
  p.set('fee', String(store.fee))
  return `${window.location.origin}${window.location.pathname}?${p.toString()}`
}

function initStore(): StoreConfig {
  const p = new URLSearchParams(window.location.search)
  const slug = p.get('store')
  if (slug) {
    const fee = parseFloat(p.get('fee') || '')
    return {
      ...DEFAULT_STORE,
      slug,
      name: p.get('name') || DEFAULT_STORE.name,
      whatsapp: p.get('wa') || DEFAULT_STORE.whatsapp,
      emoji: p.get('emoji') || DEFAULT_STORE.emoji,
      fee: Number.isFinite(fee) ? fee : DEFAULT_STORE.fee,
    }
  }
  const saved = load<Partial<StoreConfig> | null>('fb_store', null)
  return { ...DEFAULT_STORE, ...(saved || {}) }
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

  store: StoreConfig
  setStore: (s: StoreConfig) => void
  link: string

  items: Item[]
  byId: (id: string) => Item | undefined

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
  }) => Order | null

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

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [store, setStoreState] = useState<StoreConfig>(initStore)
  const [view, setView] = useState<View>(viewFromHash)
  const [cart, setCart] = useState<CartLine[]>(() => load('fb_cart', [] as CartLine[]))
  const [favs, setFavs] = useState<string[]>(() => load('fb_favs', [] as string[]))
  const [orders, setOrders] = useState<Order[]>(() => load('fb_orders', [] as Order[]))
  const [focusId, setFocusId] = useState<string | null>(null)
  const [customItems, setCustomItems] = useState<Item[]>(() =>
    load(`fb_menu_${initStore().slug}`, [] as Item[])
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
  useEffect(() => save(`fb_menu_${store.slug}`, customItems), [store.slug, customItems])
  useEffect(() => save('fb_store', store), [store])

  // reload custom menu when store slug changes (QR with a different store)
  useEffect(() => {
    setCustomItems(load(`fb_menu_${store.slug}`, [] as Item[]))
  }, [store.slug])

  // store view mutates the menu directly — listen for that event
  useEffect(() => {
    const onMenuChanged = () =>
      setCustomItems(load(`fb_menu_${store.slug}`, [] as Item[]))
    window.addEventListener('fb-menu-changed', onMenuChanged)
    return () => window.removeEventListener('fb-menu-changed', onMenuChanged)
  }, [store.slug])

  // ── router ──────────────────────────────────────────────────
  useEffect(() => {
    const onHash = () => {
      const v = viewFromHash()
      setView(prev => (prev === v ? prev : v))
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const go = useCallback((v: View) => {
    setCartOpen(false)
    setModalId(null)
    const target = v === 'home' ? '#/' : `#/${v}`
    if (window.location.hash !== target) {
      window.location.hash = target
    }
    setView(v)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // ── live order simulation ───────────────────────────────────
  useEffect(() => {
    const anyActive = orders.some(o => Date.now() - o.ts < 240_000)
    if (!anyActive) return
    const t = setInterval(() => setTick(x => x + 1), 2000)
    return () => clearInterval(t)
  }, [orders])

  // ── data ────────────────────────────────────────────────────
  const items = useMemo(() => [...CATALOG, ...customItems], [customItems])
  const byId = useCallback((id: string) => items.find(i => i.id === id), [items])

  const cartCount = useMemo(() => cart.reduce((a, l) => a + l.qty, 0), [cart])
  const subtotal = useMemo(
    () => cart.reduce((a, l) => a + (byId(l.id)?.price ?? 0) * l.qty, 0),
    [cart, byId]
  )
  const deliveryFee = useMemo(
    () => (cart.length === 0 || subtotal >= store.freeAt ? 0 : store.fee),
    [cart.length, subtotal, store]
  )
  const total = subtotal + deliveryFee

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

  const addToCart = useCallback(
    (id: string, qty = 1) => {
      setCart(c => {
        const line = c.find(l => l.id === id)
        if (line) return c.map(l => (l.id === id ? { ...l, qty: l.qty + qty } : l))
        return [...c, { id, qty }]
      })
      toast(`${byId(id)?.name ?? 'Item'} added to cart`, '🛒')
    },
    [byId, toast]
  )

  const setQty = useCallback((id: string, qty: number) => {
    setCart(c =>
      qty <= 0
        ? c.filter(l => l.id !== id)
        : c.some(l => l.id === id)
          ? c.map(l => (l.id === id ? { ...l, qty } : l))
          : [...c, { id, qty }]
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
      const next = { ...s, slug: slugify(s.name || prev.name) }
      return next
    })
  }, [])

  const openItem = useCallback((id: string | null) => setModalId(id), [])

  const placeOrder = useCallback(
    (
      info: CustomerInfo & { when: string; payment: string; note: string; sendWA: boolean }
    ): Order | null => {
      if (cart.length === 0) return null
      const prefix =
        store.slug.replace(/[^a-z]/gi, '').slice(0, 2).toUpperCase() || 'FB'
      const order: Order = {
        id: `${prefix}-${1000 + Math.floor(Math.random() * 9000)}`,
        ts: Date.now(),
        lines: cart,
        subtotal,
        deliveryFee,
        total,
        name: info.name,
        phone: info.phone,
        address: `${info.address}, ${info.city}`,
        when: info.when,
        payment: info.payment,
        note: info.note,
        sentWhatsApp: info.sendWA,
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
    [cart, subtotal, deliveryFee, total, store, byId]
  )

  const link = useMemo(() => storeLink(store), [store])

  const value: Ctx = {
    view,
    go,
    store,
    setStore,
    link,
    items,
    byId,
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
