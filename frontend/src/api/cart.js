import client from './client.js';

export const cartApi = {
  get: () => client.get('/cart'),
  addItem: (data) => client.post('/cart/items', data),
  updateItem: (itemId, quantity) => client.put(`/cart/items/${itemId}`, { quantity }),
  removeItem: (itemId) => client.delete(`/cart/items/${itemId}`),
  clear: () => client.delete('/cart'),
};
