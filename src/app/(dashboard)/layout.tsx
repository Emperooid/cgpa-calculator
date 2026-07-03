'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { authService } from '@/services/auth.service';
import Sidebar from '@/components/layout/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, setUser } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated) { router.replace('/login'); return; }
    authService.me().then(setUser).catch(() => {});
  }, [mounted, isAuthenticated, router, setUser]);

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto md:ml-64">
        <div className="max-w-5xl mx-auto p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
