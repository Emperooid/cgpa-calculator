import api from '@/lib/api';

export const coursesService = {
  forSemester: (departmentId: string, level: number, semester: number) =>
    api.get('/courses', { params: { departmentId, level, semester } }).then(r => r.data),

  create: (data: any) => api.post('/courses', data).then(r => r.data),

  bulkCreate: (data: any) => api.post('/courses/bulk', data).then(r => r.data),

  rate: (id: string, data: { difficulty: number; quality: number; tips?: string }) =>
    api.post(`/courses/${id}/rate`, data).then(r => r.data),

  getStats: (id: string) => api.get(`/courses/${id}/stats`).then(r => r.data),
};
