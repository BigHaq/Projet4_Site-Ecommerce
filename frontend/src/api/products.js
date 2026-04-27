import client from './client.js';

export const productsApi = {
  list: (params) => client.get('/products', { params }),
  getById: (id) => client.get(`/products/${id}`),
  getBySlug: (slug) => client.get(`/products/${slug}`),
  categories: () => client.get('/products/categories'),
  addReview: (id, data) => client.post(`/products/${id}/reviews`, data),
};
