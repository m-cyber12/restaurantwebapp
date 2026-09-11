import type { Order, OrderStatus } from '../types'

export interface Stage {
  key: string
  label: string
  icon: string
  /** seconds after the order was placed — used by the demo clock */
  at: number
  /** the owner status that lands on this node */
  status: OrderStatus
}

/**
 * Five customer-facing nodes (plan §15). The visual timeline is unchanged from
 * the original design; what changed is that an owner action now drives it
 * instead of only the wall clock.
 */
export const STAGES: Stage[] = [
  { key: 'placed', label: 'Order placed', icon: '🧾', at: 0, status: 'new' },
  { key: 'confirmed', label: 'Accepted', icon: '✅', at: 12, status: 'accepted' },
  { key: 'preparing', label: 'Preparing', icon: '👨‍🍳', at: 45, status: 'preparing' },
  { key: 'out', label: 'Out for delivery', icon: '🛵', at: 130, status: 'ready' },
  { key: 'delivered', label: 'Delivered', icon: '🏠', at: 220, status: 'completed' },
]

export const FINAL_AT = STAGES[STAGES.length - 1].at

/** Which timeline node a given status sits on. `-1` = off the timeline. */
export const STATUS_NODE: Record<OrderStatus, number> = {
  new: 0,
  accepted: 1,
  preparing: 2,
  ready: 3,
  out: 3,
  completed: 4,
  cancelled: -1,
}

/** The statuses an owner can move an order through, in order (plan §5). */
export const OWNER_FLOW: Array<{ status: OrderStatus; label: string; icon: string }> = [
  { status: 'new', label: 'New', icon: '🧾' },
  { status: 'accepted', label: 'Accepted', icon: '✅' },
  { status: 'preparing', label: 'Preparing', icon: '👨‍🍳' },
  { status: 'ready', label: 'Ready', icon: '🔔' },
  { status: 'out', label: 'Out for delivery', icon: '🛵' },
  { status: 'completed', label: 'Completed', icon: '🏁' },
]

export const CANCEL_STATUS: OrderStatus = 'cancelled'

export function isCancelled(o: Order): boolean {
  return o.status === CANCEL_STATUS
}

export function statusLabel(o: Order): string {
  if (o.status) {
    const f = OWNER_FLOW.find(s => s.status === o.status)
    return f ? f.label : o.status === CANCEL_STATUS ? 'Cancelled' : 'New'
  }
  return 'New'
}

/** Current timeline index. Owner-set status wins; otherwise the demo clock. */
export function stageOf(o: Order, now: number): number {
  if (o.status) {
    const n = STATUS_NODE[o.status]
    if (n < 0) return 0
    return Math.max(0, Math.min(STAGES.length - 1, n))
  }
  const e = (now - o.ts) / 1000
  let s = 0
  for (let i = 0; i < STAGES.length; i++) if (e >= STAGES[i].at) s = i
  return s
}

/** 0..1 progress along the timeline */
export function progressOf(o: Order, now: number): number {
  if (isCancelled(o)) return 0
  if (o.status) return stageOf(o, now) / (STAGES.length - 1)
  return Math.min(1, Math.max(0, (now - o.ts) / 1000 / FINAL_AT))
}

export function etaText(o: Order, now: number): string {
  if (isCancelled(o)) return 'Cancelled — nothing is on the way.'
  const s = stageOf(o, now)
  if (s >= STAGES.length - 1) return 'Delivered — enjoy! 🎉'
  if (o.status) return `Now: ${STAGES[s].label}`
  const next = STAGES[s + 1].at - (now - o.ts) / 1000
  const mins = Math.max(1, Math.round(next / 60))
  return `Next: ${STAGES[s + 1].label} in ~${mins} min`
}
