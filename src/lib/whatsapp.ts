import type { Item, Order, StoreConfig } from '../types'
import { money } from './util'

export function waDigits(w: string): string {
  return w.replace(/[^\d]/g, '')
}

export function waLink(number: string, text: string): string {
  return `https://wa.me/${waDigits(number)}?text=${encodeURIComponent(text)}`
}

export function greetingLink(number: string, storeName: string): string {
  return waLink(
    number,
    `Hi ${storeName}! 👋 I'd like to place an order. 🍽️`
  )
}

function dotRow(label: string, value: string): string {
  const dots = Math.max(2, 26 - label.length - value.length)
  return `${label}${'.'.repeat(dots)} ${value}`
}

/** Build the clean, pre-formatted order message that lands on the restaurant's WhatsApp. */
export function buildOrderMessage(
  store: StoreConfig,
  o: Order,
  byId: (id: string) => Item | undefined
): string {
  const when = new Date(o.ts).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  const L: string[] = []
  L.push(`🍽️ *NEW ORDER — ${store.name}*`)
  L.push(`#${o.id}  ·  ${when}`)
  L.push('')
  L.push('— Your order —')
  for (const l of o.lines) {
    const it = byId(l.id)
    const unit = it?.unit ? ` (${it.unit})` : ''
    L.push(`• ${l.qty}× ${it?.name ?? l.id}${unit}  —  ${money((it?.price ?? 0) * l.qty, store.currency)}`)
  }
  L.push('')
  L.push(dotRow('Subtotal', money(o.subtotal, store.currency)))
  L.push(dotRow('Delivery', o.deliveryFee === 0 ? 'FREE' : money(o.deliveryFee, store.currency)))
  L.push(`*Total ${'.'.repeat(Math.max(2, 26 - 5 - money(o.total, store.currency).length))} ${money(o.total, store.currency)}*`)
  L.push('')
  L.push(`👤 ${o.name}`)
  L.push(`📞 ${o.phone}`)
  L.push(`📍 ${o.address}`)
  L.push(`🕒 ${o.when}`)
  L.push(`💵 ${o.payment}`)
  if (o.note) L.push(`📝 ${o.note}`)
  L.push('')
  L.push(`_Sent via ${store.name} QR ordering — please confirm._`)
  return L.join('\n')
}

export function statusLink(store: StoreConfig, order: Order): string {
  return waLink(
    store.whatsapp,
    `Hi ${store.name}! 👋 This is ${order.name} — checking on my order #${order.id}. Thanks!`
  )
}
