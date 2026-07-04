import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    // Fallback so Vercel builds work even if the env var isn't set in the dashboard
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL ||
      'https://cgpa-calculator-backend-6ht2.onrender.com/api',
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
};

export default nextConfig;
