export const cls = (...xs: Array<string | false | null | undefined>) =>
  xs.filter(Boolean).join(' ')

export function money(n: number, sym = '$'): string {
  const s = n.toFixed(2)
  return sym === 'USDT' ? `USDT ${s}` : `${sym}${s}`
}

/** lighten (amt > 0) or darken (amt < 0) a #rrggbb hex color */
export function shade(hex: string, amt: number): string {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h
  const num = parseInt(full, 16)
  let r = (num >> 16) & 255
  let g = (num >> 8) & 255
  let b = num & 255
  const t = amt < 0 ? 0 : 255
  const p = Math.abs(amt)
  r = Math.round((t - r) * p) + r
  g = Math.round((t - g) * p) + g
  b = Math.round((t - b) * p) + b
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`
}

/**
 * Black or white text for a given background, by relative luminance.
 * The owner can pick any accent colour, so the label on top of it has to be
 * chosen rather than assumed.
 */
export function readableOn(hex: string): string {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h
  const num = parseInt(full, 16)
  if (!Number.isFinite(num)) return '#1a0c02'
  const r = (num >> 16) & 255
  const g = (num >> 8) & 255
  const b = num & 255
  const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
  return lum > 0.62 ? '#1a0c02' : '#fffaf5'
}

export function load<T>(key: string, fallback: T): T {
  try {
    const s = localStorage.getItem(key)
    return s ? (JSON.parse(s) as T) : fallback
  } catch {
    return fallback
  }
}

export function save(key: string, v: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(v))
  } catch {
    /* ignore */
  }
}

export function fmtTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function fmtDay(ts: number): string {
  return new Date(ts).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
}

export function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      // an apostrophe joins words ("Mama Rosa's" -> "mama-rosas"), it is not a separator
      .replace(/['\u2019`]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 48) || 'my-store'
  )
}

export function copyText(t: string): Promise<boolean> {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(t).then(() => true).catch(() => false)
  const ta = document.createElement('textarea')
  ta.value = t
  document.body.appendChild(ta)
  ta.select()
  let ok = false
  try {
    ok = document.execCommand('copy')
  } catch {
    ok = false
  }
  ta.remove()
  return Promise.resolve(ok)
}
