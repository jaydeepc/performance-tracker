import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  login: (username: string, password: string) =>
    api.post('/auth/login', { username, password }),
  logout: () => api.post('/auth/logout'),
};

export const users = {
  getAll: () => api.get('/users'),
  create: (userData: any) => api.post('/users', userData),
  update: (id: string, userData: any) => api.put(`/users/${id}`, userData),
  delete: (id: string) => api.delete(`/users/${id}`),
};

export const evaluations = {
  create: (evaluationData: any) => api.post('/evaluations', evaluationData),
  getByUserId: (userId: string) => api.get(`/evaluations/user/${userId}`),
  getStatus: (userId: string) => api.get(`/evaluations/status/${userId}`),
  update: (id: string, evaluationData: any) =>
    api.put(`/evaluations/${id}`, evaluationData),
};

export const team = {
  getReportees: (managerId: string) =>
    api.get(`/users/${managerId}/reportees`),
  getTeamAnalytics: (managerId: string) =>
    api.get(`/analytics/team/${managerId}`),
};

export default api;
