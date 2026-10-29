import apiClient from './client';

export const analyticsApi = {
  getOverview: () => apiClient.get('/analytics/overview'),
  getScoreTrends: (period = '6months') => apiClient.get('/analytics/score-trends', { params: { period } }),
  getSkillBreakdown: () => apiClient.get('/analytics/skill-breakdown'),
  getCategoryPerformance: () => apiClient.get('/analytics/category-performance'),
  getRecommendations: () => apiClient.get('/analytics/recommendations'),
  getMonthlyActivity: () => apiClient.get('/analytics/monthly-activity'),
};
