import { useApp } from '../store'
import { cls } from '../lib/util'
import type { View } from '../types'

const TABS: Array<[View, string, string]> = [
  ['home', 'Home', '🏠'],
  ['menu', 'Menu', '🍔'],
  ['grocery', 'Market', '🛒'],
  ['track', 'Track', '🛵'],
  ['store', 'Owners', '🏪'],
]

export default function BottomNav() {
  const { view, go } = useApp()
  return (
    <nav className="bottomnav" aria-label="Mobile">
      {TABS.map(([v, label, icon]) => (
        <button
          key={v}
          className={cls('bn-item', view === v && 'on')}
          onClick={() => go(v)}
        >
          <span className="bn-icon">{icon}</span>
          <span className="bn-label">{label}</span>
        </button>
      ))}
    </nav>
  )
}
