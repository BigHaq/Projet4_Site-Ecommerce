import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore.js';
import { useCartStore } from '../../store/cartStore.js';
import { useAuth } from '../../hooks/useAuth.js';
import { CartSidebar } from '../cart/CartSidebar.jsx';

const navLinks = [
  { to: '/', label: 'Accueil' },
  { to: '/catalogue', label: 'Catalogue' },
];

export function Navbar() {
  const { user, isAuthenticated } = useAuthStore();
  const { cart, isOpen, toggleCart } = useCartStore();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const itemCount = cart?.itemCount ?? 0;

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-kora-border shadow-sm"
        style={{ height: 'var(--nav-height)' }}>
        <div className="container-kora h-full flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0" onClick={() => setMobileOpen(false)}>
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-kora">
              <span className="text-white text-lg font-display font-bold">K</span>
            </div>
            <div>
              <span className="font-display font-bold text-xl text-kora-text">Marché Kora</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => (
              <Link key={l.to} to={l.to}
                className="px-4 py-2 rounded-lg text-sm font-medium text-kora-muted hover:text-kora-text
                           hover:bg-kora-border/50 transition-all duration-200">
                {l.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Panier */}
            <button
              id="cart-toggle"
              onClick={toggleCart}
              className="relative p-2.5 rounded-xl hover:bg-kora-border/50 transition-all duration-200 text-kora-text"
              aria-label={`Panier (${itemCount} articles)`}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {itemCount > 0 && (
                <motion.span
                  key={itemCount}
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs
                             font-bold rounded-full flex items-center justify-center"
                >
                  {itemCount > 9 ? '9+' : itemCount}
                </motion.span>
              )}
            </button>

            {/* User menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  id="user-menu"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-kora-border/50 transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary text-sm font-semibold">{user?.firstName?.[0]?.toUpperCase()}</span>
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-kora-text">{user?.firstName}</span>
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                      className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-kora-lg border border-kora-border py-1 z-50"
                    >
                      {[
                        { to: '/dashboard', label: 'Mon compte' },
                        { to: '/dashboard/orders', label: 'Mes commandes' },
                      ].map((item) => (
                        <Link key={item.to} to={item.to}
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2.5 text-sm text-kora-text hover:bg-kora-bg transition-colors">
                          {item.label}
                        </Link>
                      ))}
                      <div className="border-t border-kora-border my-1" />
                      <button
                        onClick={() => { setUserMenuOpen(false); logout(); navigate('/'); }}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                        Déconnexion
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/auth" className="btn-primary btn-sm">Connexion</Link>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2.5 rounded-xl hover:bg-kora-border/50 transition-all"
              aria-label="Menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {mobileOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-kora-border overflow-hidden"
            >
              <div className="container-kora py-4 flex flex-col gap-1">
                {navLinks.map((l) => (
                  <Link key={l.to} to={l.to}
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-3 rounded-xl text-sm font-medium text-kora-text hover:bg-kora-bg transition-colors">
                    {l.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Cart Sidebar */}
      <CartSidebar />

      {/* Spacer pour le fixed navbar */}
      <div style={{ height: 'var(--nav-height)' }} />
    </>
  );
}
