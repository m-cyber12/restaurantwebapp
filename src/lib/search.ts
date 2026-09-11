import { CATEGORIES } from '../data'
import type { Item } from '../types'

/**
 * Case- and accent-insensitive fold, so "cafe" finds "Café" and
 * "PASTA" finds "pasta".
 */
export function fold(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

/**
 * Everything a product can be found by: its name, description, category
 * label, pack size and the "menu / market" kind. Plan §14 asks for names at
 * minimum and categories/descriptions where useful.
 */
export function haystack(item: Item): string {
  const cat = CATEGORIES.find(c => c.id === item.category)
  return fold(
    [
      item.name,
      item.desc,
      cat?.label ?? '',
      item.unit ?? '',
      item.kind === 'menu' ? 'restaurant menu food' : 'grocery market fresh',
    ]
      .filter(Boolean)
      .join(' ')
  )
}

const CATEGORY_CACHE = new Map<string, string>()
function categoryLabel(id: string): string {
  if (!CATEGORY_CACHE.has(id)) {
    CATEGORY_CACHE.set(id, fold(CATEGORIES.find(c => c.id === id)?.label ?? ''))
  }
  return CATEGORY_CACHE.get(id)!
}

/**
 * Relevance score. 0 means "no match". Every query word has to land somewhere
 * in the item — that keeps "chicken burger" from matching a plain "burger" —
 * but *where* it lands decides the order the results come back in, so an exact
 * name hit always outranks a passing mention in the description.
 */
export function score(item: Item, query: string): number {
  const q = fold(query).trim()
  if (!q) return 1
  const words = q.split(/\s+/).filter(Boolean)
  if (words.length === 0) return 1

  const name = fold(item.name)
  const desc = fold(item.desc)
  const cat = categoryLabel(item.category)
  const unit = fold(item.unit ?? '')

  let total = 0
  for (const w of words) {
    let s = 0
    if (name.includes(w)) s += 8
    if (cat.includes(w)) s += 5
    if (unit.includes(w)) s += 3
    if (s === 0 && desc.includes(w)) s += 1
    if (s === 0) return 0 // a word nothing matched: the item is out
    total += s
  }
  if (name === q) total += 20
  else if (name.startsWith(q)) total += 10
  return total
}

export function matchesQuery(item: Item, query: string): boolean {
  return score(item, query) > 0
}

/** Strength of the best match in an already-sorted result list. */
export function bestScore(list: Item[], query: string): number {
  return list.length ? score(list[0], query) : 0
}

/** Split a catalog into "matches this kind" and "matches the other kind", best first. */
export function searchCatalog(
  items: Item[],
  kind: Item['kind'],
  query: string
): { primary: Item[]; other: Item[] } {
  if (!fold(query).trim()) return { primary: [], other: [] }
  const primary: Array<[Item, number]> = []
  const other: Array<[Item, number]> = []
  for (const i of items) {
    const s = score(i, query)
    if (s <= 0) continue
    ;(i.kind === kind ? primary : other).push([i, s])
  }
  const sort = (xs: Array<[Item, number]>) =>
    xs.sort((a, b) => b[1] - a[1]).map(([i]) => i)
  return { primary: sort(primary), other: sort(other) }
}
