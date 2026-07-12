'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth.store';

const HERO_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBSrlrgXRgLXzp7Efmb0aOyKszYPhBHVCw0ERHg2NYXyglb7OcDGUlxhg_JFPCJNwg8Pnjbo11JDE1Ncann4H0viabvpPQsif5mgv36Ejl8Ng3s6uTC5vyVlNXb50CIn0xcVb4pn_tsGmeyojzliD6u5kdogkq4gw0MMxmabtzaHCuRTlN9KukCZ3FO1HuyQZNGZiEvOYFGNUwoBGm5yk0u2rROcJkDsDZbEuAHt_b_4XcGr-hOa8YaEbf7950vG6-T_vbh9ObTci0';
const CALC_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuC1rmyhsaII6V--3oK_hXvBAbV0El6hf6VCKrVbCLg1fxtseIBUo3YhFnFBht0wY-C0xlOpuLHkyan59yC8LkD-m76ICl5K61PkJ1hyt4yY62Wjkggx9_IB7KWfmwl2n4MzPgHpKoyFFmf4lyQvMPF1yT4jpGFveLK7rwf7GzrEdikm-S5PdqpFuzcfflj8nHi__kHC9gqzlDuT4hSh2hMrzSimeysJoqJvnC9IeJxmdisNJ6w5pwrDoXd6sNT8O0hn9DgJPPIqsqc';
const PRED_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAAOmUxo15927pGLrHCLs_HTh2KiXirWQipqc6SFdpRPYY-eFpxr7F5fQU2CXDkcWXWitBFo5uRZ1SlatuZXJR-KWGzZG0PJcoeiwKZq-l1IzrE4-xmHGpmtvB2Wp4FZFYa_4cfBnkDvEu-0rkpThznIgsndoYrj4Ij6dNWTxY5HXTrjStF3p8qS1d3ghDvJZKRVuP3rvT22W1yov-vCuTz5zvbRo3TUIarN65xlcrSRbZjrp3hlTBkZ7ni6uxKK-CFVVpx1OWtWqk';
const PLAN_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCaI-IudRrNNvAjNw2nd9OhVkAIEv9A2th3mkWKZF-bvh0P1pP1M1Fqdpv0cvH28eJARBvtpf5gFQNjJlhNV5crKP34TR9md64eGq927rs2bn7K4RM67m9MNN7eahUBjfWesspM9S1uZh9g1mPCA9aKJzDStBRDcBZIgZDIpq-LUruQaKRNAPFs5v7jU00-DNDcI2uS1RX8R-HySrI6zNovqgQkg9Q5wcuuGU8X6FgQ3OZ0-rof7ljE7sCgliWTMvFTCD22loZ7MzY';

