import type { Order } from '../types'

export interface Stage {
  key: string
  label: string
  icon: string
  at: number // seconds after order placed
}

export const STAGES: Stage[] = [
  { key: 'placed', label: 'Order placed', icon: '🧾', at: 0 },
  { key: 'confirmed', label: 'Confirmed', icon: '✅', at: 12 },
  { key: 'preparing', label: 'Preparing', icon: '👨‍🍳', at: 45 },
  { key: 'out', label: 'Out for delivery', icon: '🛵', at: 130 },
  { key: 'delivered', label: 'Delivered', icon: '🏠', at: 220 },
]

export const FINAL_AT = STAGES[STAGES.length - 1].at

export function stageOf(o: Order, now: number): number {
  const e = (now - o.ts) / 1000
  let s = 0
  for (let i = 0; i < STAGES.length; i++) if (e >= STAGES[i].at) s = i
  return s
}

/** 0..1 progress along the timeline */
export function progressOf(o: Order, now: number): number {
  return Math.min(1, Math.max(0, (now - o.ts) / 1000 / FINAL_AT))
}

export function etaText(o: Order, now: number): string {
  const s = stageOf(o, now)
  if (s >= STAGES.length - 1) return 'Delivered — enjoy! 🎉'
  const next = STAGES[s + 1].at - (now - o.ts) / 1000
  const mins = Math.max(1, Math.round(next / 60))
  return `Next: ${STAGES[s + 1].label} in ~${mins} min`
}
