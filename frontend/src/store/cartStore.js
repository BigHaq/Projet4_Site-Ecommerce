import { create } from 'zustand';
import { formatFCFA } from '../constants/index.js';

export const useCartStore = create((set, get) => ({
  cart: null,
  isOpen: false,
  isLoading: false,

  setCart: (cart) => set({ cart }),
  setLoading: (isLoading) => set({ isLoading }),
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

  // Optimistic: ajouter un item localement avant la réponse serveur
  optimisticAdd: (product, quantity = 1) => {
    set((state) => {
      if (!state.cart) return {};
      const existingIdx = state.cart.items.findIndex((i) => i.productId === product.id);
      let newItems;
      if (existingIdx >= 0) {
        newItems = state.cart.items.map((item, idx) =>
          idx === existingIdx ? { ...item, quantity: item.quantity + quantity } : item
        );
      } else {
        newItems = [
          ...state.cart.items,
          { id: `optimistic-${product.id}`, productId: product.id, product, quantity },
        ];
      }
      const subtotal = newItems.reduce((s, i) => s + i.product.price * i.quantity, 0);
      return { cart: { ...state.cart, items: newItems, subtotal, itemCount: state.cart.itemCount + quantity } };
    });
  },

  get itemCount() { return get().cart?.itemCount ?? 0; },
  get subtotal() { return get().cart?.subtotal ?? 0; },
  get subtotalFormatted() { return formatFCFA(get().cart?.subtotal ?? 0); },
}));