export default function LandingPage() {
  const { isAuthenticated, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tokenExists, setTokenExists] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('cgpa_token');
    setTokenExists(!!token);
    if (!token && isAuthenticated) logout();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const sections = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.1 }
    );
    sections.forEach(s => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-surface text-on-surface overflow-x-hidden selection:bg-primary-fixed-dim">

      {/* ── Navigation ── */}
      <nav className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md border-b border-surface-container-high shadow-sm">
        <div className="flex justify-between items-center px-5 py-2.5 max-w-[1280px] mx-auto">
          <span className="text-[17px] font-bold leading-tight text-primary tracking-tight">GradePath</span>

          <div className="hidden md:flex gap-6">
            {['Features', 'How it Works', 'Community', 'Pricing'].map((item, i) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(' ', '-')}`}
                className={`text-[13px] font-medium transition-colors ${
                  i === 0
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-3">
              {tokenExists ? (
                <Link href="/dashboard" className="bg-primary text-on-primary px-4 py-1.5 rounded-full text-[13px] font-semibold hover:opacity-90 active:scale-95 transition-all shadow-md shadow-primary/20">
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/login" className="text-on-surface-variant hover:text-primary transition-all text-[13px] font-medium px-3 py-1.5">
                    Log In
                  </Link>
                  <Link href="/register" className="bg-primary text-on-primary px-4 py-1.5 rounded-full text-[13px] font-semibold hover:opacity-90 active:scale-95 transition-all shadow-md shadow-primary/20">
                    Get Started
                  </Link>
                </>
              )}
            </div>

            <div className="flex md:hidden items-center gap-2">
              {tokenExists ? (
                <Link href="/dashboard" className="bg-primary text-on-primary px-3 py-1.5 rounded-full text-xs font-semibold">
                  Dashboard
                </Link>
              ) : (
                <Link href="/register" className="bg-primary text-on-primary px-3 py-1.5 rounded-full text-xs font-semibold">
                  Get Started
                </Link>
              )}
              <button
                onClick={() => setMobileMenuOpen(v => !v)}
                className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
                aria-label="Toggle menu"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{mobileMenuOpen ? 'close' : 'menu'}</span>
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-surface/95 backdrop-blur-md border-t border-surface-container-high px-5 py-3 flex flex-col gap-0.5">
            {['Features', 'How it Works', 'Community', 'Pricing'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(' ', '-')}`}
                onClick={() => setMobileMenuOpen(false)}
                className="text-[13px] font-medium text-on-surface-variant hover:text-primary py-2.5 border-b border-surface-container-high last:border-0 transition-colors"
              >
                {item}
              </a>
            ))}
            {!tokenExists && (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-2 text-center text-[13px] font-medium text-on-surface-variant border border-outline-variant rounded-xl py-2.5 hover:bg-surface-container transition-colors"
              >
                Log In
              </Link>
            )}
          </div>
        )}
      </nav>

      <main className="pt-16">

        {/* ── Hero ── */}
        <section className="hero-gradient relative px-5 py-12 md:py-20 text-center">
          <div className="max-w-3xl mx-auto space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-[11px] font-medium mb-3 border border-primary/20">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
              </span>
              Join 10,000+ students across Nigeria
            </div>

            <h1 className="text-[26px] sm:text-[36px] md:text-[48px] leading-[1.1] tracking-tight text-on-surface font-extrabold">
              Master Your Academic Journey with{' '}
              <span className="text-primary italic">Intelligence</span>.
            </h1>

            <p className="text-sm text-on-surface-variant max-w-xl mx-auto leading-relaxed">
              The all-in-one platform for Nigerian students to calculate GPA, predict graduation classes,
              and generate custom study plans with institutional precision.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link href="/register" className="w-full sm:w-auto bg-primary text-on-primary px-6 py-3 rounded-xl text-sm font-semibold hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2">
                Get Started for Free
                <span className="material-symbols-outlined" style={{ fontSize: 17 }}>arrow_forward</span>
              </Link>
              <button className="w-full sm:w-auto bg-surface-container-lowest text-on-surface border border-outline-variant px-6 py-3 rounded-xl text-sm font-semibold hover:bg-surface-container transition-all flex items-center justify-center gap-2">
                <span className="material-symbols-outlined" style={{ fontSize: 17 }}>play_circle</span>
                Watch Demo
              </button>
            </div>
          </div>

          {/* Hero mockup */}
          <div className="mt-12 max-w-[1280px] mx-auto relative px-5">
            <div className="relative rounded-2xl overflow-hidden border border-slate-100 shadow-2xl bg-white aspect-[16/9] md:aspect-[21/9]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={HERO_IMG}
                alt="GradePath academic dashboard showing GPA tracking, course management, and analytics"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-6 left-6 glass-card p-3.5 rounded-xl hidden md:block shadow-xl animate-bounce">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-secondary-fixed-dim flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-secondary-fixed" style={{ fontSize: 16 }}>trending_up</span>
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wide">Current CGPA</p>
                    <p className="text-[17px] font-bold text-secondary leading-tight">4.85 / 5.0</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Value Propositions ── */}
        <section id="features" className="max-w-[1280px] mx-auto px-5 py-16 reveal">
          <div className="text-center mb-10 space-y-1.5">
            <h2 className="text-[20px] font-bold text-on-surface">Precision Built for Excellence</h2>
            <p className="text-on-surface-variant text-xs">Engineered with the rigor of Nigerian university standards.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-6 rounded-xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all group">
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-on-primary transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}>groups</span>
              </div>
              <h3 className="text-[15px] font-semibold mb-2">Crowd-Powered Data</h3>
              <p className="text-on-surface-variant text-xs leading-relaxed">
                Access verified course lists and credit loads for over 50+ Nigerian universities,
                updated constantly by our active student community.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all group">
              <div className="w-10 h-10 rounded-lg bg-secondary-container text-on-secondary-container flex items-center justify-center mb-5 group-hover:bg-secondary group-hover:text-on-secondary transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}>analytics</span>
              </div>
              <h3 className="text-[15px] font-semibold mb-2">Precision Predictions</h3>
              <p className="text-on-surface-variant text-xs leading-relaxed">
                Our proprietary algorithms simulate thousands of scenarios to give you the exact path
                to your target class of degree with 100% accuracy.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all group">
              <div className="w-10 h-10 rounded-lg bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center mb-5 group-hover:bg-tertiary-container group-hover:text-white transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}>calendar_month</span>
              </div>
              <h3 className="text-[15px] font-semibold mb-2">Smart Scheduling</h3>
              <p className="text-on-surface-variant text-xs leading-relaxed">
                Automatically generate study plans that adapt to your course difficulty and exam dates,
                optimized for long-term cognitive retention.
              </p>
            </div>
          </div>
        </section>

        {/* ── Feature Showcase ── */}
        <section id="how-it-works" className="py-16 space-y-24">

          {/* GPA Calculator */}
          <div className="max-w-[1280px] mx-auto px-5 grid grid-cols-1 md:grid-cols-2 gap-12 items-center reveal">
            <div className="space-y-4">
              <span className="text-primary text-[11px] font-medium uppercase tracking-wider">Live Tracking</span>
              <h2 className="text-[20px] sm:text-[26px] md:text-[30px] font-bold leading-[1.15] tracking-tight text-on-surface">
                Instant GPA Calculation. No more spreadsheets.
              </h2>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Say goodbye to manual math. GradePath&apos;s Live GPA Preview calculates your semester score
                as you input individual CA and exam marks. Support for multiple grading systems
                (5.0, 4.0, and 7.0) used across Nigerian institutions.
              </p>
              <ul className="space-y-2.5">
                <li className="flex items-center gap-2.5 text-on-surface text-xs">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: 17, fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  Real-time grade breakdown
                </li>
                <li className="flex items-center gap-2.5 text-on-surface text-xs">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: 17, fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  Automated credit load verification
                </li>
              </ul>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-primary/5 rounded-[2rem] blur-2xl" />
              <div className="relative bg-white p-2 rounded-2xl border border-slate-100 shadow-xl overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={CALC_IMG} alt="Live GPA calculator interface" className="w-full rounded-xl" />
              </div>
            </div>
          </div>

          {/* CGPA Predictor */}
          <div className="max-w-[1280px] mx-auto px-5 grid grid-cols-1 md:grid-cols-2 gap-12 items-center reveal">
            <div className="order-2 md:order-1 relative">
              <div className="absolute -inset-4 bg-primary/5 rounded-[2rem] blur-2xl" />
              <div className="relative bg-white p-2 rounded-2xl border border-slate-100 shadow-xl overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={PRED_IMG} alt="CGPA prediction analytics dashboard" className="w-full rounded-xl" />
              </div>
            </div>
            <div className="order-1 md:order-2 space-y-4">
              <span className="text-primary text-[11px] font-medium uppercase tracking-wider">Goal Setting</span>
              <h2 className="text-[20px] sm:text-[26px] md:text-[30px] font-bold leading-[1.15] tracking-tight text-on-surface">
                Predict Your Final Degree Class Today.
              </h2>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Input your desired graduation class, and our &ldquo;Target Achievement&rdquo; engine works backwards
                to tell you exactly what GPA you need in each remaining semester.
              </p>
              <div className="flex gap-3">
                <div className="flex-1 p-3.5 rounded-xl bg-surface-container">
                  <p className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wide">Target</p>
                  <p className="text-[14px] font-semibold text-primary">First Class</p>
                </div>
                <div className="flex-1 p-3.5 rounded-xl bg-surface-container">
                  <p className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wide">Req. Avg</p>
                  <p className="text-[14px] font-semibold text-secondary">4.62 / 5.0</p>
                </div>
              </div>
            </div>
          </div>

          {/* Study Plan */}
          <div className="max-w-[1280px] mx-auto px-5 grid grid-cols-1 md:grid-cols-2 gap-12 items-center reveal">
            <div className="space-y-4">
              <span className="text-primary text-[11px] font-medium uppercase tracking-wider">Cognitive Optimization</span>
              <h2 className="text-[20px] sm:text-[26px] md:text-[30px] font-bold leading-[1.15] tracking-tight text-on-surface">
                AI-Powered Study Schedules That Actually Work.
              </h2>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Based on course credit loads and your historical performance, GradePath generates a study
                schedule optimized for spacing and interleaving — scientific techniques proven to improve
                exam performance for Nigerian undergraduates.
              </p>
              <Link href="/register" className="inline-block bg-primary-container text-on-primary-container px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary hover:text-on-primary transition-all">
                Generate My Plan
              </Link>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-primary/5 rounded-[2rem] blur-2xl" />
              <div className="relative bg-white p-2 rounded-2xl border border-slate-100 shadow-xl overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={PLAN_IMG} alt="AI study schedule calendar interface" className="w-full rounded-xl" />
              </div>
            </div>
          </div>

        </section>

        {/* ── Stats Banner ── */}
        <section className="bg-primary text-on-primary py-12 reveal">
          <div className="max-w-[1280px] mx-auto px-5 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <div className="space-y-1.5">
              <p className="text-[30px] font-bold tracking-tight">50+</p>
              <p className="text-[11px] font-medium opacity-80 uppercase tracking-widest">Nigerian Universities</p>
            </div>
            <div className="space-y-1.5">
              <p className="text-[30px] font-bold tracking-tight">10k+</p>
              <p className="text-[11px] font-medium opacity-80 uppercase tracking-widest">Active Students</p>
            </div>
            <div className="space-y-1.5">
              <p className="text-[30px] font-bold tracking-tight">100k+</p>
              <p className="text-[11px] font-medium opacity-80 uppercase tracking-widest">Courses Logged</p>
            </div>
          </div>
        </section>

        {/* ── How It Works ── */}
        <section className="max-w-[1280px] mx-auto px-5 py-16 reveal">
          <div className="text-center mb-12">
            <h2 className="text-[20px] font-bold text-on-surface">Your Roadmap to Excellence</h2>
          </div>
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="hidden md:block absolute top-7 left-0 w-full h-0.5 bg-outline-variant/30 -z-10" />
            {[
              { n: '1', title: 'Join Your School', desc: 'Find your university and department to auto-load your official course curriculum.' },
              { n: '2', title: 'Input Your Grades', desc: 'Enter current or expected grades. We handle the complex credit load calculations.' },
              { n: '3', title: 'Optimize Your Path', desc: 'Get your predictions and study plans. Follow the path to your target class.' },
            ].map(step => (
              <div key={step.n} className="flex flex-col items-center text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-white border-4 border-surface shadow-md flex items-center justify-center text-[20px] font-bold text-primary ring-2 ring-primary/20">
                  {step.n}
                </div>
                <h3 className="text-[15px] font-semibold">{step.title}</h3>
                <p className="text-on-surface-variant text-xs px-4 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Bottom CTA ── */}
        <section className="max-w-[1280px] mx-auto px-5 py-16 reveal">
          <div className="bg-surface-container-highest rounded-3xl p-6 sm:p-10 text-center space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-56 h-56 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-primary/5 rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />
            <h2 className="relative text-[20px] font-bold leading-tight tracking-tight text-on-surface max-w-xl mx-auto">
              Join thousands of Nigerian students aiming for First Class.
            </h2>
            <p className="relative text-sm text-on-surface-variant">
              Create your free account today and start your journey with academic clarity.
            </p>
            <div className="relative flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/register" className="w-full sm:w-auto bg-primary text-on-primary px-8 py-3 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all text-center">
                Create Free Account
              </Link>
              <button className="w-full sm:w-auto bg-white border border-outline-variant px-8 py-3 rounded-xl text-sm font-semibold hover:bg-surface-container-low transition-all">
                Talk to Academic Advisor
              </button>
            </div>
          </div>
        </section>

      </main>

      {/* ── Footer ── */}
      <footer className="w-full py-6 bg-surface-container-lowest border-t border-surface-container-high">
        <div className="flex flex-col md:flex-row justify-between items-center px-5 max-w-[1280px] mx-auto gap-3">
          <div className="flex flex-col items-center md:items-start gap-0.5">
            <span className="text-[15px] font-bold text-primary">GradePath</span>
            <p className="text-on-surface-variant text-xs">© 2024 GradePath. Empowering Academic Excellence in Nigeria.</p>
          </div>
          <div className="flex flex-wrap gap-5 justify-center">
            {['Privacy Policy', 'Terms of Service', 'Help Center', 'Contact Us'].map(link => (
              <a key={link} href="#" className="text-on-surface-variant hover:text-primary underline transition-all text-xs">
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
