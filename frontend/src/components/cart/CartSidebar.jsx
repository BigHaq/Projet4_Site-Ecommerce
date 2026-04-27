import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore.js';
import { useCart } from '../../hooks/useCart.js';
import { formatFCFA } from '../../constants/index.js';
import { Spinner } from '../ui/Spinner.jsx';

export function CartSidebar() {
  const { cart, isOpen, closeCart } = useCartStore();
  const { updateItem, removeItem, isLoading } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div key="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={closeCart} />

          <motion.div key="sidebar"
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 35 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-kora-border">
              <h2 className="font-display text-xl font-bold text-kora-text">
                Mon Panier
                {cart?.itemCount > 0 && (
                  <span className="ml-2 text-sm font-normal text-kora-muted">({cart.itemCount} article{cart.itemCount > 1 ? 's' : ''})</span>
                )}
              </h2>
              <button onClick={closeCart} className="btn-ghost btn-sm rounded-full p-2" aria-label="Fermer le panier">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {isLoading && !cart?.items?.length ? (
                <div className="flex justify-center py-12"><Spinner /></div>
              ) : !cart?.items?.length ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 rounded-full bg-kora-border flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-kora-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <p className="text-kora-muted font-medium">Votre panier est vide</p>
                  <Link to="/catalogue" onClick={closeCart} className="btn-primary btn-sm mt-4 inline-flex">
                    Explorer la boutique
                  </Link>
                </div>
              ) : (
                cart.items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <img src={item.product.images?.[0]} alt={item.product.name}
                      className="w-20 h-20 rounded-xl object-cover flex-shrink-0 bg-kora-border" loading="lazy" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-kora-text line-clamp-2">{item.product.name}</p>
                      <p className="text-sm font-semibold text-primary mt-1">{formatFCFA(item.product.price)}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center border border-kora-border rounded-lg">
                          <button onClick={() => item.quantity > 1 ? updateItem(item.id, item.quantity - 1) : removeItem(item.id)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-kora-bg transition-colors text-kora-text"
                            aria-label="Diminuer">
                            <span className="text-lg leading-none">−</span>
                          </button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <button onClick={() => updateItem(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock}
                            className="w-8 h-8 flex items-center justify-center hover:bg-kora-bg transition-colors text-kora-text disabled:opacity-40"
                            aria-label="Augmenter">
                            <span className="text-lg leading-none">+</span>
                          </button>
                        </div>
                        <button onClick={() => removeItem(item.id)}
                          className="text-kora-muted hover:text-red-500 transition-colors ml-auto"
                          aria-label="Retirer l'article">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {cart?.items?.length > 0 && (
              <div className="p-6 border-t border-kora-border space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-kora-muted">Sous-total</span>
                  <span className="font-bold text-lg text-kora-text">{formatFCFA(cart.subtotal)}</span>
                </div>
                <p className="text-xs text-kora-muted">Frais de livraison calculés à l'étape suivante</p>
                <Link to="/checkout" onClick={closeCart} className="btn-primary w-full justify-center">
                  Commander — {formatFCFA(cart.subtotal)}
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
