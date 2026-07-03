'use client';
import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { schoolsService } from '@/services/schools.service';
import { coursesService } from '@/services/courses.service';
import { School, Faculty, Department } from '@/types';

interface CourseEntry { code: string; title: string; units: number; isCompulsory: boolean }
const blank = (): CourseEntry => ({ code: '', title: '', units: 3, isCompulsory: true });

const LEVELS = [100, 200, 300, 400, 500];

const inputClass = 'w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-shadow';

export default function ContributePage() {
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
    onSuccess: (data) => { setSelectedSchool(data); toast.success(`${data.name} added!`); },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Failed'),
  });

  const addFacultyMutation = useMutation({
    mutationFn: () => schoolsService.createFaculty({ name: newFacultyName, schoolId: selectedSchool!.id }),
    onSuccess: (data) => { setSelectedFaculty(data); toast.success(`${data.name} added!`); },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Failed'),
  });

  const addDeptMutation = useMutation({
    mutationFn: () => schoolsService.createDepartment({ name: newDeptName, facultyId: selectedFaculty!.id }),
    onSuccess: (data) => { setSelectedDept(data); toast.success(`${data.name} added!`); },
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
    onSuccess: () => { toast.success('Courses added! Thank you for contributing'); setCourses([blank()]); },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Failed'),
  });

  const updateCourse = (i: number, field: keyof CourseEntry, value: any) =>
    setCourses(prev => prev.map((c, idx) => idx === i ? { ...c, [field]: value } : c));

  const validCourses = courses.filter(c => c.code && c.title).length;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-on-surface">Contribute to the Database</h1>
        <p className="text-on-surface-variant mt-1">Help your fellow students by adding your school, department, and courses.</p>
      </div>

      <div className="bg-primary-container/30 border border-primary/20 rounded-xl p-4 flex gap-3">
        <span className="material-symbols-outlined text-primary mt-0.5 shrink-0" style={{ fontSize: 20 }}>group</span>
        <p className="text-sm text-on-primary-container">
          Once you add courses, every student from your department will have them automatically loaded in the calculator. Be the first contributor for your department!
        </p>
      </div>

      {/* Step 1: School */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-5">
        <h2 className="font-semibold text-on-surface mb-3">Step 1 — School</h2>
        {selectedSchool ? (
          <div className="flex items-center justify-between">
            <span className="text-secondary font-medium flex items-center gap-1.5">
              <span className="material-symbols-outlined" style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              {selectedSchool.name}
            </span>
            <button onClick={() => { setSelectedSchool(null); setSelectedFaculty(null); setSelectedDept(null); }} className="text-xs text-outline hover:text-on-surface transition-colors">Change</button>
          </div>
        ) : (
          <div className="space-y-3">
            <input value={schoolSearch} onChange={e => setSchoolSearch(e.target.value)} placeholder="Search school..." className={inputClass} />
            {schools && schools.length > 0 && (
              <div className="border border-outline-variant rounded-lg divide-y divide-outline-variant max-h-40 overflow-auto">
                {schools.map(s => (
                  <button key={s.id} onClick={() => setSelectedSchool(s)} className="w-full text-left px-3 py-2 text-sm hover:bg-surface-container text-on-surface transition-colors">
                    {s.name}
                  </button>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input value={newSchoolName} onChange={e => setNewSchoolName(e.target.value)} placeholder="School not found? Add it..." className="flex-1 px-3 py-2 rounded-lg border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-shadow" />
              <button onClick={() => addSchoolMutation.mutate()} disabled={!newSchoolName || addSchoolMutation.isPending} className="px-4 py-2 bg-primary text-on-primary text-sm rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center">
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Step 2: Faculty */}
      {selectedSchool && (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-5">
          <h2 className="font-semibold text-on-surface mb-3">Step 2 — Faculty</h2>
          {selectedFaculty ? (
            <div className="flex items-center justify-between">
              <span className="text-secondary font-medium flex items-center gap-1.5">
                <span className="material-symbols-outlined" style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                {selectedFaculty.name}
              </span>
              <button onClick={() => { setSelectedFaculty(null); setSelectedDept(null); }} className="text-xs text-outline hover:text-on-surface transition-colors">Change</button>
            </div>
          ) : (
            <div className="space-y-3">
              {faculties.length > 0 && (
                <div className="border border-outline-variant rounded-lg divide-y divide-outline-variant max-h-40 overflow-auto">
                  {faculties.map(f => (
                    <button key={f.id} onClick={() => setSelectedFaculty(f)} className="w-full text-left px-3 py-2 text-sm hover:bg-surface-container text-on-surface transition-colors">
                      {f.name}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <input value={newFacultyName} onChange={e => setNewFacultyName(e.target.value)} placeholder="Faculty not listed? Add it..." className="flex-1 px-3 py-2 rounded-lg border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-shadow" />
                <button onClick={() => addFacultyMutation.mutate()} disabled={!newFacultyName || addFacultyMutation.isPending} className="px-4 py-2 bg-primary text-on-primary text-sm rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center">
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Department */}
      {selectedFaculty && (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-5">
          <h2 className="font-semibold text-on-surface mb-3">Step 3 — Department</h2>
          {selectedDept ? (
            <div className="flex items-center justify-between">
              <span className="text-secondary font-medium flex items-center gap-1.5">
                <span className="material-symbols-outlined" style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                {selectedDept.name}
              </span>
              <button onClick={() => setSelectedDept(null)} className="text-xs text-outline hover:text-on-surface transition-colors">Change</button>
            </div>
          ) : (
            <div className="space-y-3">
              {departments.length > 0 && (
                <div className="border border-outline-variant rounded-lg divide-y divide-outline-variant max-h-40 overflow-auto">
                  {departments.map(d => (
                    <button key={d.id} onClick={() => setSelectedDept(d)} className="w-full text-left px-3 py-2 text-sm hover:bg-surface-container text-on-surface transition-colors">
                      {d.name}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <input value={newDeptName} onChange={e => setNewDeptName(e.target.value)} placeholder="Department not listed? Add it..." className="flex-1 px-3 py-2 rounded-lg border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-shadow" />
                <button onClick={() => addDeptMutation.mutate()} disabled={!newDeptName || addDeptMutation.isPending} className="px-4 py-2 bg-primary text-on-primary text-sm rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center">
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 4: Courses */}
      {selectedDept && (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-5">
          <h2 className="font-semibold text-on-surface mb-4">Step 4 — Add Courses</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-1">Level</label>
              <select value={level} onChange={e => setLevel(+e.target.value)} className={inputClass}>
                {LEVELS.map(l => <option key={l} value={l}>{l} Level</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-1">Semester</label>
              <select value={semester} onChange={e => setSemester(+e.target.value)} className={inputClass}>
                <option value={1}>First Semester</option>
                <option value={2}>Second Semester</option>
              </select>
            </div>
          </div>

          <div className="space-y-2 mb-3">
            {courses.map((c, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  value={c.code}
                  onChange={e => updateCourse(i, 'code', e.target.value.toUpperCase())}
                  placeholder="MTH101"
                  className="w-24 px-2 py-1.5 rounded border border-outline-variant bg-surface text-on-surface text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  value={c.title}
                  onChange={e => updateCourse(i, 'title', e.target.value)}
                  placeholder="Course title"
                  className="flex-1 px-2 py-1.5 rounded border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <select
                  value={c.units}
                  onChange={e => updateCourse(i, 'units', +e.target.value)}
                  className="w-16 px-2 py-1.5 rounded border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {[1, 2, 3, 4, 5, 6].map(u => <option key={u} value={u}>{u}u</option>)}
                </select>
                <button
                  onClick={() => setCourses(prev => prev.filter((_, j) => j !== i))}
                  className="text-outline hover:text-error transition-colors p-1"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={() => setCourses(prev => [...prev, blank()])}
            className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-medium mb-5 transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
            Add another course
          </button>

          <button
            onClick={() => addCoursesMutation.mutate()}
            disabled={addCoursesMutation.isPending || validCourses === 0}
            className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-on-primary font-semibold py-2.5 rounded-lg transition-colors"
          >
            {addCoursesMutation.isPending ? 'Submitting...' : `Submit ${validCourses} Course${validCourses !== 1 ? 's' : ''}`}
          </button>
        </div>
      )}
    </div>
  );
}
