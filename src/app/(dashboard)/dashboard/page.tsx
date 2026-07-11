'use client';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { gpaService } from '@/services/gpa.service';
import { useAuthStore } from '@/store/auth.store';
import { Analytics, GRADE_CLASSES } from '@/types';
import Link from 'next/link';

function StepCard({ num, icon, title, desc, href }: { num: number; icon: string; title: string; desc: string; href?: string }) {
  const content = (
    <div className={`bg-surface-container-lowest rounded-xl border p-5 flex flex-col gap-3 transition-all ${href ? 'border-outline-variant hover:border-primary hover:shadow-md cursor-pointer' : 'border-outline-variant/50 opacity-70'}`}>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary text-sm font-bold shrink-0">{num}</div>
        <span className="material-symbols-outlined text-primary" style={{ fontSize: 22, fontVariationSettings: "'FILL' 1" }}>{icon}</span>
      </div>
      <div>
        <p className="text-sm font-semibold text-on-surface">{title}</p>
        <p className="text-xs text-on-surface-variant mt-1">{desc}</p>
      </div>
      {href && (
        <span className="text-xs font-semibold text-primary flex items-center gap-1 mt-auto">
          Get started
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_forward</span>
        </span>
      )}
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

function StatCard({ label, value, sub, icon, iconBg }: {
  label: string; value: string | number; sub?: string;
  icon: string; iconBg: string;
}) {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant shadow-sm">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${iconBg}`}>
        <span className="material-symbols-outlined text-on-primary" style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}>{icon}</span>
      </div>
      <p className="text-xl font-bold text-on-surface leading-tight">{value}</p>
      <p className="text-[13px] font-semibold text-on-surface mt-0.5">{label}</p>
      {sub && <p className="text-xs text-on-surface-variant mt-1">{sub}</p>}
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data: analytics, isLoading } = useQuery<Analytics>({
    queryKey: ['analytics'],
    queryFn: gpaService.getAnalytics,
    retry: false,
  });

  const student = user?.student;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="space-y-1.5">
          <div className="skeleton h-7 w-48 rounded-lg" />
          <div className="skeleton h-4 w-64 rounded-lg" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}
        </div>
        <div className="skeleton h-64 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="skeleton h-48 rounded-xl" />
          <div className="skeleton h-48 rounded-xl" />
        </div>
      </div>
    );
  }

  const noCgpa = !analytics || analytics.totalUnitsCompleted === 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-on-background">
          {getGreeting()}, {student?.name?.split(' ')[0] ?? 'Student'} 👋
        </h1>
        <p className="text-xs text-on-surface-variant mt-1">
          {[student?.school?.name, student?.department?.name, student?.currentLevel ? `${student.currentLevel} Level` : null]
            .filter(Boolean).join(' · ')}
        </p>
      </div>

      {/* Empty state */}
      {noCgpa ? (
        <div className="space-y-5">
          <div className="bg-primary-container/30 border border-on-primary-container/10 rounded-xl p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-primary-container flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-on-primary-container" style={{ fontSize: 28, fontVariationSettings: "'FILL' 1" }}>school</span>
            </div>
            <h3 className="text-[18px] font-bold text-on-surface mb-2">Welcome to GradePath!</h3>
            <p className="text-sm text-on-surface-variant max-w-xs mx-auto">
              Follow the steps below to set up your academic record. It only takes a minute.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StepCard
              num={1}
              icon="volunteer_activism"
              title="Add Your Courses"
              desc="Go to Contribute and add your department's courses for each semester."
              href="/contribute"
            />
            <StepCard
              num={2}
              icon="calculate"
              title="Enter Your Grades"
              desc="Open the Calculator, pick your semester, and assign grades to each course."
              href="/calculator"
            />
            <StepCard
              num={3}
              icon="insights"
              title="Track Your CGPA"
              desc="Your CGPA, GPA trend, grade distribution, and class chances will appear here."
            />
          </div>
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Current CGPA" value={analytics!.cgpa.toFixed(2)}
              sub={analytics!.currentClass} icon="workspace_premium" iconBg="bg-primary"
            />
            <StatCard
              label="Grade Class" value={analytics!.currentClass.split(' ')[0]}
              sub={analytics!.currentClass} icon="trending_up" iconBg="bg-secondary"
            />
            <StatCard
              label="Units Completed" value={analytics!.totalUnitsCompleted}
              sub="credit units" icon="menu_book" iconBg="bg-tertiary"
            />
            <StatCard
              label="Strongest Course"
              value={analytics!.strongestCourse?.split(' ').slice(0, 2).join(' ') ?? '—'}
              sub={analytics!.strongestCourse} icon="star" iconBg="bg-error"
            />
          </div>

          {/* GPA Trend chart */}
          {analytics!.semesterTrend.length > 1 && (
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6">
              <h3 className="text-[16px] font-semibold text-on-surface mb-5 flex items-center gap-2">
                <span className="material-symbols-outlined text-outline">show_chart</span>
                GPA Trend
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={analytics!.semesterTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e3e5" />
                  <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#464555' }} />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 12, fill: '#464555' }} />
                  <Tooltip
                    formatter={(v) => typeof v === 'number' ? v.toFixed(2) : ''}
                    contentStyle={{ background: '#fff', border: '1px solid #c7c4d8', borderRadius: 8 }}
                  />
                  <Line type="monotone" dataKey="gpa" stroke="#3525cd" strokeWidth={2.5} dot={{ fill: '#3525cd', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Grade distribution + class chances */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6">
              <h3 className="text-[16px] font-semibold text-on-surface mb-5 flex items-center gap-2">
                <span className="material-symbols-outlined text-outline">bar_chart</span>
                Grade Distribution
              </h3>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={Object.entries(analytics!.gradeDistribution).map(([grade, count]) => ({ grade, count }))}>
                  <XAxis dataKey="grade" tick={{ fontSize: 12, fill: '#464555' }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#464555' }} />
                  <Tooltip contentStyle={{ background: '#fff', border: '1px solid #c7c4d8', borderRadius: 8 }} />
                  <Bar dataKey="count" fill="#3525cd" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6">
              <h3 className="text-[16px] font-semibold text-on-surface mb-5 flex items-center gap-2">
                <span className="material-symbols-outlined text-outline">target</span>
                Graduation Class Chances
              </h3>
              <div className="space-y-3.5">
                {GRADE_CLASSES.map(gc => {
                  const achieved = analytics!.cgpa >= gc.min;
                  const pct = Math.min(100, (analytics!.cgpa / gc.min) * 100);
                  return (
                    <div key={gc.label}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className={achieved ? 'font-semibold text-on-surface' : 'text-on-surface-variant'}>{gc.label}</span>
                        <span className="text-outline text-xs">{gc.min}+</span>
                      </div>
                      <div className="h-1.5 bg-surface-container-highest rounded-full">
                        <div
                          className={`h-1.5 rounded-full transition-all ${achieved ? 'bg-secondary' : 'bg-primary-container'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 flex-wrap">
            <Link href="/predict" className="inline-flex items-center gap-2 bg-primary text-on-primary text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-surface-tint transition-colors">
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>query_stats</span>
              Predict My CGPA
            </Link>
            <Link href="/plan" className="inline-flex items-center gap-2 border border-outline-variant bg-surface-container-lowest text-on-surface text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>calendar_month</span>
              Study Plan
            </Link>
            <Link href="/calculator" className="inline-flex items-center gap-2 border border-outline-variant bg-surface-container-lowest text-on-surface text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
              Add Semester
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
