import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    // Fallbacks so Vercel builds work even if env vars aren't set in the dashboard
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL ||
      'https://cgpa-calculator-backend-6ht2.onrender.com/api',
    NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID || 'G-ELFGRPMRWR',
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
};

export default nextConfig;
