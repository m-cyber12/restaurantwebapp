import { useState } from 'react'
import type { Item } from '../types'

/**
 * Item image with a crafted fallback tile.
 * Restaurant items use real photography; grocery items (or broken images)
 * render a premium gradient tile with the item emoji.
 */
export default function Img({
  item,
  className = '',
  eager = false,
}: {
  item: Item
  className?: string
  eager?: boolean
}) {
  const [failed, setFailed] = useState(false)

  if (item.img && !failed) {
    return (
      <img
        src={item.img}
        alt={item.name}
        loading={eager ? 'eager' : 'lazy'}
        className={`ft-img ${className}`}
        onError={() => setFailed(true)}
        draggable={false}
      />
    )
  }

  return (
    <div
      className={`ft-tile ${className}`}
      style={{
        background: `radial-gradient(130% 130% at 18% 8%, ${item.g1 || '#3a4152'} 0%, ${item.g2 || '#12151c'} 72%)`,
      }}
      aria-hidden
    >
      <span className="ft-tile-emoji">{item.emoji}</span>
      <span className="ft-tile-shine" />
    </div>
  )
}
