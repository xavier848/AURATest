import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useCart } from '../lib/cart';
import { track } from '../lib/consent';
import { BagIcon, CloseIcon, MenuIcon } from './Icons';

const PRIMARY = [
  { to: '/shop', label: 'Shop' },
  { to: '/duftfinder', label: 'Discover Your AURA' },
  { to: '/philosophie', label: 'Philosophie' },
];
const SECONDARY = [
  { to: '/faq', label: 'FAQ' },
  { to: '/kontakt', label: 'Kontakt' },
];

export function Header() {
  const { count, openDrawer } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => setMenuOpen(false), [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('is-locked', menuOpen);
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  return (
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''} ${menuOpen ? 'is-menu-open' : ''}`}>
      <div className="container site-header__inner">
        <nav className="site-nav site-nav--left" aria-label="Hauptnavigation">
          {PRIMARY.map((item) => (
            <NavLink key={item.to} to={item.to} className="site-nav__link">
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button
          type="button"
          className="icon-btn menu-toggle"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? 'Menü schließen' : 'Menü öffnen'}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <CloseIcon size={22} /> : <MenuIcon size={22} />}
        </button>

        <Link to="/" className="logo" aria-label="AURA Startseite">
          AURA
        </Link>

        <div className="site-header__actions">
          <nav className="site-nav" aria-label="Service">
            {SECONDARY.map((item) => (
              <NavLink key={item.to} to={item.to} className="site-nav__link">
                {item.label}
              </NavLink>
            ))}
          </nav>
          <button
            type="button"
            className="icon-btn cart-btn"
            onClick={() => {
              setMenuOpen(false);
              openDrawer();
            }}
            aria-label={`Warenkorb öffnen, ${count} Artikel`}
          >
            <BagIcon size={22} />
            {count > 0 && <span className="cart-btn__count">{count}</span>}
          </button>
        </div>
      </div>

      <div id="mobile-menu" className="mobile-menu" hidden={!menuOpen}>
        <nav className="container mobile-menu__nav" aria-label="Mobile Navigation">
          {[...PRIMARY, ...SECONDARY].map((item) => (
            <NavLink key={item.to} to={item.to} className="mobile-menu__link">
              {item.label}
            </NavLink>
          ))}
          <Link
            to="/duftfinder"
            className="btn btn--block"
            onClick={() => track('quiz_cta_click', { placement: 'menu' })}
          >
            Find my AURA
          </Link>
        </nav>
      </div>
    </header>
  );
}
