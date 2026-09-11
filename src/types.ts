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
}

export interface CartLine {
  id: string
  qty: number
}

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
}

export interface StoreConfig {
  slug: string
  name: string
  tagline: string
  whatsapp: string
  city: string
  fee: number
  freeAt: number
  currency: string
  emoji: string
  accent: string
}

export type View = 'home' | 'menu' | 'grocery' | 'checkout' | 'track' | 'store'

export interface ToastMsg {
  id: number
  text: string
  icon?: string
}
