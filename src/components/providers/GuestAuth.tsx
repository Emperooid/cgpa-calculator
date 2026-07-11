'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { authService } from '@/services/auth.service';

// Returning users (with token) get ready=true immediately — no spinner.
// New users get an anonymous account created before children render.
function getInitialReady() {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('cgpa_token');
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

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span
          className="material-symbols-outlined animate-spin text-primary"
          style={{ fontSize: 32 }}
        >
          progress_activity
        </span>
      </div>
    );
  }

  return <>{children}</>;
}
