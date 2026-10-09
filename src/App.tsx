import { Route, Routes, useLocation } from 'react-router-dom';
import { CartDrawer } from './components/CartDrawer';
import { ConsentBanner } from './components/ConsentBanner';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { PrototypeBar } from './components/PrototypeBar';
import { ScrollToTop } from './components/ScrollToTop';
import { CartProvider } from './lib/cart';
import { ConsentProvider } from './lib/consent';
import About from './pages/About';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Contact from './pages/Contact';
import Faq from './pages/Faq';
import Home from './pages/Home';
import Legal from './pages/Legal';
import NotFound from './pages/NotFound';
import OrderConfirmation from './pages/OrderConfirmation';
import ProductPage from './pages/Product';
import Quiz from './pages/Quiz';
import Result from './pages/Result';
import Shop from './pages/Shop';

export default function App() {
  const { pathname } = useLocation();
  // Der Duftfinder läuft fokussiert, ohne Shop-Navigation und Footer.
  const focused = pathname === '/duftfinder';

  return (
    <ConsentProvider>
      <CartProvider>
        <ScrollToTop />
        <a href="#main" className="skip-link">
          Zum Inhalt springen
        </a>
        {!focused && <PrototypeBar />}
        {!focused && <Header />}
        <main id="main" key={pathname} className="page-enter">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/duftfinder" element={<Quiz />} />
            <Route path="/duftfinder/ergebnis" element={<Result />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/shop/:slug" element={<ProductPage />} />
            <Route path="/philosophie" element={<About />} />
            <Route path="/faq" element={<Faq />} />
            <Route path="/kontakt" element={<Contact />} />
            <Route path="/warenkorb" element={<Cart />} />
            <Route path="/kasse" element={<Checkout />} />
            <Route path="/bestellung" element={<OrderConfirmation />} />
            <Route path="/impressum" element={<Legal page="impressum" />} />
            <Route path="/datenschutz" element={<Legal page="datenschutz" />} />
            <Route path="/widerruf" element={<Legal page="widerruf" />} />
            <Route path="/versand" element={<Legal page="versand" />} />
            <Route path="/agb" element={<Legal page="agb" />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        {!focused && <Footer />}
        <CartDrawer />
        <ConsentBanner />
      </CartProvider>
    </ConsentProvider>
  );
}
