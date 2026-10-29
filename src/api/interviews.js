import apiClient from './client';

export const interviewApi = {
  create: (data) => apiClient.post('/interviews', data),
  getAll: (params) => apiClient.get('/interviews', { params }),
  getById: (id) => apiClient.get(`/interviews/${id}`),
  start: (id) => apiClient.post(`/interviews/${id}/start`),
  nextQuestion: (id) => apiClient.post(`/interviews/${id}/next-question`),
  submitAnswer: (id, data) => apiClient.post(`/interviews/${id}/answers`, data),
  getAnswers: (id) => apiClient.get(`/interviews/${id}/answers`),
  complete: (id) => apiClient.post(`/interviews/${id}/complete`),
  cancel: (id) => apiClient.post(`/interviews/${id}/cancel`),
  retry: (id) => apiClient.post(`/interviews/${id}/retry`),
  delete: (id) => apiClient.delete(`/interviews/${id}`),
  getReport: (id) => apiClient.get(`/interviews/${id}/report`),
};
