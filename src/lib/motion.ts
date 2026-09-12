/**
 * Motion primitives.
 *
 * One rule for everything in here: motion is an *enhancement*. If the browser
 * cannot observe the viewport, or the user asked the OS to reduce motion, every
 * hook below resolves to its end state immediately — content is never hidden
 * behind an animation that cannot run.
 *
 * Everything is built on IntersectionObserver / rAF / CSS custom properties.
 * There is no animation library: the whole motion system is ~200 lines and
 * costs nothing at runtime when it is not used.
 */
import { useEffect, useRef, useState } from 'react'

/** Does this environment support viewport observation at all? */
export const canObserve = (): boolean => typeof IntersectionObserver !== 'undefined'

/** Does the user want less motion? */
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/** Live subscription to the reduced-motion media query. */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(prefersReducedMotion)

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener?.('change', onChange)
    return () => mq.removeEventListener?.('change', onChange)
  }, [])

  return reduced
}

/**
 * True when it is safe (and welcome) to animate.
 *
 * Environments without IntersectionObserver — jsdom in tests, for instance —
 * report `false`, so anything gated on this shows its final state at once
 * instead of waiting for a callback that will never arrive.
 */
export function useMotionEnabled(): boolean {
  const reduced = usePrefersReducedMotion()
  const [observable, setObservable] = useState(canObserve)
  useEffect(() => setObservable(canObserve()), [])
  return !reduced && observable
}

/** Is this a device with a real pointer (hover + fine cursor)? */
export function useFinePointer(): boolean {
  const [fine, setFine] = useState(
    () =>
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(hover: hover) and (pointer: fine)').matches
  )
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)')
    const onChange = () => setFine(mq.matches)
    mq.addEventListener?.('change', onChange)
    return () => mq.removeEventListener?.('change', onChange)
  }, [])
  return fine
}

interface InViewOptions {
  /** Fired once and then detached, unless `once` is false. */
  once?: boolean
  rootMargin?: string
  threshold?: number | number[]
}

/**
 * Observe an element's entry into the viewport.
 * Returns `[ref, inView]`. Without an observer the element counts as in view
 * immediately, so reveal-on-scroll degrades to "already revealed".
 */
export function useInView<T extends Element = HTMLDivElement>(
  options: InViewOptions = {}
): [React.RefObject<T>, boolean] {
  const { once = true, rootMargin = '0px 0px -12% 0px', threshold = 0 } = options
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(!canObserve())

  useEffect(() => {
    if (!canObserve()) {
      setInView(true)
      return
    }
    const el = ref.current
    if (!el) return

    const io = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true)
            if (once) io.unobserve(entry.target)
          } else if (!once) {
            setInView(false)
          }
        }
      },
      { rootMargin, threshold }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [once, rootMargin, threshold])

  return [ref, inView]
}

/** 0 → 1 progress of the whole document scroll. */
export function useScrollProgress(): number {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let frame = 0
    const read = () => {
      frame = 0
      const doc = document.documentElement
      const max = doc.scrollHeight - doc.clientHeight
      setProgress(max > 0 ? Math.min(1, Math.max(0, doc.scrollTop / max)) : 0)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read)
    }
    read()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return progress
}

/** True once the page has been scrolled past `threshold` pixels. */
export function useScrolled(threshold = 10): boolean {
  const [past, setPast] = useState(false)
  useEffect(() => {
    let frame = 0
    const read = () => {
      frame = 0
      const y = window.scrollY || document.documentElement.scrollTop || 0
      setPast(y > threshold)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read)
    }
    read()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [threshold])
  return past
}

/**
 * Pointer parallax: writes `--px` / `--py` (-1 → 1) onto the target element so
 * children can translate by whatever factor they like, in pure CSS.
 * One rAF-throttled listener per element, pointer-events only, no scroll work.
 */
