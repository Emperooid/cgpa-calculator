'use client';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { studentsService } from '@/services/students.service';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { GRADE_CLASSES, LEVELS } from '@/types';

const inputCls = 'w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-lg text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow';
const labelCls = 'block text-[11px] font-semibold text-on-surface-variant mb-2 uppercase tracking-wide';
const readonlyCls = 'w-full px-4 py-2.5 bg-surface-container border border-outline-variant rounded-lg text-sm text-on-surface-variant';

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const student = user?.student;

  const [name, setName] = useState(student?.name ?? '');
  const [level, setLevel] = useState<number>(student?.currentLevel ?? 100);
  const [targetGrade, setTargetGrade] = useState(student?.targetGrade ?? '');
  const [targetCgpa, setTargetCgpa] = useState<number>(student?.targetCgpa ?? 4.5);

  const mutation = useMutation({
    mutationFn: () =>
      studentsService.updateProfile({
        name: name.trim(),
        currentLevel: level,
        targetGrade: targetGrade || undefined,
        targetCgpa: targetCgpa || undefined,
      }),
    onSuccess: async () => {
      toast.success('Profile updated');
      try {
        const fresh = await authService.me();
        setUser(fresh);
      } catch {}
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Update failed'),
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-[28px] font-bold tracking-tight text-on-background">Settings</h1>
        <p className="text-sm text-on-surface-variant mt-1">Manage your academic profile.</p>
      </div>

      {/* Account info (read-only) */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6">
        <h2 className="text-[16px] font-semibold text-on-surface mb-5 flex items-center gap-2">
          <span className="material-symbols-outlined text-outline">account_circle</span>
          Account
        </h2>
        <div className="space-y-4">
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
            <p className="text-xs text-on-surface-variant mt-1.5">
              To change school or department, contact support.
            </p>
          </div>
        </div>
      </div>

      {/* Editable profile */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6">
        <h2 className="text-[16px] font-semibold text-on-surface mb-5 flex items-center gap-2">
          <span className="material-symbols-outlined text-outline">edit</span>
          Academic Profile
        </h2>
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Full Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className={inputCls}
              placeholder="Your full name"
            />
          </div>

          <div>
            <label className={labelCls}>Current Level</label>
            <div className="relative">
              <select
                value={level}
                onChange={e => setLevel(+e.target.value)}
                className={`${inputCls} appearance-none`}
              >
                {LEVELS.map(l => <option key={l} value={l}>{l} Level</option>)}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-2.5 text-outline pointer-events-none" style={{ fontSize: 18 }}>expand_more</span>
            </div>
          </div>

          <div>
            <label className={labelCls}>
              Target Classification <span className="text-outline font-normal normal-case">(optional)</span>
            </label>
            <div className="relative">
              <select
                value={targetGrade}
                onChange={e => {
                  setTargetGrade(e.target.value);
                  const gc = GRADE_CLASSES.find(g => g.label === e.target.value);
                  if (gc) setTargetCgpa(gc.min);
                }}
                className={`${inputCls} appearance-none`}
              >
                <option value="">No target set</option>
                {GRADE_CLASSES.map(g => (
                  <option key={g.label} value={g.label}>{g.label} ({g.min}+)</option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-2.5 text-outline pointer-events-none" style={{ fontSize: 18 }}>expand_more</span>
            </div>
          </div>

          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !name.trim()}
            className="w-full bg-primary text-on-primary font-semibold py-3 rounded-lg shadow-sm hover:bg-surface-tint transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {mutation.isPending ? (
              <>
                <span className="material-symbols-outlined animate-spin" style={{ fontSize: 18 }}>progress_activity</span>
                Saving…
              </>
            ) : (
              <>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>save</span>
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
