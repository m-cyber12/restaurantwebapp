import { AppProvider, useApp } from './store'
import TopNav from './components/TopNav'
import BottomNav from './components/BottomNav'
import Footer from './components/Footer'
import Home from './components/Home'
import CatalogView from './components/CatalogView'
import CheckoutView from './components/CheckoutView'
import TrackView from './components/TrackView'
import StoreView from './components/StoreView'
import CartDrawer from './components/CartDrawer'
import ItemModal from './components/ItemModal'
import Toasts from './components/Toasts'

function Shell() {
  const { view } = useApp()
  return (
    <div className="app">
      <TopNav />
      <main className="main" key={view}>
        {view === 'home' && <Home />}
        {view === 'menu' && <CatalogView kind="menu" />}
        {view === 'grocery' && <CatalogView kind="grocery" />}
        {view === 'checkout' && <CheckoutView />}
        {view === 'track' && <TrackView />}
        {view === 'store' && <StoreView />}
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
