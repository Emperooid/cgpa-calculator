'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

const FEATURES = [
  { icon: 'calculate', title: 'GPA & CGPA Calculator', desc: 'Instant calculation with the Nigerian 5-point scale' },
  { icon: 'query_stats', title: 'CGPA Predictor', desc: 'Know exactly what grades you need for First Class' },
  { icon: 'calendar_month', title: 'AI Study Planner', desc: 'Personalised weekly schedule built around your goals' },
  { icon: 'volunteer_activism', title: 'Crowd-Powered Courses', desc: 'Courses pre-loaded for your school & department' },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (mounted && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [mounted, isAuthenticated, router]);

  if (!mounted || isAuthenticated) return null;

  return (
    <div className="min-h-screen flex bg-background">

      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[520px] bg-primary flex-col justify-between p-12 text-on-primary relative overflow-hidden shrink-0">
        <div className="absolute inset-0 bg-linear-to-br from-primary via-primary to-surface-tint opacity-90 pointer-events-none" />

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-full bg-on-primary/20 border border-on-primary/30 flex items-center justify-center font-bold text-lg">
              G
            </div>
            <div>
              <h1 className="text-[20px] font-bold leading-tight">GradePath</h1>
              <p className="text-[11px] font-semibold text-primary-fixed opacity-80">Academic Intelligence</p>
            </div>
          </Link>

          <h2 className="text-[32px] font-bold leading-tight mb-3">
            Track your path to<br />academic excellence.
          </h2>
          <p className="text-primary-fixed opacity-80 text-[15px] mb-10">
            The smartest way for Nigerian university students to manage their grades and plan their future.
          </p>
        </div>

        <div className="relative z-10 space-y-5">
          {FEATURES.map(f => (
            <div key={f.title} className="flex gap-4 items-start">
              <div className="w-9 h-9 rounded-lg bg-on-primary/15 border border-on-primary/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-on-primary" style={{ fontSize: 18 }}>{f.icon}</span>
              </div>
              <div>
                <p className="font-semibold text-[14px]">{f.title}</p>
                <p className="text-primary-fixed opacity-70 text-[13px]">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="relative z-10 text-primary-fixed opacity-50 text-xs mt-8">
          Used by students across Nigerian universities
        </p>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-surface-container-lowest overflow-y-auto">
        {/* Mobile logo */}
        <Link href="/" className="flex lg:hidden items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-sm">G</div>
          <span className="text-[17px] font-bold text-primary">GradePath</span>
        </Link>

        <div className="w-full max-w-[400px]">
          {children}
        </div>
      </div>

    </div>
  );
}
