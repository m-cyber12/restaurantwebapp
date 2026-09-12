import React from 'react'
import { cls } from '../lib/util'
import { useInView } from '../lib/motion'

type Variant = 'up' | 'fade' | 'scale' | 'left' | 'right' | 'clip'

interface Props extends React.HTMLAttributes<HTMLElement> {
  /** Direction the element travels from. */
  variant?: Variant
  /** Stagger offset in ms — set per child, not per parent. */
  delay?: number
  /** Root margin for the observer; tighten to reveal later. */
  margin?: string
  as?: 'div' | 'section' | 'article' | 'li' | 'figure' | 'header' | 'aside' | 'span'
}

/**
 * Reveal-on-scroll wrapper. Adds `.in` once the element enters the viewport;
 * the CSS in `03-motion.css` does the actual work.
 *
 * Where IntersectionObserver is unavailable the element is revealed on mount,
 * so content can never get stuck invisible.
 */
export default function Reveal({
  variant = 'up',
  delay = 0,
  margin,
  as = 'div',
  className,
  style,
  children,
  ...rest
}: Props) {
  const [ref, inView] = useInView<HTMLDivElement>({
    once: true,
    rootMargin: margin ?? '0px 0px -10% 0px',
  })
  const Tag = as as React.ElementType

  return (
    <Tag
      {...rest}
      ref={ref}
      className={cls('reveal', `reveal-${variant}`, inView && 'in', className)}
      style={{ ...(delay ? ({ '--reveal-delay': `${delay}ms` } as React.CSSProperties) : null), ...style }}
    >
      {children}
    </Tag>
  )
}
