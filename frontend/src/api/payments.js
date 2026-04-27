import client from './client.js';

export const paymentsApi = {
  initiate: (data) => client.post('/payments/initiate', data),
  checkStatus: (ref) => client.get(`/payments/status/${ref}`),
  history: (params) => client.get('/payments/history', { params }),
};
