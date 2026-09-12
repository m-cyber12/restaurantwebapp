import { AppProvider, useApp } from './store'
import TopNav from './components/TopNav'
import BottomNav from './components/BottomNav'
import Footer from './components/Footer'
import Home from './components/home/Home'
import CatalogView from './components/CatalogView'
import CheckoutView from './components/CheckoutView'
import TrackView from './components/TrackView'
import OwnerView from './components/owner/OwnerView'
import CartDrawer from './components/CartDrawer'
import ItemModal from './components/ItemModal'
import Toasts from './components/Toasts'

function Shell() {
  const { view } = useApp()

  /**
   * Skip link as a button, not an `href="#main"` anchor: the router owns the
   * hash, so an anchor would fight it (and read as a dead route). Focusing
   * <main> is what a skip link is actually for.
   */
  const skip = () => {
    const main = document.getElementById('main')
    if (!main) return
    main.setAttribute('tabindex', '-1')
    main.focus({ preventScroll: true })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="app" data-view={view}>
      <button className="skip-link" onClick={skip}>
        Skip to content
      </button>
      <TopNav />
      {/* `key` remounts on route change so the page transition replays */}
      <main className="main" id="main" key={view}>
        {view === 'home' && <Home />}
        {view === 'menu' && <CatalogView kind="menu" />}
        {view === 'grocery' && <CatalogView kind="grocery" />}
        {view === 'checkout' && <CheckoutView />}
        {view === 'track' && <TrackView />}
        {view === 'store' && <OwnerView />}
      </main>
      <Footer />
      <BottomNav />
      <CartDrawer />
      <ItemModal />
      <Toasts />
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  )
}
