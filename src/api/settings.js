import apiClient from './client';

export const settingsApi = {
  get: () => apiClient.get('/settings'),
  updateProfile: (data) => apiClient.patch('/settings/profile', data),
  updatePreferences: (data) => apiClient.patch('/settings/preferences', data),
  updatePrivacy: (data) => apiClient.patch('/settings/privacy', data),
  deleteAccount: (confirmPassword) => apiClient.delete('/settings/account', { data: { confirmPassword } }),
  exportData: () => apiClient.post('/settings/export-data', {}, { responseType: 'blob' }),
};
