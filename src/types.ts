export type Kind = 'menu' | 'grocery'

export interface Category {
  id: string
  label: string
  emoji: string
  kind: Kind
}

export interface Item {
  id: string
  kind: Kind
  name: string
  desc: string
  price: number
  category: string
  img?: string
  emoji: string
  /** tile gradient colors (used when there is no photo) */
  g1?: string
  g2?: string
  unit?: string
  kcal?: number
  time?: string
  rating: number
  reviews: number
  popular?: boolean
  custom?: boolean
  /** Owner can take a product off the shelf without deleting it. Default true. */
  available?: boolean
  /** Owner-pinned to the "Popular picks" rail. */
  featured?: boolean
}

/**
 * Per-store menu customisations. Built-in catalog items are never mutated in
 * place: edits live in `overrides`, removals in `hidden`, and brand-new
 * products in `custom`. That keeps the shipped catalog intact and makes the
 * whole thing trivially replaceable by an API response later.
 */
export interface MenuState {
  v: 2
  custom: Item[]
  overrides: Record<string, Partial<Item>>
  hidden: string[]
}

export const EMPTY_MENU: MenuState = { v: 2, custom: [], overrides: {}, hidden: [] }

export interface CartLine {
  id: string
  qty: number
}

/** Owner-driven order lifecycle (plan §5). `stage` is the wall-clock demo
 *  fallback when no owner has touched the order. */
export type OrderStatus =
  | 'new'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'out'
  | 'completed'
  | 'cancelled'

export interface Order {
  id: string
  ts: number
  lines: CartLine[]
  subtotal: number
  deliveryFee: number
  total: number
  name: string
  phone: string
  address: string
  when: string
  payment: string
  note?: string
  sentWhatsApp: boolean
  /** Table the QR came from, when the order was placed at a table. */
  table?: string
  /** Dine-in at a table vs delivery. */
  channel?: 'delivery' | 'table'
  /** Set once the owner touches the order; until then the demo clock drives it. */
  status?: OrderStatus
  statusAt?: number
}

export interface StoreConfig {
  slug: string
  name: string
  tagline: string
  whatsapp: string
  city: string
  address: string
  /** "11:00 – 23:00" — shown in the nav, hero and footer. */
  hours: string
  /** Owner kill-switch: closes ordering across the whole storefront. */
  open: boolean
  fee: number
  freeAt: number
  currency: string
  emoji: string
  accent: string
  /** Optional hero photo URL; falls back to the built-in one. */
  heroImg: string
  /** USDT (TRC-20) address shown when that payment method is picked. */
  usdt: string
  /** Headline numbers on the home hero. Demo values until a real owner sets them. */
  stats: { rating: string; reviews: string; delivery: string }
}

export type View = 'home' | 'menu' | 'grocery' | 'checkout' | 'track' | 'store'

export type OwnerTab =
  | 'overview'
  | 'orders'
  | 'menu'
  | 'grocery'
  | 'qr'
  | 'settings'
  | 'appearance'

export interface ToastMsg {
  id: number
  text: string
  icon?: string
}
