import apiClient from './client';

export const resumeApi = {
  upload: (formData, onProgress) =>
    apiClient.post('/resumes/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    }),
  getAll: () => apiClient.get('/resumes'),
  getById: (id) => apiClient.get(`/resumes/${id}`),
  getAnalysis: (id) => apiClient.get(`/resumes/${id}/analysis`),
  reanalyze: (id) => apiClient.post(`/resumes/${id}/analyze`),
  activate: (id) => apiClient.patch(`/resumes/${id}/activate`),
  delete: (id) => apiClient.delete(`/resumes/${id}`),
};
