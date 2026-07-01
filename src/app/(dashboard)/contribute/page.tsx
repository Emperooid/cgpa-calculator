'use client';
import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { schoolsService } from '@/services/schools.service';
import { coursesService } from '@/services/courses.service';
import { School, Faculty, Department } from '@/types';
import { Plus, Trash2, Users } from 'lucide-react';

interface CourseEntry { code: string; title: string; units: number; isCompulsory: boolean }
const blank = (): CourseEntry => ({ code: '', title: '', units: 3, isCompulsory: true });

const LEVELS = [100, 200, 300, 400, 500];

export default function ContributePage() {
  const [mode, setMode] = useState<'school' | 'faculty' | 'department' | 'courses'>('school');
  const [schoolSearch, setSchoolSearch] = useState('');
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [level, setLevel] = useState(100);
  const [semester, setSemester] = useState(1);
  const [courses, setCourses] = useState<CourseEntry[]>([blank()]);
  const [newSchoolName, setNewSchoolName] = useState('');
  const [newFacultyName, setNewFacultyName] = useState('');
  const [newDeptName, setNewDeptName] = useState('');
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const { data: schools } = useQuery<School[]>({
    queryKey: ['schools', schoolSearch],
    queryFn: () => schoolsService.getAll(schoolSearch),
  });

  useEffect(() => {
    if (!selectedSchool) return;
    schoolsService.getFaculties(selectedSchool.id).then(setFaculties).catch(() => setFaculties([]));
  }, [selectedSchool]);

  useEffect(() => {
    if (!selectedFaculty) return;
    schoolsService.getDepartments(selectedFaculty.id).then(setDepartments).catch(() => setDepartments([]));
  }, [selectedFaculty]);

  const addSchoolMutation = useMutation({
    mutationFn: () => schoolsService.create({ name: newSchoolName }),
    onSuccess: (data) => { setSelectedSchool(data); setMode('faculty'); toast.success(`${data.name} added!`); },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Failed'),
  });

  const addFacultyMutation = useMutation({
    mutationFn: () => schoolsService.createFaculty({ name: newFacultyName, schoolId: selectedSchool!.id }),
    onSuccess: (data) => { setSelectedFaculty(data); setMode('department'); toast.success(`${data.name} added!`); },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Failed'),
  });

  const addDeptMutation = useMutation({
    mutationFn: () => schoolsService.createDepartment({ name: newDeptName, facultyId: selectedFaculty!.id }),
    onSuccess: (data) => { setSelectedDept(data); setMode('courses'); toast.success(`${data.name} added!`); },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Failed'),
  });

  const addCoursesMutation = useMutation({
    mutationFn: () =>
      coursesService.bulkCreate({
        departmentId: selectedDept!.id,
        level,
        semester,
        courses: courses.filter(c => c.code && c.title),
      }),
    onSuccess: () => { toast.success('Courses added! Thank you for contributing 🎉'); setCourses([blank()]); },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Failed'),
  });

  const updateCourse = (i: number, field: keyof CourseEntry, value: any) =>
    setCourses(prev => prev.map((c, idx) => idx === i ? { ...c, [field]: value } : c));

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Contribute to the Database</h1>
        <p className="text-slate-500 mt-1">Help your fellow students by adding your school, department, and courses.</p>
      </div>

      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex gap-3">
        <Users className="text-indigo-500 mt-0.5 shrink-0" size={20} />
        <p className="text-sm text-indigo-800">
          Once you add courses, every student from your department will have them automatically loaded in the calculator. Be the first contributor for your department!
        </p>
      </div>

      {/* Step 1: School */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
        <h2 className="font-semibold text-slate-900 mb-1">Step 1 — School</h2>
        {selectedSchool ? (
          <div className="flex items-center justify-between">
            <span className="text-emerald-700 font-medium">✓ {selectedSchool.name}</span>
            <button onClick={() => { setSelectedSchool(null); setSelectedFaculty(null); setSelectedDept(null); }} className="text-xs text-slate-400 hover:text-slate-600">Change</button>
          </div>
        ) : (
          <div className="space-y-3">
            <input value={schoolSearch} onChange={e => setSchoolSearch(e.target.value)} placeholder="Search school..." className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            {schools && schools.length > 0 && (
              <div className="border border-slate-200 rounded-lg divide-y max-h-40 overflow-auto">
                {schools.map(s => (
                  <button key={s.id} onClick={() => { setSelectedSchool(s); setMode('faculty'); }} className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 text-slate-700">
                    {s.name}
                  </button>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input value={newSchoolName} onChange={e => setNewSchoolName(e.target.value)} placeholder="School not found? Add it..." className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <button onClick={() => addSchoolMutation.mutate()} disabled={!newSchoolName || addSchoolMutation.isPending} className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                <Plus size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Step 2: Faculty */}
      {selectedSchool && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h2 className="font-semibold text-slate-900 mb-1">Step 2 — Faculty</h2>
          {selectedFaculty ? (
            <div className="flex items-center justify-between">
              <span className="text-emerald-700 font-medium">✓ {selectedFaculty.name}</span>
              <button onClick={() => { setSelectedFaculty(null); setSelectedDept(null); }} className="text-xs text-slate-400 hover:text-slate-600">Change</button>
            </div>
          ) : (
            <div className="space-y-3">
              {faculties.length > 0 && (
                <div className="border border-slate-200 rounded-lg divide-y max-h-40 overflow-auto">
                  {faculties.map(f => (
                    <button key={f.id} onClick={() => { setSelectedFaculty(f); setMode('department'); }} className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 text-slate-700">
                      {f.name}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <input value={newFacultyName} onChange={e => setNewFacultyName(e.target.value)} placeholder="Faculty not listed? Add it..." className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <button onClick={() => addFacultyMutation.mutate()} disabled={!newFacultyName || addFacultyMutation.isPending} className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                  <Plus size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Department */}
      {selectedFaculty && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h2 className="font-semibold text-slate-900 mb-1">Step 3 — Department</h2>
          {selectedDept ? (
            <div className="flex items-center justify-between">
              <span className="text-emerald-700 font-medium">✓ {selectedDept.name}</span>
              <button onClick={() => setSelectedDept(null)} className="text-xs text-slate-400 hover:text-slate-600">Change</button>
            </div>
          ) : (
            <div className="space-y-3">
              {departments.length > 0 && (
                <div className="border border-slate-200 rounded-lg divide-y max-h-40 overflow-auto">
                  {departments.map(d => (
                    <button key={d.id} onClick={() => { setSelectedDept(d); setMode('courses'); }} className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 text-slate-700">
                      {d.name}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <input value={newDeptName} onChange={e => setNewDeptName(e.target.value)} placeholder="Department not listed? Add it..." className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <button onClick={() => addDeptMutation.mutate()} disabled={!newDeptName || addDeptMutation.isPending} className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                  <Plus size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 4: Courses */}
      {selectedDept && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h2 className="font-semibold text-slate-900 mb-4">Step 4 — Add Courses</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Level</label>
              <select value={level} onChange={e => setLevel(+e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {LEVELS.map(l => <option key={l} value={l}>{l} Level</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Semester</label>
              <select value={semester} onChange={e => setSemester(+e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value={1}>First Semester</option>
                <option value={2}>Second Semester</option>
              </select>
            </div>
          </div>

          <div className="space-y-2 mb-3">
            {courses.map((c, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input value={c.code} onChange={e => updateCourse(i, 'code', e.target.value.toUpperCase())} placeholder="MTH101" className="w-24 px-2 py-1.5 rounded border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <input value={c.title} onChange={e => updateCourse(i, 'title', e.target.value)} placeholder="Course title" className="flex-1 px-2 py-1.5 rounded border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <select value={c.units} onChange={e => updateCourse(i, 'units', +e.target.value)} className="w-16 px-2 py-1.5 rounded border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  {[1, 2, 3, 4, 5, 6].map(u => <option key={u} value={u}>{u}u</option>)}
                </select>
                <button onClick={() => setCourses(prev => prev.filter((_, j) => j !== i))} className="text-slate-300 hover:text-red-400 transition-colors">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>

          <button onClick={() => setCourses(prev => [...prev, blank()])} className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium mb-4">
            <Plus size={15} /> Add another course
          </button>

          <button
            onClick={() => addCoursesMutation.mutate()}
            disabled={addCoursesMutation.isPending || courses.filter(c => c.code && c.title).length === 0}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors"
          >
            {addCoursesMutation.isPending ? 'Submitting...' : `Submit ${courses.filter(c => c.code && c.title).length} Course(s)`}
          </button>
        </div>
      )}
    </div>
  );
}
