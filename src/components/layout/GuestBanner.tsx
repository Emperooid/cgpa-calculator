'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';

const BANNER_KEY = 'gradepath_guest_banner_v1';

export default function GuestBanner() {
  const { user } = useAuthStore();
  const [visible, setVisible] = useState(false);
  const isAnonymous = user?.email?.endsWith('@gradepath.local') ?? false;

  useEffect(() => {
    if (!isAnonymous) return;
    if (!localStorage.getItem(BANNER_KEY)) setVisible(true);
  }, [isAnonymous]);

  const dismiss = () => {
    localStorage.setItem(BANNER_KEY, '1');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="bg-primary/10 border-b border-primary/20 px-4 py-2.5 flex items-center gap-3">
      <span
        className="material-symbols-outlined text-primary shrink-0"
        style={{ fontSize: 17, fontVariationSettings: "'FILL' 1" }}
      >
        person
      </span>
      <p className="flex-1 text-xs text-on-surface min-w-0">
        <span className="font-semibold">You&apos;re browsing as a guest.</span>{' '}
        Grades are saved on this device only.{' '}
        <Link
          href="/settings"
          className="text-primary font-semibold underline underline-offset-2"
          onClick={dismiss}
        >
          Go to Settings
        </Link>{' '}
        to protect your data with an email and password.
      </p>
      <button
        onClick={dismiss}
        className="p-1 rounded text-on-surface-variant hover:bg-surface-container transition-colors shrink-0"
        aria-label="Dismiss"
      >
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
      </button>
    </div>
  );
}