export function usePointerParallax<T extends HTMLElement>(enabled: boolean) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !enabled) return
    let frame = 0
    let nx = 0
    let ny = 0

    const apply = () => {
      frame = 0
      el.style.setProperty('--px', nx.toFixed(3))
      el.style.setProperty('--py', ny.toFixed(3))
    }
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      if (r.width === 0 || r.height === 0) return
      nx = ((e.clientX - r.left) / r.width) * 2 - 1
      ny = ((e.clientY - r.top) / r.height) * 2 - 1
      if (!frame) frame = requestAnimationFrame(apply)
    }
    const reset = () => {
      nx = 0
      ny = 0
      if (!frame) frame = requestAnimationFrame(apply)
    }

    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', reset)
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', reset)
      if (frame) cancelAnimationFrame(frame)
      el.style.removeProperty('--px')
      el.style.removeProperty('--py')
    }
  }, [enabled])

  return ref
}

/**
 * Which step block inside `container` currently owns the middle of the
 * viewport — the driver for sticky scroll storytelling.
 *
 * Every step just needs a `data-step="<index>"` attribute.
 */
export function useActiveStep<T extends HTMLElement>(
  enabled: boolean
): [React.RefObject<T>, number] {
  const ref = useRef<T>(null)
  const [active, setActive] = useState(0)

  useEffect(() => {
    const root = ref.current
    if (!root) return
    const steps = Array.from(root.querySelectorAll<HTMLElement>('[data-step]'))
    if (steps.length === 0) return
    if (!enabled || !canObserve()) {
      setActive(0)
      return
    }

    const io = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const i = Number((entry.target as HTMLElement).dataset.step)
          if (Number.isFinite(i)) setActive(i)
        }
      },
      // A band across the middle of the viewport: whichever step owns the
      // middle of the screen is the one we show.
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    )
    steps.forEach(s => io.observe(s))
    return () => io.disconnect()
  }, [enabled])

  return [ref, active]
}

/**
 * Scroll-linked 0 → 1 progress of a single element travelling through the
 * viewport. Used to draw a line as a section scrolls past.
 */
export function useElementProgress<T extends HTMLElement>(enabled: boolean) {
  const ref = useRef<T>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el || !enabled) {
      if (!enabled) setProgress(1)
      return
    }
    let frame = 0
    const read = () => {
      frame = 0
      const r = el.getBoundingClientRect()
      const vh = window.innerHeight || 1
      // 0 when the top edge enters, 1 when the bottom edge leaves.
      const p = (vh - r.top) / (vh + r.height)
      setProgress(Math.min(1, Math.max(0, p)))
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read)
    }
    read()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [enabled])

  return [ref, progress] as const
}

/**
 * The "added to cart" flight: a dot travels from the button to the cart.
 * Purely decorative feedback — the cart update itself is the store's job.
 * Skipped entirely for reduced motion / non-browser environments.
 */
export function flyToCart(from: Element, enabled: boolean) {
  if (!enabled || typeof document === 'undefined') return
  const target = document.querySelector('.cartbtn')
  const source = from.getBoundingClientRect()
  if (!target || source.width === 0) return
  const dest = target.getBoundingClientRect()
  if (dest.width === 0) return

  const dot = document.createElement('span')
  dot.className = 'fly-dot'
  dot.setAttribute('aria-hidden', 'true')
  dot.style.left = `${source.left + source.width / 2}px`
  dot.style.top = `${source.top + source.height / 2}px`
  dot.style.setProperty('--dx', `${dest.left + dest.width / 2 - (source.left + source.width / 2)}px`)
  dot.style.setProperty('--dy', `${dest.top + dest.height / 2 - (source.top + source.height / 2)}px`)
  document.body.appendChild(dot)

  const remove = () => dot.remove()
  dot.addEventListener('animationend', remove)
  // Safety net: never leave a node behind if the animation is cancelled.
  window.setTimeout(remove, 1200)
}
