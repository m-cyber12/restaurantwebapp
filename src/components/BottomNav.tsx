import { useApp } from '../store'
import { cls } from '../lib/util'
import { BasketIcon, DishIcon, HomeIcon, ScooterIcon, StoreIcon } from './icons'
import type { View } from '../types'

const TABS: Array<{ view: View; label: string; Icon: (p: { size?: number }) => React.ReactElement }> = [
  { view: 'home', label: 'Home', Icon: HomeIcon },
  { view: 'menu', label: 'Menu', Icon: DishIcon },
  { view: 'grocery', label: 'Market', Icon: BasketIcon },
  { view: 'track', label: 'Track', Icon: ScooterIcon },
  { view: 'store', label: 'Manage', Icon: StoreIcon },
]

/**
 * Mobile navigation, designed as its own thing rather than a collapsed
 * desktop bar: a floating thumb-reach dock with five equal targets, an
 * animated active state and safe-area padding.
 *
 * Owner mode gets its own nav strip, so the customer dock steps aside
 * instead of stacking two competing navigations on one screen.
 */
export default function BottomNav() {
  const { view, go } = useApp()
  if (view === 'store') return null

  return (
    <nav className="bottomnav" aria-label="Mobile">
      {TABS.map(({ view: v, label, Icon }) => {
        const on = view === v
        return (
          <button
            key={v}
            className={cls('bn-item', on && 'on')}
            onClick={() => go(v)}
            aria-current={on ? 'page' : undefined}
          >
            <span className="bn-icon" aria-hidden>
              <Icon size={21} />
            </span>
            <span className="bn-label">{label}</span>
            <span className="bn-dot" aria-hidden />
          </button>
        )
      })}
    </nav>
  )
}
