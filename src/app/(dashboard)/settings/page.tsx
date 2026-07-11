'use client';
import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { studentsService } from '@/services/students.service';
import { authService } from '@/services/auth.service';
import { schoolsService } from '@/services/schools.service';
import { useAuthStore } from '@/store/auth.store';
import { GRADE_CLASSES, LEVELS, School, Faculty, Department } from '@/types';

const inputCls = 'w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-lg text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow';
const labelCls = 'block text-[11px] font-semibold text-on-surface-variant mb-2 uppercase tracking-wide';
const readonlyCls = 'w-full px-4 py-2.5 bg-surface-container border border-outline-variant rounded-lg text-sm text-on-surface-variant';

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const student = user?.student;
  const isAnonymous = user?.email?.endsWith('@gradepath.local') ?? false;

  // ── Edit profile state ──────────────────────────────────────
  const [name, setName] = useState(student?.name ?? '');
  const [level, setLevel] = useState<number>(student?.currentLevel ?? 100);
  const [targetGrade, setTargetGrade] = useState(student?.targetGrade ?? '');
  const [targetCgpa, setTargetCgpa] = useState<number>(student?.targetCgpa ?? 4.5);

  // ── Claim account state ─────────────────────────────────────
  const [claimEmail, setClaimEmail] = useState('');
  const [claimPassword, setClaimPassword] = useState('');
  const [claimPassword2, setClaimPassword2] = useState('');

  // ── Profile setup state (anonymous + no student) ────────────
  const [setupName, setSetupName] = useState('');
  const [setupLevel, setSetupLevel] = useState<number>(100);
  const [schoolSearch, setSchoolSearch] = useState('');
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [creatingSchool, setCreatingSchool] = useState(false);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [newFacultyName, setNewFacultyName] = useState('');
  const [creatingFaculty, setCreatingFaculty] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [newDeptName, setNewDeptName] = useState('');
  const [creatingDept, setCreatingDept] = useState(false);

  useEffect(() => {
    if (!schoolSearch.trim()) { setSchools([]); return; }
    const t = setTimeout(() => {
      schoolsService.getAll(schoolSearch).then(setSchools).catch(() => setSchools([]));
    }, 300);
    return () => clearTimeout(t);
  }, [schoolSearch]);

  useEffect(() => {
    if (!selectedSchool) return;
    setFaculties([]); setSelectedFaculty(null); setDepartments([]); setSelectedDeptId('');
    schoolsService.getFaculties(selectedSchool.id).then(setFaculties).catch(() => setFaculties([]));
  }, [selectedSchool]);

  useEffect(() => {
    if (!selectedFaculty) return;
    setDepartments([]); setSelectedDeptId('');
    schoolsService.getDepartments(selectedFaculty.id).then(setDepartments).catch(() => setDepartments([]));
  }, [selectedFaculty]);

  const pickSchool = (s: School) => { setSelectedSchool(s); setSchools([]); setSchoolSearch(''); };

  const addSchool = async () => {
    const n = schoolSearch.trim(); if (!n) return;
    setCreatingSchool(true);
    try { const s = await schoolsService.create({ name: n }); toast.success(`${s.name} added!`); pickSchool(s); }
    catch (e: any) { toast.error(e.response?.data?.message ?? 'Could not add school'); }
    finally { setCreatingSchool(false); }
  };

  const addFaculty = async () => {
    const n = newFacultyName.trim(); if (!n || !selectedSchool) return;
    setCreatingFaculty(true);
    try {
      const f = await schoolsService.createFaculty({ name: n, schoolId: selectedSchool.id });
      toast.success(`${f.name} added!`); setSelectedFaculty(f); setNewFacultyName('');
    } catch (e: any) { toast.error(e.response?.data?.message ?? 'Could not add faculty'); }
    finally { setCreatingFaculty(false); }
  };

  const addDept = async () => {
    const n = newDeptName.trim(); if (!n || !selectedFaculty) return;
    setCreatingDept(true);
    try {
      const d = await schoolsService.createDepartment({ name: n, facultyId: selectedFaculty.id });
      toast.success(`${d.name} added!`); setSelectedDeptId(d.id); setNewDeptName('');
    } catch (e: any) { toast.error(e.response?.data?.message ?? 'Could not add department'); }
    finally { setCreatingDept(false); }
  };

  const noSchoolFound = schoolSearch.trim().length > 1 && schools.length === 0 && !selectedSchool;

  // ── Mutations ───────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: () => studentsService.updateProfile({ name: name.trim(), currentLevel: level, targetGrade: targetGrade || undefined, targetCgpa: targetCgpa || undefined }),
    onSuccess: async () => {
      toast.success('Profile updated');
      try { setUser(await authService.me()); } catch {}
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Update failed'),
  });

  const setupMutation = useMutation({
    mutationFn: () => studentsService.createProfile({
      name: setupName.trim(),
      schoolId: selectedSchool!.id,
      departmentId: selectedDeptId,
      currentLevel: setupLevel,
    }),
    onSuccess: async () => {
      toast.success('Profile created!');
      try { setUser(await authService.me()); } catch {}
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Setup failed'),
  });

  const claimMutation = useMutation({
    mutationFn: () => authService.claimAccount({ email: claimEmail.trim(), password: claimPassword }),
    onSuccess: async (updatedUser) => {
      toast.success('Account claimed! Your data is now tied to your email.');
      setUser(updatedUser);
      setClaimEmail(''); setClaimPassword(''); setClaimPassword2('');
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Could not claim account'),
  });

  const canSetup = setupName.trim() && selectedSchool && selectedDeptId && !setupMutation.isPending;
  const canClaim = claimEmail.includes('@') && claimPassword.length >= 6 && claimPassword === claimPassword2 && !claimMutation.isPending;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-on-background">Settings</h1>
        <p className="text-xs text-on-surface-variant mt-1">Manage your academic profile and account.</p>
      </div>

      {/* Account info */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6">
        <h2 className="text-[16px] font-semibold text-on-surface mb-5 flex items-center gap-2">
          <span className="material-symbols-outlined text-outline">account_circle</span>
          Account
        </h2>
        <div className="space-y-4">
          {isAnonymous ? (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-tertiary-container/40 border border-on-tertiary-container/10">
              <span className="material-symbols-outlined text-on-tertiary-container mt-0.5" style={{ fontSize: 20 }}>info</span>
              <div>
                <p className="text-sm font-semibold text-on-tertiary-container">You&apos;re using a guest account</p>
                <p className="text-xs text-on-tertiary-container/80 mt-0.5">Your data is saved on this device. Claim your account below to access it from anywhere.</p>
              </div>
            </div>
          ) : (
            <>
              <div>
                <p className={labelCls}>Email</p>
                <p className={readonlyCls}>{user?.email ?? '—'}</p>
              </div>
              <div>
                <p className={labelCls}>School</p>
                <p className={readonlyCls}>{student?.school?.name ?? '—'}</p>
              </div>
              <div>
                <p className={labelCls}>Department</p>
                <p className={readonlyCls}>{student?.department?.name ?? '—'}</p>
                <p className="text-xs text-on-surface-variant mt-1.5">To change school or department, contact support.</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Profile setup for anonymous users with no student profile ── */}
      {isAnonymous && !student && (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6">
          <h2 className="text-[16px] font-semibold text-on-surface mb-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-outline">school</span>
            Complete Your Profile
          </h2>
          <p className="text-sm text-on-surface-variant mb-5">Set your school and department so the calculator can load your courses.</p>

          <div className="space-y-4">
            <div>
              <label className={labelCls}>Your Name</label>
              <input value={setupName} onChange={e => setSetupName(e.target.value)} className={inputCls} placeholder="Full name" />
            </div>

            {/* School picker */}
            <div>
              <label className={labelCls}>School</label>
              {selectedSchool ? (
                <div className="flex items-center justify-between px-4 py-2.5 rounded-lg border border-secondary-container bg-secondary-container/30">
                  <span className="flex items-center gap-2 text-sm font-medium text-on-secondary-container">
                    <span className="material-symbols-outlined text-secondary" style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    {selectedSchool.name}
                  </span>
                  <button type="button" onClick={() => { setSelectedSchool(null); setFaculties([]); setSelectedFaculty(null); setDepartments([]); setSelectedDeptId(''); }}
                    className="text-xs text-on-surface-variant hover:text-primary ml-3 shrink-0 font-medium">Change</button>
                </div>
              ) : (
                <div className="space-y-2">
                  <input value={schoolSearch} onChange={e => setSchoolSearch(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && e.preventDefault()}
                    className={inputCls} placeholder="Search your university…" />
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
                        <span className="font-medium text-on-surface">&ldquo;{schoolSearch.trim()}&rdquo;</span> not found
                      </p>
                      <button type="button" onClick={addSchool} disabled={creatingSchool}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-on-primary text-xs font-semibold rounded-lg hover:bg-surface-tint disabled:opacity-60 transition-colors shrink-0">
                        {creatingSchool ? <span className="material-symbols-outlined animate-spin" style={{ fontSize: 12 }}>progress_activity</span>
                          : <span className="material-symbols-outlined" style={{ fontSize: 12 }}>add</span>}
                        Add school
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Faculty picker */}
            {selectedSchool && (
              <div>
                <label className={labelCls}>Faculty</label>
                {selectedFaculty ? (
                  <div className="flex items-center justify-between px-4 py-2.5 rounded-lg border border-secondary-container bg-secondary-container/30">
                    <span className="flex items-center gap-2 text-sm font-medium text-on-secondary-container">
                      <span className="material-symbols-outlined text-secondary" style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      {selectedFaculty.name}
                    </span>
                    <button type="button" onClick={() => { setSelectedFaculty(null); setDepartments([]); setSelectedDeptId(''); }}
                      className="text-xs text-on-surface-variant hover:text-primary ml-3 shrink-0 font-medium">Change</button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {faculties.length > 0 && (
                      <div className="border border-outline-variant rounded-lg divide-y divide-outline-variant max-h-36 overflow-auto shadow-sm bg-surface-container-lowest">
                        {faculties.map(f => (
                          <button key={f.id} type="button" onClick={() => setSelectedFaculty(f)}
                            className="w-full text-left px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container hover:text-primary transition-colors">
                            {f.name}
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input value={newFacultyName} onChange={e => setNewFacultyName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && e.preventDefault()}
                        placeholder={faculties.length > 0 ? 'Not listed? Type to add…' : 'Enter faculty name…'}
                        className={`${inputCls} flex-1`} />
                      <button type="button" onClick={addFaculty} disabled={!newFacultyName.trim() || creatingFaculty}
                        className="flex items-center gap-1 px-3 py-2.5 bg-primary text-on-primary text-sm rounded-lg hover:bg-surface-tint disabled:opacity-50 transition-colors shrink-0">
                        {creatingFaculty ? <span className="material-symbols-outlined animate-spin" style={{ fontSize: 16 }}>progress_activity</span>
                          : <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>}
                        Add
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Department picker */}
            {selectedFaculty && (
              <div>
                <label className={labelCls}>Department</label>
                <div className="space-y-2">
                  {departments.length > 0 && (
                    <div className="relative">
                      <select value={selectedDeptId} onChange={e => setSelectedDeptId(e.target.value)}
                        className={`${inputCls} appearance-none pr-10`}>
                        <option value="">Select department…</option>
                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-2.5 text-outline pointer-events-none" style={{ fontSize: 18 }}>expand_more</span>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input value={newDeptName} onChange={e => setNewDeptName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && e.preventDefault()}
                      placeholder={departments.length > 0 ? 'Not listed? Add department…' : 'Enter department name…'}
                      className={`${inputCls} flex-1`} />
                    <button type="button" onClick={addDept} disabled={!newDeptName.trim() || creatingDept}
                      className="flex items-center gap-1 px-3 py-2.5 bg-primary text-on-primary text-sm rounded-lg hover:bg-surface-tint disabled:opacity-50 transition-colors shrink-0">
                      {creatingDept ? <span className="material-symbols-outlined animate-spin" style={{ fontSize: 16 }}>progress_activity</span>
                        : <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>}
                      Add
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className={labelCls}>Current Level</label>
              <div className="relative">
                <select value={setupLevel} onChange={e => setSetupLevel(+e.target.value)} className={`${inputCls} appearance-none`}>
                  {LEVELS.map(l => <option key={l} value={l}>{l} Level</option>)}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-2.5 text-outline pointer-events-none" style={{ fontSize: 18 }}>expand_more</span>
              </div>
            </div>

            <button onClick={() => setupMutation.mutate()} disabled={!canSetup}
              className="w-full bg-primary text-on-primary font-semibold py-3 rounded-lg shadow-sm hover:bg-surface-tint transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {setupMutation.isPending ? (
                <><span className="material-symbols-outlined animate-spin" style={{ fontSize: 18 }}>progress_activity</span>Setting up…</>
              ) : (
                <><span className="material-symbols-outlined" style={{ fontSize: 18 }}>check_circle</span>Complete Setup</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── Academic Profile (for users with a student profile) ── */}
      {student && (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6">
          <h2 className="text-[16px] font-semibold text-on-surface mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-outline">edit</span>
            Academic Profile
          </h2>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Full Name</label>
              <input value={name} onChange={e => setName(e.target.value)} className={inputCls} placeholder="Your full name" />
            </div>
            <div>
              <label className={labelCls}>Current Level</label>
              <div className="relative">
                <select value={level} onChange={e => setLevel(+e.target.value)} className={`${inputCls} appearance-none`}>
                  {LEVELS.map(l => <option key={l} value={l}>{l} Level</option>)}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-2.5 text-outline pointer-events-none" style={{ fontSize: 18 }}>expand_more</span>
              </div>
            </div>
            <div>
              <label className={labelCls}>Target Classification <span className="text-outline font-normal normal-case">(optional)</span></label>
              <div className="relative">
                <select value={targetGrade} onChange={e => { setTargetGrade(e.target.value); const gc = GRADE_CLASSES.find(g => g.label === e.target.value); if (gc) setTargetCgpa(gc.min); }}
                  className={`${inputCls} appearance-none`}>
                  <option value="">No target set</option>
                  {GRADE_CLASSES.map(g => <option key={g.label} value={g.label}>{g.label} ({g.min}+)</option>)}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-2.5 text-outline pointer-events-none" style={{ fontSize: 18 }}>expand_more</span>
              </div>
            </div>
            <button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending || !name.trim()}
              className="w-full bg-primary text-on-primary font-semibold py-3 rounded-lg shadow-sm hover:bg-surface-tint transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {updateMutation.isPending ? (
                <><span className="material-symbols-outlined animate-spin" style={{ fontSize: 18 }}>progress_activity</span>Saving…</>
              ) : (
                <><span className="material-symbols-outlined" style={{ fontSize: 18 }}>save</span>Save Changes</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── Claim account (anonymous users only) ── */}
      {isAnonymous && (
        <div className="bg-surface-container-lowest rounded-xl border border-secondary-container shadow-sm p-6">
          <h2 className="text-[16px] font-semibold text-on-surface mb-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">lock</span>
            Protect Your Data
          </h2>
          <p className="text-sm text-on-surface-variant mb-5">
            Add an email and password to access your grades from any device. Your existing data is preserved.
          </p>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Email</label>
              <input type="email" value={claimEmail} onChange={e => setClaimEmail(e.target.value)}
                className={inputCls} placeholder="you@university.edu.ng" />
            </div>
            <div>
              <label className={labelCls}>Password</label>
              <input type="password" value={claimPassword} onChange={e => setClaimPassword(e.target.value)}
                className={inputCls} placeholder="Min. 6 characters" />
            </div>
            <div>
              <label className={labelCls}>Confirm Password</label>
              <input type="password" value={claimPassword2} onChange={e => setClaimPassword2(e.target.value)}
                className={inputCls} placeholder="Repeat password" />
              {claimPassword2 && claimPassword !== claimPassword2 && (
                <p className="text-xs text-error mt-1.5 flex items-center gap-1">
                  <span className="material-symbols-outlined" style={{ fontSize: 13 }}>error</span>
                  Passwords don&apos;t match
                </p>
              )}
            </div>
            <button onClick={() => claimMutation.mutate()} disabled={!canClaim}
              className="w-full bg-secondary text-on-secondary font-semibold py-3 rounded-lg shadow-sm hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {claimMutation.isPending ? (
                <><span className="material-symbols-outlined animate-spin" style={{ fontSize: 18 }}>progress_activity</span>Saving…</>
              ) : (
                <><span className="material-symbols-outlined" style={{ fontSize: 18 }}>verified_user</span>Claim My Account</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
