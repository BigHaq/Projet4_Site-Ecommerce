import { useEffect } from 'react';
import { cartApi } from '../api/cart.js';
import { useCartStore } from '../store/cartStore.js';
import { useAuthStore } from '../store/authStore.js';
import { useToast } from './useToast.js';

export function useCart() {
  const { cart, isLoading, setCart, setLoading, optimisticAdd } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { showToast } = useToast();

  useEffect(() => {
    if (isAuthenticated) fetchCart();
  }, [isAuthenticated]);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await cartApi.get();
      setCart(res.data.data.cart);
    } catch {
      // Silencieux si non authentifié
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (product, quantity = 1, variant) => {
    optimisticAdd(product, quantity); // UI instantanée
    try {
      const res = await cartApi.addItem({ productId: product.id, quantity, variant });
      setCart(res.data.data.cart);
      showToast(`${product.name} ajouté au panier !`, 'success');
    } catch (err) {
      fetchCart(); // Revert l'optimistic
      showToast(err.response?.data?.message || 'Erreur ajout panier', 'error');
    }
  };

  const updateItem = async (itemId, quantity) => {
    try {
      const res = await cartApi.updateItem(itemId, quantity);
      setCart(res.data.data.cart);
    } catch (err) {
      showToast(err.response?.data?.message || 'Erreur mise à jour', 'error');
    }
  };

  const removeItem = async (itemId) => {
    try {
      const res = await cartApi.removeItem(itemId);
      setCart(res.data.data.cart);
      showToast('Article retiré', 'info');
    } catch {
      showToast('Erreur suppression', 'error');
    }
  };

  const clearCart = async () => {
    try {
      await cartApi.clear();
      setCart({ items: [], subtotal: 0, itemCount: 0 });
    } catch {}
  };

  return { cart, isLoading, addItem, updateItem, removeItem, clearCart, refetch: fetchCart };
}
