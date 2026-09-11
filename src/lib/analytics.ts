import type { Item, Order } from '../types'
import { isCancelled } from './order'

export interface DayStats {
  orders: number
  revenue: number
  pending: number
  avg: number
  items: number
}

const DAY = 86_400_000

/** True when `ts` falls on the same local calendar day as `now`. */
export function isToday(ts: number, now: number = Date.now()): boolean {
  const a = new Date(ts)
  const b = new Date(now)
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

/** True when the order still needs somebody's attention. */
export function isPending(o: Order): boolean {
  if (isCancelled(o)) return false
  if (o.status) return o.status !== 'completed'
  return Date.now() - o.ts < 240_000
}

/**
 * Headline numbers for the owner overview (plan §4).
 *
 * These are computed from the orders held in this browser's localStorage.
 * There is no backend, so the UI must not imply otherwise — `source` is
 * surfaced to the caller so it can label the panel honestly.
 */
export function dayStats(orders: Order[], now: number = Date.now()): DayStats {
  const todays = orders.filter(o => isToday(o.ts, now) && !isCancelled(o))
  const revenue = todays.reduce((a, o) => a + o.total, 0)
  return {
    orders: todays.length,
    revenue: Math.round(revenue * 100) / 100,
    pending: orders.filter(isPending).length,
    avg: todays.length ? Math.round((revenue / todays.length) * 100) / 100 : 0,
    items: todays.reduce((a, o) => a + o.lines.reduce((x, l) => x + l.qty, 0), 0),
  }
}

export interface ProductStat {
  id: string
  name: string
  qty: number
  revenue: number
}

/** Best sellers across all held orders. */
export function topProducts(
  orders: Order[],
  byId: (id: string) => Item | undefined,
  limit = 5
): ProductStat[] {
  const map = new Map<string, ProductStat>()
  for (const o of orders) {
    if (isCancelled(o)) continue
    for (const l of o.lines) {
      const item = byId(l.id)
      const name = item?.name ?? l.id
      const price = item?.price ?? 0
      const cur = map.get(l.id) ?? { id: l.id, name, qty: 0, revenue: 0 }
      cur.qty += l.qty
      cur.revenue += price * l.qty
      map.set(l.id, cur)
    }
  }
  return Array.from(map.values())
    .sort((a, b) => b.qty - a.qty)
    .slice(0, limit)
    .map(p => ({ ...p, revenue: Math.round(p.revenue * 100) / 100 }))
}

/** A 7-day revenue sparkline, oldest → newest. */
export function weekSeries(
  orders: Order[],
  now: number = Date.now()
): Array<{ label: string; value: number }> {
  const out: Array<{ label: string; value: number }> = []
  for (let i = 6; i >= 0; i--) {
    const day = now - i * DAY
    const total = orders
      .filter(o => !isCancelled(o) && isToday(o.ts, day))
      .reduce((a, o) => a + o.total, 0)
    out.push({
      label: new Date(day).toLocaleDateString([], { weekday: 'short' }),
      value: Math.round(total * 100) / 100,
    })
  }
  return out
}
