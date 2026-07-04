'use client';
import { useEffect } from 'react';

// Fires a cheap public request on app load to wake Render's free-tier
// instance before the user hits any authenticated endpoint.
// Render sleeps after 15 min of inactivity; first request takes ~50s.
// Pinging early shaves that delay off every interactive API call.
export default function BackendWakeup() {
  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL;
    if (!base) return;
    // Hit the health endpoint (no auth, no DB) — purely to wake Render.
    fetch(`${base.replace(/\/api$/, '')}/api/health`).catch(() => {});
  }, []);
  return null;
}
