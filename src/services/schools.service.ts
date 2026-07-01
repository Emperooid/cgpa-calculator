import api from '@/lib/api';

export const schoolsService = {
  getAll: (search?: string) => api.get('/schools', { params: { search } }).then(r => r.data),
  getOne: (id: string) => api.get(`/schools/${id}`).then(r => r.data),
  create: (data: any) => api.post('/schools', data).then(r => r.data),
  getCourses: (schoolId: string, departmentId: string, level: number, semester: number) =>
    api.get(`/schools/${schoolId}/structure`, { params: { departmentId, level, semester } }).then(r => r.data),
  getFaculties: (schoolId: string) => api.get('/faculties', { params: { schoolId } }).then(r => r.data),
  getDepartments: (facultyId: string) => api.get('/departments', { params: { facultyId } }).then(r => r.data),
  createFaculty: (data: any) => api.post('/faculties', data).then(r => r.data),
  createDepartment: (data: any) => api.post('/departments', data).then(r => r.data),
};
