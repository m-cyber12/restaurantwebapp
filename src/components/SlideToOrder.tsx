import { useRef, useState } from 'react'
import { cls } from '../lib/util'

interface Props {
  onDone: () => void
  disabled?: boolean
}

/** The signature interaction: drag the plate to the right to fire the order. */
export default function SlideToOrder({ onDone, disabled }: Props) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [x, setX] = useState(0)
  const [drag, setDrag] = useState(false)
  const [done, setDone] = useState(false)
  const [hint, setHint] = useState(false)
  const startX = useRef(0)
  const max = () => {
    const t = trackRef.current
    if (!t) return 200
    return t.clientWidth - 76
  }

  const onPointerDown = (e: React.PointerEvent) => {
    if (disabled || done) return
    setDrag(true)
    setHint(false)
    startX.current = e.clientX - x
    ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag || disabled) return
    setX(Math.min(max(), Math.max(0, e.clientX - startX.current)))
  }
  const onPointerUp = () => {
    if (!drag) return
    setDrag(false)
    if (x > max() - 48 && !disabled) {
      setX(max())
      setDone(true)
      setTimeout(onDone, 320)
    } else {
      setX(0)
    }
  }

  const armed = x > max() - 48
  const pct = max() ? (x / max()) * 100 : 0

  return (
    <div
      ref={trackRef}
      className={cls('slide', disabled && 'off', done && 'done')}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label={disabled ? 'Fill in your details to place the order' : 'Slide to place your order'}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={e => {
        if ((e.key === 'Enter' || e.key === ' ') && !disabled && !done) {
          e.preventDefault()
          setDone(true)
          setTimeout(onDone, 320)
        }
      }}
      onTouchStart={() => disabled && setHint(true)}
    >
      <div className="slide-fill" style={{ width: `${done ? 100 : pct}%` }} />
      <span className="slide-label">
        {done
          ? 'Order placed! 🎉'
          : disabled
            ? 'Fill your details to order'
            : armed
              ? 'Release to order'
              : 'Slide to place your order'}
      </span>
      {hint && !disabled && null}
      <div
        className="slide-handle"
        style={{ transform: `translateX(${x}px)`, transition: drag ? 'none' : 'transform .45s cubic-bezier(.22,1,.36,1)' }}
      >
        {done ? '✅' : '🛵'}
      </div>
    </div>
  )
}
