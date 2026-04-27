import client from './client.js';

export const usersApi = {
  getProfile: () => client.get('/users/profile'),
  updateProfile: (data) => client.put('/users/profile', data),
  changePassword: (data) => client.put('/users/password', data),
  getAddresses: () => client.get('/users/addresses'),
  addAddress: (data) => client.post('/users/addresses', data),
  updateAddress: (id, data) => client.put(`/users/addresses/${id}`, data),
  deleteAddress: (id) => client.delete(`/users/addresses/${id}`),
};
