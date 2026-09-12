import { useApp, OWNER_TABS } from '../../store'
import { cls } from '../../lib/util'
import type { OwnerTab } from '../../types'
import OverviewPanel from './OverviewPanel'
import OrdersPanel from './OrdersPanel'
import ProductsPanel from './ProductsPanel'
import QRPanel from './QRPanel'
import SettingsPanel from './SettingsPanel'
import AppearancePanel from './AppearancePanel'
import {
  Arrow,
  BasketIcon,
  ChartIcon,
  DishIcon,
  GearIcon,
  PaletteIcon,
  QrIcon,
  ReceiptIcon,
  StoreIcon,
} from '../icons'

const LABELS: Record<OwnerTab, { label: string; Icon: (p: { size?: number }) => React.ReactElement }> = {
  overview: { label: 'Overview', Icon: ChartIcon },
  orders: { label: 'Orders', Icon: ReceiptIcon },
  menu: { label: 'Menu', Icon: DishIcon },
  grocery: { label: 'Grocery', Icon: BasketIcon },
  qr: { label: 'QR Codes', Icon: QrIcon },
  settings: { label: 'Settings', Icon: GearIcon },
  appearance: { label: 'Appearance', Icon: PaletteIcon },
}

/** Sidebar grouping — the order inside each group is the tab order. */
const GROUPS: Array<{ title: string; tabs: OwnerTab[] }> = [
  { title: 'Store', tabs: ['overview', 'orders'] },
  { title: 'Catalog', tabs: ['menu', 'grocery'] },
  { title: 'Growth', tabs: ['qr'] },
  { title: 'Setup', tabs: ['settings', 'appearance'] },
]

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
 * Owner mode. Same brand identity as the storefront — same tokens, buttons and
 * cards — but its own shell: a grouped sidebar on desktop, a scrolling strip
 * on mobile, so a customer never feels like they are in a management app and
 * an owner never has to hunt.
 */
export default function OwnerView() {
  const { store, ownerTab, goOwner, go, setStore, toast, orders } = useApp()
  // `OWNER_TABS` is the canonical order; the sidebar renders the same tabs.
  void OWNER_TABS

  const toggleOpen = () => {
    const next = !store.open
    setStore({ ...store, open: next })
    toast(next ? 'Store is open — ordering is live' : 'Store closed — ordering is paused', next ? '🟢' : '🔴')
  }

  return (
    <div className="wrap page owner-page">
      <div className="owner-shell">
        <nav className="ownernav" aria-label="Owner">
          <span className="ownernav-brand">
            <StoreIcon size={15} />
            {store.name}
          </span>

          {GROUPS.map(g => (
            <div className="ownernav-group" key={g.title}>
              <span className="ownernav-title">{g.title}</span>
              {g.tabs.map(t => {
                const on = ownerTab === t
                const { label, Icon } = LABELS[t]
                return (
                  <button
                    key={t}
                    className={cls('ownertab', on && 'on')}
                    onClick={() => goOwner(t)}
                    aria-current={on ? 'page' : undefined}
                  >
                    <span className="ownertab-icon" aria-hidden>
                      <Icon size={17} />
                    </span>
                    {label}
                    {t === 'orders' && orders.length > 0 && (
                      <span className="ownertab-n" aria-hidden>
                        {orders.length}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          ))}

          <button className="ownernav-store" onClick={() => go('home')}>
            <Arrow size={14} /> View storefront
          </button>
        </nav>

        <div className="owner-main">
          <header className="page-head owner-head">
            <div className="page-head-copy">
              <span className="eyebrow">
                <span className={cls('dot-live', !store.open && 'off')} aria-hidden />
                Owner mode · demo data held in this browser
              </span>
              <h2>{TITLES[ownerTab].h}</h2>
              <p>{TITLES[ownerTab].p}</p>
            </div>
            <div className="owner-head-actions">
              <span className="owner-status">
                <span className={cls('dot-live', !store.open && 'off')} aria-hidden />
                {store.open ? `Taking orders · ${store.hours}` : 'Ordering paused'}
              </span>
              <button
                className={cls('btn btn-sm', store.open ? 'btn-ghost' : 'btn-primary')}
                onClick={toggleOpen}
                aria-pressed={!store.open}
              >
                {store.open ? 'Close store' : 'Open store'}
              </button>
            </div>
          </header>

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
      </div>
    </div>
  )
}
