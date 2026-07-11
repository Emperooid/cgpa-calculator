import api from '@/lib/api';

export const authService = {
  register: (data: any) => api.post('/auth/register', data).then(r => r.data),
  login: (data: { email: string; password: string }) => api.post('/auth/login', data).then(r => r.data),
  registerAnonymous: () => api.post('/auth/anonymous').then(r => r.data),
  claimAccount: (data: { email: string; password: string }) => api.post('/auth/claim', data).then(r => r.data),
  refresh: (refreshToken: string) => api.post('/auth/refresh', { refreshToken }).then(r => r.data),
  logout: () => api.post('/auth/logout').then(r => r.data),
  me: () => api.get('/auth/me').then(r => r.data),
};
