import apiClient from './client';

export const planApi = {
  getPlans: () => apiClient.get('/plans'),
  getUsage: () => apiClient.get('/usage'),
  checkUsage: (feature) => apiClient.post('/usage/check', { feature }),
};
