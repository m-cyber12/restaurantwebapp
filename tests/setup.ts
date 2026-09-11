import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// ── jsdom does not implement canvas / matchMedia / IntersectionObserver ──
// The QR component renders through the `qrcode` package onto a <canvas>.
// We stub the 2d context so the real component code still runs (it calls
// getContext, then paints) without needing the native `canvas` module.

const paintCalls: string[] = []

function makeContext() {
  const noop = () => {}
  return new Proxy(
    {
      canvas: { width: 0, height: 0 },
      fillStyle: '#000',
      strokeStyle: '#000',
      lineWidth: 1,
      font: '',
      textAlign: 'left',
      textBaseline: 'top',
      getImageData: (x: number, y: number, w: number, h: number) => ({
        data: new Uint8ClampedArray(w * h * 4),
        width: w,
        height: h,
      }),
      putImageData: () => {
        paintCalls.push('putImageData')
      },
      createLinearGradient: () => ({ addColorStop: noop }),
      measureText: () => ({ width: 10 }),
      toDataURL: () => 'data:image/png;base64,stub',
    },
    {
      get(target, prop: string) {
        if (prop in target) return (target as any)[prop]
        return noop
      },
      set(target, prop: string, value) {
        ;(target as any)[prop] = value
        return true
      },
    }
  )
}

HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string) {
  if (type === '2d') {
    if (!(this as any).__ctx) {
      const ctx: any = makeContext()
      ctx.canvas = this
      ;(this as any).__ctx = ctx
    }
    return (this as any).__ctx
  }
  return null
} as any

HTMLCanvasElement.prototype.toDataURL = function () {
  return 'data:image/png;base64,stubbedqrpng'
} as any

// matchMedia — used for responsive branches if any are added
if (!window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as any
}

// window.open — WhatsApp links. Record instead of opening.
export const opened: string[] = []
beforeEach(() => {
  opened.length = 0
  window.open = ((url?: string) => {
    if (url) opened.push(url)
    return null
  }) as any
  localStorage.clear()
  window.location.hash = ''
  paintCalls.length = 0
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

// expose for assertions
;(globalThis as any).__paintCalls = paintCalls
;(globalThis as any).__opened = opened

// jsdom has no layout engine: scrollIntoView / scrollTo are undefined.
Element.prototype.scrollIntoView = function () {}
window.scrollTo = (() => {}) as any
