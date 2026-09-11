import { useApp, OWNER_TABS } from '../../store'
import { cls } from '../../lib/util'
import type { OwnerTab } from '../../types'
import OverviewPanel from './OverviewPanel'
import OrdersPanel from './OrdersPanel'
import ProductsPanel from './ProductsPanel'
import QRPanel from './QRPanel'
import SettingsPanel from './SettingsPanel'
import AppearancePanel from './AppearancePanel'
import { Arrow } from '../icons'

const LABELS: Record<OwnerTab, { label: string; icon: string }> = {
  overview: { label: 'Overview', icon: '📊' },
  orders: { label: 'Orders', icon: '🧾' },
  menu: { label: 'Menu', icon: '🍽️' },
  grocery: { label: 'Grocery', icon: '🛒' },
  qr: { label: 'QR Codes', icon: '🔳' },
  settings: { label: 'Settings', icon: '⚙️' },
  appearance: { label: 'Appearance', icon: '🎨' },
}

const TITLES: Record<OwnerTab, { h: string; p: string }> = {
  overview: { h: 'Overview', p: 'How your store is doing today.' },
  orders: { h: 'Orders', p: 'Accept, prepare and complete incoming orders.' },
  menu: { h: 'Menu', p: 'Restaurant dishes — add, edit, disable or remove.' },
  grocery: { h: 'Grocery', p: 'Market products — add, edit, disable or remove.' },
  qr: { h: 'QR Codes', p: 'Your storefront code, plus one per table.' },
  settings: { h: 'Store settings', p: 'Contact, delivery, hours and ordering status.' },
  appearance: { h: 'Appearance', p: 'Logo, accent colour, hero image and headline numbers.' },
}

/**
 * Owner mode (plan §3, §25). Same brand identity as the storefront — same
 * cards, buttons, pills and type — but its own navigation so a customer never
 * feels like they are inside a management app and an owner never has to hunt.
 */
export default function OwnerView() {
  const { store, ownerTab, goOwner, go, setStore, toast } = useApp()

  const toggleOpen = () => {
    const next = !store.open
    setStore({ ...store, open: next })
    toast(next ? 'Store is open — ordering is live' : 'Store closed — ordering is paused', next ? '🟢' : '🔴')
  }

  return (
    <div className="wrap page owner-page">
      <header className="page-head owner-head">
        <div>
          <span className="eyebrow">
            <span className={cls('dot-live', !store.open && 'off')} aria-hidden />
            Owner mode · demo data held in this browser
          </span>
          <h2>{TITLES[ownerTab].h}</h2>
          <p>{TITLES[ownerTab].p}</p>
        </div>
        <div className="owner-head-actions">
          <button
            className={cls('btn btn-sm', store.open ? 'btn-ghost' : 'btn-primary')}
            onClick={toggleOpen}
            aria-pressed={!store.open}
          >
            {store.open ? '🔴 Close store' : '🟢 Open store'}
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => go('home')}>
            View storefront <Arrow size={14} />
          </button>
        </div>
      </header>

      <nav className="ownernav" aria-label="Owner">
        {OWNER_TABS.map(t => (
          <button
            key={t}
            className={cls('ownertab', ownerTab === t && 'on')}
            onClick={() => goOwner(t)}
            aria-current={ownerTab === t ? 'page' : undefined}
          >
            <span className="ownertab-icon" aria-hidden>{LABELS[t].icon}</span>
            {LABELS[t].label}
          </button>
        ))}
      </nav>

      <div className="owner-body">
        {ownerTab === 'overview' && <OverviewPanel />}
        {ownerTab === 'orders' && <OrdersPanel />}
        {ownerTab === 'menu' && <ProductsPanel kind="menu" />}
        {ownerTab === 'grocery' && <ProductsPanel kind="grocery" />}
        {ownerTab === 'qr' && <QRPanel />}
        {ownerTab === 'settings' && <SettingsPanel />}
        {ownerTab === 'appearance' && <AppearancePanel />}
      </div>
    </div>
  )
}
