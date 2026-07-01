'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { authService } from '@/services/auth.service';
import { schoolsService } from '@/services/schools.service';
import { useAuthStore } from '@/store/auth.store';
import { School, Faculty, Department } from '@/types';

const schema = z.object({
  name: z.string().min(2, 'Enter your full name'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'At least 6 characters'),
  schoolId: z.string().min(1, 'Select your school'),
  facultyId: z.string().min(1, 'Select your faculty'),
  departmentId: z.string().min(1, 'Select your department'),
  currentLevel: z.string().min(1, 'Select your level'),
  matricYear: z.string().optional(),
});

type Form = z.infer<typeof schema>;

const LEVELS = [100, 200, 300, 400, 500];

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="text-error text-xs mt-1.5 flex items-center gap-1">
      <span className="material-symbols-outlined" style={{ fontSize: 13 }}>error</span>
      {msg}
    </p>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const setUser = useAuthStore(s => s.setUser);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  // school state
  const [schoolSearch, setSchoolSearch] = useState('');
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [creatingSchool, setCreatingSchool] = useState(false);

  // faculty state
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [newFacultyName, setNewFacultyName] = useState('');
  const [creatingFaculty, setCreatingFaculty] = useState(false);

  // department state
  const [departments, setDepartments] = useState<Department[]>([]);
  const [newDeptName, setNewDeptName] = useState('');
  const [creatingDept, setCreatingDept] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '', email: '', password: '',
      schoolId: '', facultyId: '', departmentId: '',
      currentLevel: '', matricYear: '',
    },
  });

  useEffect(() => {
    if (!schoolSearch.trim()) { setSchools([]); return; }
    const t = setTimeout(() => {
      schoolsService.getAll(schoolSearch).then(setSchools).catch(() => setSchools([]));
    }, 300);
    return () => clearTimeout(t);
  }, [schoolSearch]);

  useEffect(() => {
    if (!selectedSchool) return;
    setFaculties([]); setSelectedFaculty(null); setDepartments([]);
    setValue('facultyId', ''); setValue('departmentId', '');
    schoolsService.getFaculties(selectedSchool.id).then(setFaculties).catch(() => setFaculties([]));
  }, [selectedSchool, setValue]);

  useEffect(() => {
    if (!selectedFaculty) return;
    setDepartments([]); setValue('departmentId', '');
    schoolsService.getDepartments(selectedFaculty.id).then(setDepartments).catch(() => setDepartments([]));
  }, [selectedFaculty, setValue]);

  const pickSchool = (school: School) => {
    setSelectedSchool(school);
    setValue('schoolId', school.id, { shouldValidate: true });
    setSchools([]); setSchoolSearch('');
  };

  const addSchool = async () => {
    const name = schoolSearch.trim();
    if (!name) return;
    setCreatingSchool(true);
    try {
      const school = await schoolsService.create({ name });
      toast.success(`${school.name} added!`);
      pickSchool(school);
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Could not add school');
    } finally { setCreatingSchool(false); }
  };

  const pickFaculty = (faculty: Faculty) => {
    setSelectedFaculty(faculty);
    setValue('facultyId', faculty.id, { shouldValidate: true });
    setValue('departmentId', ''); setDepartments([]);
  };

  const addFaculty = async () => {
    const name = newFacultyName.trim();
    if (!name || !selectedSchool) return;
    setCreatingFaculty(true);
    try {
      const faculty = await schoolsService.createFaculty({ name, schoolId: selectedSchool.id });
      toast.success(`${faculty.name} added!`);
      pickFaculty(faculty); setNewFacultyName('');
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Could not add faculty');
    } finally { setCreatingFaculty(false); }
  };

  const addDept = async () => {
    const name = newDeptName.trim();
    if (!name || !selectedFaculty) return;
    setCreatingDept(true);
    try {
      const dept = await schoolsService.createDepartment({ name, facultyId: selectedFaculty.id });
      toast.success(`${dept.name} added!`);
      setValue('departmentId', dept.id, { shouldValidate: true });
      setNewDeptName('');
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Could not add department');
    } finally { setCreatingDept(false); }
  };

  const onSubmit = async (data: Form) => {
    setLoading(true);
    try {
      const res = await authService.register({
        name: data.name, email: data.email, password: data.password,
        schoolId: data.schoolId, departmentId: data.departmentId,
        currentLevel: parseInt(data.currentLevel),
        matricYear: data.matricYear ? parseInt(data.matricYear) : undefined,
      });
      localStorage.setItem('cgpa_token', res.accessToken);
      localStorage.setItem('cgpa_refresh', res.refreshToken);
      setUser(res.user);
      toast.success('Account created! Welcome to GradePath 🎉');
      router.push('/dashboard');
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Registration failed');
    } finally { setLoading(false); }
  };

  const noSchoolFound = schoolSearch.trim().length > 1 && schools.length === 0 && !selectedSchool;

  const inputCls = 'w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-lg text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow';
  const labelCls = 'block text-[11px] font-semibold text-on-surface-variant mb-2 uppercase tracking-wide';

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-[28px] font-bold tracking-tight text-on-background mb-1">Create your account</h2>
        <p className="text-sm text-on-surface-variant">Join students across Nigerian universities</p>
      </div>

      {/* Progress bar */}
      <div className="flex gap-1.5 mb-8">
        {[1, 2].map(s => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${step >= s ? 'bg-primary' : 'bg-surface-container-highest'}`}
          />
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        {/* ── Step 1 ── */}
        {step === 1 && (
          <>
            <div>
              <label className={labelCls}>Full Name</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline pointer-events-none" style={{ fontSize: 18 }}>person</span>
                <input {...register('name')} className={`${inputCls} pl-10`} placeholder="Chukwuemeka Adeyemi" />
              </div>
              <FieldError msg={errors.name?.message} />
            </div>

            <div>
              <label className={labelCls}>Email</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline pointer-events-none" style={{ fontSize: 18 }}>mail</span>
                <input {...register('email')} type="email" className={`${inputCls} pl-10`} placeholder="you@university.edu.ng" />
              </div>
              <FieldError msg={errors.email?.message} />
            </div>

            <div>
              <label className={labelCls}>Password</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline pointer-events-none" style={{ fontSize: 18 }}>lock</span>
                <input {...register('password')} type="password" className={`${inputCls} pl-10`} placeholder="Min. 6 characters" />
              </div>
              <FieldError msg={errors.password?.message} />
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full bg-primary text-on-primary font-semibold py-3 rounded-lg shadow-sm hover:bg-surface-tint transition-all flex items-center justify-center gap-2 mt-2"
            >
              Continue
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
            </button>
          </>
        )}

        {/* ── Step 2 ── */}
        {step === 2 && (
          <>
            {/* School */}
            <div>
              <label className={labelCls}>Your School</label>

              {selectedSchool ? (
                <div className="flex items-center justify-between px-4 py-2.5 rounded-lg border border-secondary-container bg-secondary-container/30">
                  <span className="flex items-center gap-2 text-sm font-medium text-on-secondary-container">
                    <span className="material-symbols-outlined text-secondary" style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    {selectedSchool.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => { setSelectedSchool(null); setValue('schoolId', ''); }}
                    className="text-xs text-on-surface-variant hover:text-primary ml-3 shrink-0 font-medium"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    value={schoolSearch}
                    onChange={e => setSchoolSearch(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && e.preventDefault()}
                    autoComplete="off"
                    className={inputCls}
                    placeholder="Search your university…"
                  />

                  {schools.length > 0 && (
                    <div className="border border-outline-variant rounded-lg divide-y divide-outline-variant max-h-40 overflow-auto shadow-sm bg-surface-container-lowest">
                      {schools.map(s => (
                        <button key={s.id} type="button" onClick={() => pickSchool(s)}
                          className="w-full text-left px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container hover:text-primary transition-colors">
                          {s.name}
                        </button>
                      ))}
                    </div>
                  )}

                  {noSchoolFound && (
                    <div className="flex items-center justify-between px-4 py-3 rounded-lg border border-dashed border-outline bg-surface-container">
                      <p className="text-sm text-on-surface-variant truncate mr-3">
                        <span className="font-medium text-on-surface">"{schoolSearch.trim()}"</span> not found
                      </p>
                      <button type="button" onClick={addSchool} disabled={creatingSchool}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-on-primary text-xs font-semibold rounded-lg hover:bg-surface-tint disabled:opacity-60 transition-colors shrink-0">
                        {creatingSchool
                          ? <span className="material-symbols-outlined animate-spin" style={{ fontSize: 12 }}>progress_activity</span>
                          : <span className="material-symbols-outlined" style={{ fontSize: 12 }}>add</span>}
                        Add school
                      </button>
                    </div>
                  )}
                </div>
              )}
              <FieldError msg={errors.schoolId?.message} />
            </div>

            {/* Faculty */}
            {selectedSchool && (
              <div>
                <label className={labelCls}>Faculty</label>

                {selectedFaculty ? (
                  <div className="flex items-center justify-between px-4 py-2.5 rounded-lg border border-secondary-container bg-secondary-container/30">
                    <span className="flex items-center gap-2 text-sm font-medium text-on-secondary-container">
                      <span className="material-symbols-outlined text-secondary" style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      {selectedFaculty.name}
                    </span>
                    <button type="button"
                      onClick={() => { setSelectedFaculty(null); setValue('facultyId', ''); setValue('departmentId', ''); setDepartments([]); }}
                      className="text-xs text-on-surface-variant hover:text-primary ml-3 shrink-0 font-medium">
                      Change
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {faculties.length > 0 && (
                      <div className="border border-outline-variant rounded-lg divide-y divide-outline-variant max-h-36 overflow-auto shadow-sm bg-surface-container-lowest">
                        {faculties.map(f => (
                          <button key={f.id} type="button" onClick={() => pickFaculty(f)}
                            className="w-full text-left px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container hover:text-primary transition-colors">
                            {f.name}
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input
                        value={newFacultyName}
                        onChange={e => setNewFacultyName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && e.preventDefault()}
                        placeholder={faculties.length > 0 ? 'Not listed? Type to add…' : 'Enter faculty name…'}
                        className={`${inputCls} flex-1`}
                      />
                      <button type="button" onClick={addFaculty} disabled={!newFacultyName.trim() || creatingFaculty}
                        className="flex items-center gap-1 px-3 py-2.5 bg-primary text-on-primary text-sm rounded-lg hover:bg-surface-tint disabled:opacity-50 transition-colors shrink-0">
                        {creatingFaculty
                          ? <span className="material-symbols-outlined animate-spin" style={{ fontSize: 16 }}>progress_activity</span>
                          : <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>}
                        Add
                      </button>
                    </div>
                  </div>
                )}
                <FieldError msg={errors.facultyId?.message} />
              </div>
            )}

            {/* Department */}
            {selectedFaculty && (
              <div>
                <label className={labelCls}>Department</label>
                <div className="space-y-2">
                  {departments.length > 0 && (
                    <div className="relative">
                      <select {...register('departmentId')} className={`${inputCls} appearance-none pr-10`}>
                        <option value="">Select department…</option>
                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-2.5 text-outline pointer-events-none" style={{ fontSize: 18 }}>expand_more</span>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input
                      value={newDeptName}
                      onChange={e => setNewDeptName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && e.preventDefault()}
                      placeholder={departments.length > 0 ? 'Not listed? Add department…' : 'Enter department name…'}
                      className={`${inputCls} flex-1`}
                    />
                    <button type="button" onClick={addDept} disabled={!newDeptName.trim() || creatingDept}
                      className="flex items-center gap-1 px-3 py-2.5 bg-primary text-on-primary text-sm rounded-lg hover:bg-surface-tint disabled:opacity-50 transition-colors shrink-0">
                      {creatingDept
                        ? <span className="material-symbols-outlined animate-spin" style={{ fontSize: 16 }}>progress_activity</span>
                        : <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>}
                      Add
                    </button>
                  </div>
                </div>
                <FieldError msg={errors.departmentId?.message} />
              </div>
            )}

            {/* Level */}
            <div>
              <label className={labelCls}>Current Level</label>
              <div className="relative">
                <select {...register('currentLevel')} className={`${inputCls} appearance-none pr-10`}>
                  <option value="">Select level…</option>
                  {LEVELS.map(l => <option key={l} value={l}>{l} Level</option>)}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-2.5 text-outline pointer-events-none" style={{ fontSize: 18 }}>expand_more</span>
              </div>
              <FieldError msg={errors.currentLevel?.message} />
            </div>

            {/* Matric year */}
            <div>
              <label className={labelCls}>
                Matric Year <span className="text-outline font-normal normal-case">(optional)</span>
              </label>
              <input {...register('matricYear')} type="number" className={inputCls} placeholder="e.g. 2022" />
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 border border-outline-variant hover:bg-surface-container text-on-surface font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary text-on-primary font-semibold py-3 rounded-lg shadow-sm hover:bg-surface-tint transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin" style={{ fontSize: 16 }}>progress_activity</span>
                    Creating…
                  </>
                ) : 'Create Account'}
              </button>
            </div>
          </>
        )}
      </form>

      <p className="text-center text-sm text-on-surface-variant mt-8">
        Already have an account?{' '}
        <Link href="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
      </p>
    </>
  );
}
