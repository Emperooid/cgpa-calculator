'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type Form = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore(s => s.setUser);
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: Form) => {
    setLoading(true);
    try {
      const res = await authService.login(data);
      localStorage.setItem('cgpa_token', res.accessToken);
      localStorage.setItem('cgpa_refresh', res.refreshToken);
      setUser(res.user);
      toast.success('Welcome back!');
      router.push('/dashboard');
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mb-8">
        <h2 className="text-[28px] font-bold tracking-tight text-on-background mb-1">Welcome back</h2>
        <p className="text-sm text-on-surface-variant">Sign in to your GradePath account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email */}
        <div>
          <label className="block text-[11px] font-semibold text-on-surface-variant mb-2 uppercase tracking-wide">
            Email
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline pointer-events-none" style={{ fontSize: 18 }}>mail</span>
            <input
              {...register('email')}
              type="email"
              autoComplete="email"
              placeholder="you@university.edu.ng"
              className="w-full pl-10 pr-4 py-2.5 bg-surface border border-outline-variant rounded-lg text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow"
            />
          </div>
          {errors.email && (
            <p className="text-error text-xs mt-1.5 flex items-center gap-1">
              <span className="material-symbols-outlined" style={{ fontSize: 13 }}>error</span>
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-[11px] font-semibold text-on-surface-variant mb-2 uppercase tracking-wide">
            Password
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline pointer-events-none" style={{ fontSize: 18 }}>lock</span>
            <input
              {...register('password')}
              type={showPw ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full pl-10 pr-10 py-2.5 bg-surface border border-outline-variant rounded-lg text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow"
            />
            <button
              type="button"
              onClick={() => setShowPw(v => !v)}
              className="absolute right-3 top-2.5 text-outline hover:text-on-surface-variant transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                {showPw ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
          {errors.password && (
            <p className="text-error text-xs mt-1.5 flex items-center gap-1">
              <span className="material-symbols-outlined" style={{ fontSize: 13 }}>error</span>
              {errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-on-primary font-semibold py-3 rounded-lg shadow-sm hover:bg-surface-tint focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>

      <p className="text-center text-sm text-on-surface-variant mt-8">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-primary font-semibold hover:underline">
          Create one free
        </Link>
      </p>
    </>
  );
}
