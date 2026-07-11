import api from '@/lib/api';

export const studentsService = {
  getProfile: () => api.get('/students/profile').then(r => r.data),
  createProfile: (data: { name: string; schoolId: string; departmentId: string; currentLevel: number; matricYear?: number }) =>
    api.post('/students/profile', data).then(r => r.data),
  updateProfile: (data: any) => api.patch('/students/profile', data).then(r => r.data),
  getHistory: () => api.get('/students/history').then(r => r.data),
};
