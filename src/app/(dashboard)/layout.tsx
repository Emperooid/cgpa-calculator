'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { authService } from '@/services/auth.service';
import Sidebar from '@/components/layout/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { setUser, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Runs on every dashboard route change — catches back/forward via Next.js Router Cache.
  // localStorage is the authoritative source; Zustand is just a UI cache on top.
  useEffect(() => {
    if (!mounted) return;
    const token = localStorage.getItem('cgpa_token');
    if (!token) {
      logout();
      router.replace('/login');
      return;
    }
    authService.me().then(setUser).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, pathname]);

  // popstate: fires on every browser history move (back/forward) including
  // Next.js soft navigation that restores from Router Cache without remounting.
  useEffect(() => {
    const guard = () => {
      if (!localStorage.getItem('cgpa_token')) {
        logout();
        router.replace('/login');
      }
    };
    window.addEventListener('popstate', guard);
    return () => window.removeEventListener('popstate', guard);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // pageshow: fires when browser bfcache restores a frozen page (cross-origin
  // navigations, hard reload). Different from popstate.
  useEffect(() => {
    const guard = (e: PageTransitionEvent) => {
      if (e.persisted && !localStorage.getItem('cgpa_token')) {
        logout();
        window.location.href = '/login';
      }
    };
    window.addEventListener('pageshow', guard);
    return () => window.removeEventListener('pageshow', guard);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!mounted) return null;

  // Synchronous token check after hydration — prevents any flash of dashboard
  // content when returning without a valid token.
  if (!localStorage.getItem('cgpa_token')) return null;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar mobileOpen={mobileNavOpen} onMobileClose={() => setMobileNavOpen(false)} />

      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Mobile top header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-surface-container-low border-b border-outline-variant sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-sm">
              G
            </div>
            <span className="text-[17px] font-bold text-primary">GradePath</span>
          </div>
          <button
            onClick={() => setMobileNavOpen(true)}
            className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
            aria-label="Open navigation"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="max-w-5xl mx-auto p-4 md:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
