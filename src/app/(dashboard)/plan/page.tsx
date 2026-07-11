'use client';
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { studyPlansService } from '@/services/study-plans.service';
import { coursesService } from '@/services/courses.service';
import { gpaService } from '@/services/gpa.service';
import { useAuthStore } from '@/store/auth.store';
import { StudyPlan, Analytics, GRADE_CLASSES, Course } from '@/types';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DAY_STYLE: Record<string, { card: string; text: string; badge: string; bullet: string }> = {
  Monday:    { card: 'bg-primary-container border-on-primary-container/10',    text: 'text-on-primary-container',    badge: 'bg-on-primary-container/10 text-on-primary-container',    bullet: 'text-on-primary-container' },
  Tuesday:   { card: 'bg-secondary-container border-on-secondary-container/10', text: 'text-on-secondary-container',  badge: 'bg-on-secondary-container/10 text-on-secondary-container',  bullet: 'text-on-secondary-container' },
  Wednesday: { card: 'bg-tertiary-container border-on-tertiary-container/10',  text: 'text-on-tertiary-container',   badge: 'bg-on-tertiary-container/10 text-on-tertiary-container',   bullet: 'text-on-tertiary-container' },
  Thursday:  { card: 'bg-surface-variant border-outline-variant',               text: 'text-on-surface',              badge: 'bg-surface-container-high text-on-surface-variant',          bullet: 'text-on-surface-variant' },
  Friday:    { card: 'bg-primary-fixed border-on-primary-fixed/10',            text: 'text-on-primary-fixed',        badge: 'bg-on-primary-fixed/10 text-on-primary-fixed',            bullet: 'text-on-primary-fixed' },
  Saturday:  { card: 'bg-secondary-fixed border-on-secondary-fixed/10',        text: 'text-on-secondary-fixed',      badge: 'bg-on-secondary-fixed/10 text-on-secondary-fixed',        bullet: 'text-on-secondary-fixed' },
  Sunday:    { card: 'bg-surface-container-high border-outline-variant',        text: 'text-on-surface-variant',      badge: 'bg-surface-container-highest text-on-surface-variant',     bullet: 'text-on-surface-variant' },
};

