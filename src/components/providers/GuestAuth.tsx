'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { authService } from '@/services/auth.service';

// Returning users (with token) get ready=true immediately — no loading state.
// New users get an anonymous account created before children render.
function getInitialReady() {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('cgpa_token');
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav skeleton */}
      <div className="border-b border-surface-container-high px-5 py-2.5 flex items-center justify-between max-w-7xl mx-auto">
        <div className="skeleton h-5 w-24 rounded-lg" />
        <div className="flex gap-3">
          <div className="skeleton h-8 w-16 rounded-lg" />
          <div className="skeleton h-8 w-24 rounded-full" />
        </div>
      </div>
      {/* Hero skeleton */}
      <div className="max-w-2xl mx-auto px-5 pt-16 pb-10 flex flex-col items-center gap-4">
        <div className="skeleton h-4 w-48 rounded-full" />
        <div className="skeleton h-10 w-full rounded-xl" />
        <div className="skeleton h-10 w-4/5 rounded-xl" />
        <div className="skeleton h-4 w-72 rounded-lg mt-2" />
        <div className="skeleton h-4 w-56 rounded-lg" />
        <div className="flex gap-3 mt-4 w-full justify-center">
          <div className="skeleton h-11 w-40 rounded-xl" />
          <div className="skeleton h-11 w-32 rounded-xl" />
        </div>
      </div>
      {/* Feature card skeletons */}
      <div className="max-w-7xl mx-auto px-5 grid grid-cols-1 md:grid-cols-3 gap-5 pb-10">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="skeleton h-40 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function GuestAuth({ children }: { children: React.ReactNode }) {
  const { setUser } = useAuthStore();
  const [ready, setReady] = useState(getInitialReady);

  useEffect(() => {
    // Always ping to wake Render's free tier
    const base = process.env.NEXT_PUBLIC_API_URL;
    if (base) fetch(`${base.replace(/\/api$/, '')}/api/health`).catch(() => {});

    if (localStorage.getItem('cgpa_token')) return;

    // No session — silently create an anonymous account
    authService.registerAnonymous()
      .then(res => {
        localStorage.setItem('cgpa_token', res.accessToken);
        localStorage.setItem('cgpa_refresh', res.refreshToken);
        setUser(res.user);
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, [setUser]);

  if (!ready) return <LoadingSkeleton />;

  return <>{children}</>;
}
