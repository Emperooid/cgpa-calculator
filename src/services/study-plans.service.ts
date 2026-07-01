import api from '@/lib/api';

export const studyPlansService = {
  generate: (data: { targetGrade: string; targetCgpa: number; semesterCourses: any[] }) =>
    api.post('/study-plans/generate', data).then(r => r.data),
  getActive: () => api.get('/study-plans/active').then(r => r.data),
};