export default function PlanPage() {
  const { user } = useAuthStore();
  const dept = user?.student?.departmentId ?? '';
  const level = user?.student?.currentLevel ?? 100;

  const [targetGrade, setTargetGrade] = useState('First Class');
  const [targetCgpa, setTargetCgpa] = useState(4.5);
  const [semester, setSemester] = useState(1);

  const { data: plan, isLoading: planLoading, refetch } = useQuery<StudyPlan>({
    queryKey: ['study-plan'],
    queryFn: studyPlansService.getActive,
    retry: false,
  });

  const { data: courses } = useQuery<Course[]>({
    queryKey: ['courses', dept, level, semester],
    queryFn: () => coursesService.forSemester(dept, level, semester),
    enabled: !!dept,
  });

  const { data: analytics } = useQuery<Analytics>({
    queryKey: ['analytics'],
    queryFn: gpaService.getAnalytics,
    retry: false,
  });

  const generateMutation = useMutation({
    mutationFn: () =>
      studyPlansService.generate({
        targetGrade,
        targetCgpa,
        semesterCourses: (courses ?? []).map(c => ({ code: c.code, title: c.title, units: c.units })),
      }),
    onSuccess: () => { toast.success('Study plan generated!'); refetch(); },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Generation failed'),
  });

  const currentCgpa = analytics?.cgpa ?? 0;
  const targetPct = Math.min(100, (currentCgpa / targetCgpa) * 100);

  return (
    <div>
      {/* Page header */}
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-on-background">Study Plan</h2>
          <p className="text-xs text-on-surface-variant mt-1">Optimize your academic routine for maximum retention.</p>
        </div>
        <button
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
          className="flex items-center gap-2 bg-primary text-on-primary text-sm font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-primary-container hover:text-on-primary-container transition-colors disabled:opacity-50"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
          {generateMutation.isPending ? 'Generating…' : 'New Plan'}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ── Left column ── */}
        <div className="lg:col-span-8 flex flex-col gap-6">

          {/* Active Plan Banner */}
          {planLoading && (
            <div className="skeleton h-28 rounded-xl" />
          )}
          {plan && (
            <div className="relative overflow-hidden rounded-xl bg-primary text-on-primary shadow-sm p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="absolute inset-0 bg-linear-to-r from-primary to-surface-tint opacity-80 pointer-events-none" />
              <div className="relative z-10 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-on-primary/20 flex items-center justify-center border border-on-primary/30">
                  <span className="material-symbols-outlined" style={{ fontSize: 24 }}>workspace_premium</span>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-primary-fixed uppercase tracking-wider mb-1">Active Target</p>
                  <h3 className="text-[16px] font-bold leading-6">{plan.targetGrade}</h3>
                </div>
              </div>
              <div className="relative z-10 flex gap-6 bg-surface-tint/40 backdrop-blur-md px-6 py-3 rounded-lg border border-on-primary/10">
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold">{plan.plan?.studyHoursPerDay ?? '—'}h</span>
                  <span className="text-[11px] font-semibold text-primary-fixed opacity-90">Daily Avg</span>
                </div>
                <div className="w-px bg-on-primary/20" />
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold">{plan.plan?.totalWeeklyHours ?? '—'}h</span>
                  <span className="text-[11px] font-semibold text-primary-fixed opacity-90">Weekly Total</span>
                </div>
              </div>
            </div>
          )}

          {/* Plan Configuration card */}
          <div className="bg-surface-container-lowest border border-outline-variant shadow-sm rounded-xl p-6">
            <h3 className="text-[16px] font-semibold text-on-surface mb-6 pb-4 border-b border-surface-container flex items-center gap-2">
              <span className="material-symbols-outlined text-outline">tune</span>
              Plan Configuration
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-[11px] font-semibold text-on-surface-variant mb-2">Target Classification</label>
                <div className="relative">
                  <select
                    value={targetGrade}
                    onChange={e => {
                      setTargetGrade(e.target.value);
                      const gc = GRADE_CLASSES.find(g => g.label === e.target.value);
                      if (gc) setTargetCgpa(gc.min);
                    }}
                    className="w-full bg-surface border border-outline-variant text-sm text-on-surface rounded-lg px-4 py-2.5 appearance-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow"
                  >
                    {GRADE_CLASSES.map(g => (
                      <option key={g.label} value={g.label}>{g.label} ({g.min}+)</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-2.5 text-outline-variant pointer-events-none" style={{ fontSize: 18 }}>expand_more</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-on-surface-variant mb-2">Current Semester</label>
                <div className="relative">
                  <select
                    value={semester}
                    onChange={e => setSemester(+e.target.value)}
                    className="w-full bg-surface border border-outline-variant text-sm text-on-surface rounded-lg px-4 py-2.5 appearance-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow"
                  >
                    <option value={1}>First Semester</option>
                    <option value={2}>Second Semester</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-2.5 text-outline-variant pointer-events-none" style={{ fontSize: 18 }}>expand_more</span>
                </div>
              </div>
            </div>

            {/* Course chips */}
            <div className="mb-8">
              <label className="block text-[11px] font-semibold text-on-surface-variant mb-3">
                Focus Areas {courses && courses.length > 0 ? `(${courses.length} courses)` : ''}
              </label>
              {courses && courses.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {courses.map(c => (
                    <span key={c.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container border border-outline-variant text-[12px] font-medium text-on-surface">
                      {c.code} · {c.units}u
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-on-surface-variant">
                  {dept ? 'No courses found for this semester. Add them on the Contribute page.' : 'Complete your profile to auto-load semester courses.'}
                </p>
              )}
            </div>

            <button
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              className="w-full bg-primary text-on-primary font-semibold py-3 rounded-lg shadow-sm hover:bg-surface-tint focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 disabled:opacity-50"
            >
              {generateMutation.isPending ? 'Generating…' : 'Generate My Study Plan'}
            </button>
          </div>

          {/* Weekly Execution */}
          {plan && (
            <div>
              <h3 className="text-base font-semibold text-on-surface mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>calendar_view_week</span>
                Weekly Execution
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DAYS.map(day => {
                  const tasks = plan.plan?.weekly?.[day] ?? [];
                  const s = DAY_STYLE[day] ?? DAY_STYLE.Sunday;
                  const totalMatch = tasks.join(' ').match(/\d+\.?\d*h/g);
                  const hours = totalMatch ? totalMatch[totalMatch.length - 1] : null;
                  if (tasks.length === 0) return null;
                  return (
                    <div key={day} className={`border rounded-xl p-5 shadow-sm ${s.card}`}>
                      <h4 className={`text-[16px] font-semibold mb-3 flex justify-between items-center ${s.text}`}>
                        {day}
                        {hours && (
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${s.badge}`}>
                            {hours}
                          </span>
                        )}
                      </h4>
                      <ul className="space-y-2">
                        {tasks.map((t, i) => (
                          <li key={i} className={`flex items-start gap-2 text-sm ${s.text} opacity-80`}>
                            <span className={`material-symbols-outlined mt-0.5 ${s.bullet}`} style={{ fontSize: 16 }}>arrow_right</span>
                            {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── Right column ── */}
        <div className="lg:col-span-4 flex flex-col gap-6">

          {/* Cognitive Optimization tips */}
          <div className="bg-tertiary-fixed border border-on-tertiary-fixed-variant/10 shadow-sm rounded-xl p-6 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10">
              <span className="material-symbols-outlined text-tertiary" style={{ fontSize: 100 }}>menu_book</span>
            </div>
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-lg bg-surface-container-lowest/50 flex items-center justify-center text-on-tertiary-fixed-variant mb-4 border border-on-tertiary-fixed-variant/10">
                <span className="material-symbols-outlined">lightbulb</span>
              </div>
              <h3 className="text-[16px] font-semibold text-on-tertiary-fixed-variant mb-3">Cognitive Optimization</h3>
              {plan?.plan?.tips && plan.plan.tips.length > 0 ? (
                <ul className="space-y-3">
                  {plan.plan?.tips.map((tip, i) => (
                    <li key={i} className="flex gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-on-tertiary-fixed-variant mt-2 shrink-0" />
                      <p className="text-sm text-on-tertiary-fixed-variant/80">{tip}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <ul className="space-y-3">
                  {[
                    'Use the Pomodoro technique (25 min focus, 5 min break) to prevent mental fatigue.',
                    'Prioritize difficult courses during your peak morning cognitive window.',
                    'Review lecture notes within 24 hours to maximize long-term retention.',
                  ].map((tip, i) => (
                    <li key={i} className="flex gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-on-tertiary-fixed-variant mt-2 shrink-0" />
                      <p className="text-sm text-on-tertiary-fixed-variant/80">{tip}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Current Trajectory */}
          <div className="bg-surface-container-lowest border border-outline-variant shadow-sm rounded-xl p-6">
            <h3 className="text-[16px] font-semibold text-on-surface mb-4">Current Trajectory</h3>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-3xl font-bold leading-none tracking-tight text-primary">
                {currentCgpa > 0 ? currentCgpa.toFixed(1) : '—'}
              </span>
              <span className="text-[16px] font-semibold text-on-surface-variant pb-1">/ 5.0 CGPA</span>
            </div>
            <div className="w-full bg-surface-container-highest rounded-full h-2 mb-1">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${currentCgpa > 0 ? targetPct : 0}%` }}
              />
            </div>
            <p className="text-[11px] font-semibold text-outline flex justify-between mt-1">
              <span>Current Base</span>
              <span>Target: {targetCgpa}</span>
            </p>
            {analytics && (
              <p className="text-xs text-on-surface-variant mt-3">
                {analytics.currentClass} · {analytics.totalUnitsCompleted} units completed
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
