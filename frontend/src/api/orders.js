import client from './client.js';

export const ordersApi = {
  create: (data) => client.post('/orders', data),
  list: (params) => client.get('/orders', { params }),
  getById: (id) => client.get(`/orders/${id}`),
};
