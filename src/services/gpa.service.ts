import api from '@/lib/api';

export const gpaService = {
  calculate: (courses: { units: number; grade: string }[], scale?: string) =>
    api.post('/gpa/calculate', { courses, scale }).then(r => r.data),

  submitSemester: (data: { level: number; semester: number; year: number; grades: { courseId: string; grade: string }[] }) =>
    api.post('/gpa/submit-semester', data).then(r => r.data),

  getAnalytics: () => api.get('/gpa/analytics').then(r => r.data),

  predict: (targetCgpa: number, totalProgramUnits: number) =>
    api.get('/gpa/predict', { params: { targetCgpa, totalProgramUnits } }).then(r => r.data),

  quickPredict: (data: { currentCgpa: number; totalUnitsDone: number; targetCgpa: number; remainingUnits: number; scale?: string }) =>
    api.post('/gpa/predict/quick', data).then(r => r.data),
};
