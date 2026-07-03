'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { authService } from '@/services/auth.service';
import toast from 'react-hot-toast';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { href: '/calculator', label: 'Calculator', icon: 'calculate' },
  { href: '/predict', label: 'Predictor', icon: 'query_stats' },
  { href: '/plan', label: 'Plan', icon: 'calendar_month' },
  { href: '/history', label: 'History', icon: 'history' },
  { href: '/contribute', label: 'Contribute', icon: 'volunteer_activism' },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

function SidebarContent({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try { await authService.logout(); } catch { /* ignore */ }
    logout();
    router.push('/login');
    toast.success('Logged out');
  };

  const name = user?.student?.name ?? 'Student';
  const initial = name[0]?.toUpperCase() ?? 'S';

  return (
    <div className="h-full w-64 bg-surface-container-low border-r border-outline-variant flex flex-col">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3 border-b border-outline-variant">
        <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-lg">
          G
        </div>
        <div>
          <h1 className="text-[20px] font-bold leading-tight text-primary">GradePath</h1>
          <p className="text-[11px] font-semibold text-on-surface-variant">Academic Intelligence</p>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-0.5">
        {NAV.map(({ href, label, icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={onLinkClick}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                active
                  ? 'bg-surface-container text-primary border-r-4 border-primary font-semibold scale-[0.98]'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface hover:scale-[0.98]'
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {icon}
              </span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User + logout */}
      <div className="p-4 border-t border-outline-variant flex flex-col gap-0.5 px-3">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-semibold text-sm shrink-0">
            {initial}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-on-surface truncate">{name}</p>
            <p className="text-xs text-on-surface-variant truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-on-surface-variant hover:bg-surface-container-high hover:text-error transition-colors w-full text-left"
        >
          <span className="material-symbols-outlined">logout</span>
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  return (
    <>
      {/* Desktop: fixed sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 z-50">
        <SidebarContent />
      </aside>

      {/* Mobile: slide-over overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onMobileClose}
            aria-hidden="true"
          />
          <aside className="relative z-10 h-full">
            <SidebarContent onLinkClick={onMobileClose} />
          </aside>
        </div>
      )}
    </>
  );
}
