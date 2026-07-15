'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  { href: '/settings', label: 'Settings', icon: 'settings' },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try { await authService.logout(); } catch { /* ignore */ }
    logout();
    toast.success('Logged out');
    window.location.href = '/login';
  };

  const isAnon = user?.email?.endsWith('@gradepath.local') ?? false;
  const name = isAnon ? 'Guest' : (user?.student?.name ?? 'Student');
  const initial = name[0]?.toUpperCase() ?? 'S';

  return (
    <>
      {/* Backdrop — only on small screens when sidebar is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar — always in the DOM, slides in/out via transform */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 z-50 transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="h-full w-64 bg-surface-container-low border-r border-outline-variant flex flex-col">
          {/* Logo */}
          <div className="px-4 py-3.5 flex items-center gap-2.5 border-b border-outline-variant">
            <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-sm shrink-0">
              G
            </div>
            <div>
              <h1 className="text-[15px] font-bold leading-tight text-primary">GradePath</h1>
              <p className="text-[10px] font-semibold text-on-surface-variant">Academic Intelligence</p>
            </div>
          </div>

          {/* Nav links */}
          <nav className="flex-1 overflow-y-auto py-3 px-2.5 flex flex-col gap-0.5">
            {NAV.map(({ href, label, icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                    active
                      ? 'bg-surface-container text-primary border-r-4 border-primary font-semibold'
                      : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                  }`}
                >
                  <span
                    className="material-symbols-outlined"
                    style={active
                      ? { fontVariationSettings: "'FILL' 1", fontSize: 18 }
                      : { fontSize: 18 }}
                  >
                    {icon}
                  </span>
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* User + logout */}
          <div className="p-2.5 border-t border-outline-variant flex flex-col gap-0.5">
            <div className="flex items-center gap-2.5 px-3 py-2 mb-0.5">
              <div className="w-7 h-7 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-semibold text-xs shrink-0">
                {isAnon ? (
                  <span className="material-symbols-outlined" style={{ fontSize: 14, fontVariationSettings: "'FILL' 1" }}>person</span>
                ) : initial}
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-on-surface truncate">{name}</p>
                <p className="text-[11px] text-on-surface-variant truncate">
                  {isAnon ? 'Guest Account' : user?.email}
                </p>
              </div>
            </div>
            {isAnon ? (
              <Link
                href="/settings"
                onClick={onClose}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-primary hover:bg-primary/10 transition-colors w-full"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>verified_user</span>
                Claim Account
              </Link>
            ) : (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-on-surface-variant hover:bg-surface-container-high hover:text-error transition-colors w-full text-left"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>logout</span>
                Sign Out
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
