'use client';
import Link from 'next/link';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';

const HERO_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBSrlrgXRgLXzp7Efmb0aOyKszYPhBHVCw0ERHg2NYXyglb7OcDGUlxhg_JFPCJNwg8Pnjbo11JDE1Ncann4H0viabvpPQsif5mgv36Ejl8Ng3s6uTC5vyVlNXb50CIn0xcVb4pn_tsGmeyojzliD6u5kdogkq4gw0MMxmabtzaHCuRTlN9KukCZ3FO1HuyQZNGZiEvOYFGNUwoBGm5yk0u2rROcJkDsDZbEuAHt_b_4XcGr-hOa8YaEbf7950vG6-T_vbh9ObTci0';
const CALC_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuC1rmyhsaII6V--3oK_hXvBAbV0El6hf6VCKrVbCLg1fxtseIBUo3YhFnFBht0wY-C0xlOpuLHkyan59yC8LkD-m76ICl5K61PkJ1hyt4yY62Wjkggx9_IB7KWfmwl2n4MzPgHpKoyFFmf4lyQvMPF1yT4jpGFveLK7rwf7GzrEdikm-S5PdqpFuzcfflj8nHi__kHC9gqzlDuT4hSh2hMrzSimeysJoqJvnC9IeJxmdisNJ6w5pwrDoXd6sNT8O0hn9DgJPPIqsqc';
const PRED_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAAOmUxo15927pGLrHCLs_HTh2KiXirWQipqc6SFdpRPYY-eFpxr7F5fQU2CXDkcWXWitBFo5uRZ1SlatuZXJR-KWGzZG0PJcoeiwKZq-l1IzrE4-xmHGpmtvB2Wp4FZFYa_4cfBnkDvEu-0rkpThznIgsndoYrj4Ij6dNWTxY5HXTrjStF3p8qS1d3ghDvJZKRVuP3rvT22W1yov-vCuTz5zvbRo3TUIarN65xlcrSRbZjrp3hlTBkZ7ni6uxKK-CFVVpx1OWtWqk';
const PLAN_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCaI-IudRrNNvAjNw2nd9OhVkAIEv9A2th3mkWKZF-bvh0P1pP1M1Fqdpv0cvH28eJARBvtpf5gFQNjJlhNV5crKP34TR9md64eGq927rs2bn7K4RM67m9MNN7eahUBjfWesspM9S1uZh9g1mPCA9aKJzDStBRDcBZIgZDIpq-LUruQaKRNAPFs5v7jU00-DNDcI2uS1RX8R-HySrI6zNovqgQkg9Q5wcuuGU8X6FgQ3OZ0-rof7ljE7sCgliWTMvFTCD22loZ7MzY';

export default function LandingPage() {
  const { isAuthenticated } = useAuthStore();

  // Scroll reveal
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
        <div className="flex justify-between items-center px-6 py-4 max-w-[1280px] mx-auto">
          <span className="text-[24px] font-bold leading-8 text-primary tracking-tight">GradePath</span>

          <div className="hidden md:flex gap-8">
            {['Features', 'How it Works', 'Community', 'Pricing'].map((item, i) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(' ', '-')}`}
                className={`text-[16px] font-semibold transition-colors ${
                  i === 0
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link href="/dashboard" className="bg-primary text-on-primary px-6 py-2.5 rounded-full text-[16px] font-semibold hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/20">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-on-surface-variant hover:text-primary transition-all text-[16px] font-semibold px-4 py-2">
                  Log In
                </Link>
                <Link href="/register" className="bg-primary text-on-primary px-6 py-2.5 rounded-full text-[16px] font-semibold hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/20">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="pt-24">

        {/* ── Hero ── */}
        <section className="hero-gradient relative px-6 py-16 md:py-24 text-center">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[12px] font-medium mb-4 border border-primary/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              Join 10,000+ students across Nigeria
            </div>

            <h1 className="text-[48px] md:text-[64px] leading-[1.1] tracking-tight text-on-surface font-extrabold">
              Master Your Academic Journey with{' '}
              <span className="text-primary italic">Intelligence</span>.
            </h1>

            <p className="text-[16px] text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
              The all-in-one platform for Nigerian students to calculate GPA, predict graduation classes,
              and generate custom study plans with institutional precision.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/register" className="w-full sm:w-auto bg-primary text-on-primary px-8 py-4 rounded-xl text-[16px] font-semibold hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2">
                Get Started for Free
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_forward</span>
              </Link>
              <button className="w-full sm:w-auto bg-surface-container-lowest text-on-surface border border-outline-variant px-8 py-4 rounded-xl text-[16px] font-semibold hover:bg-surface-container transition-all flex items-center justify-center gap-2">
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>play_circle</span>
                Watch Demo
              </button>
            </div>
          </div>

          {/* Hero mockup */}
          <div className="mt-16 max-w-[1280px] mx-auto relative px-6">
            <div className="relative rounded-2xl overflow-hidden border border-slate-100 shadow-2xl bg-white aspect-[16/9] md:aspect-[21/9]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={HERO_IMG}
                alt="GradePath academic dashboard showing GPA tracking, course management, and analytics"
                className="w-full h-full object-cover"
              />
              {/* Floating glass card */}
              <div className="absolute bottom-8 left-8 glass-card p-4 rounded-xl hidden md:block shadow-xl animate-bounce">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary-fixed-dim flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-secondary-fixed" style={{ fontSize: 20 }}>trending_up</span>
                  </div>
                  <div className="text-left">
                    <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wide">Current CGPA</p>
                    <p className="text-[20px] font-bold text-secondary leading-tight">4.85 / 5.0</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Value Propositions ── */}
        <section id="features" className="max-w-[1280px] mx-auto px-6 py-24 reveal">
          <div className="text-center mb-16 space-y-2">
            <h2 className="text-[24px] font-bold text-on-surface">Precision Built for Excellence</h2>
            <p className="text-on-surface-variant text-[14px]">Engineered with the rigor of Nigerian university standards.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="p-8 rounded-xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-on-primary transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: 24, fontVariationSettings: "'FILL' 1" }}>groups</span>
              </div>
              <h3 className="text-[20px] font-semibold mb-3">Crowd-Powered Data</h3>
              <p className="text-on-surface-variant text-[14px] leading-relaxed">
                Access verified course lists and credit loads for over 50+ Nigerian universities,
                updated constantly by our active student community.
              </p>
            </div>
            {/* Card 2 */}
            <div className="p-8 rounded-xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-lg bg-secondary-container text-on-secondary-container flex items-center justify-center mb-6 group-hover:bg-secondary group-hover:text-on-secondary transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: 24, fontVariationSettings: "'FILL' 1" }}>analytics</span>
              </div>
              <h3 className="text-[20px] font-semibold mb-3">Precision Predictions</h3>
              <p className="text-on-surface-variant text-[14px] leading-relaxed">
                Our proprietary algorithms simulate thousands of scenarios to give you the exact path
                to your target class of degree with 100% accuracy.
              </p>
            </div>
            {/* Card 3 */}
            <div className="p-8 rounded-xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-lg bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center mb-6 group-hover:bg-tertiary-container group-hover:text-white transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: 24, fontVariationSettings: "'FILL' 1" }}>calendar_month</span>
              </div>
              <h3 className="text-[20px] font-semibold mb-3">Smart Scheduling</h3>
              <p className="text-on-surface-variant text-[14px] leading-relaxed">
                Automatically generate study plans that adapt to your course difficulty and exam dates,
                optimized for long-term cognitive retention.
              </p>
            </div>
          </div>
        </section>

        {/* ── Feature Showcase ── */}
        <section id="how-it-works" className="py-24 space-y-32">

          {/* GPA Calculator — text left, image right */}
          <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center reveal">
            <div className="space-y-6">
              <span className="text-primary text-[12px] font-medium uppercase tracking-wider">Live Tracking</span>
              <h2 className="text-[36px] font-bold leading-[1.1] tracking-tight text-on-surface">
                Instant GPA Calculation. No more spreadsheets.
              </h2>
              <p className="text-[16px] text-on-surface-variant leading-relaxed">
                Say goodbye to manual math. GradePath's Live GPA Preview calculates your semester score
                as you input individual CA and exam marks. Support for multiple grading systems
                (5.0, 4.0, and 7.0) used across Nigerian institutions.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-on-surface text-[14px]">
                  <span className="material-symbols-outlined text-secondary" style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  Real-time grade breakdown
                </li>
                <li className="flex items-center gap-3 text-on-surface text-[14px]">
                  <span className="material-symbols-outlined text-secondary" style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}>check_circle</span>
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

          {/* CGPA Predictor — image left, text right */}
          <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center reveal">
            <div className="order-2 md:order-1 relative">
              <div className="absolute -inset-4 bg-secondary/5 rounded-[2rem] blur-2xl" />
              <div className="relative bg-white p-2 rounded-2xl border border-slate-100 shadow-xl overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={PRED_IMG} alt="CGPA prediction analytics dashboard" className="w-full rounded-xl" />
              </div>
            </div>
            <div className="order-1 md:order-2 space-y-6">
              <span className="text-secondary text-[12px] font-medium uppercase tracking-wider">Goal Setting</span>
              <h2 className="text-[36px] font-bold leading-[1.1] tracking-tight text-on-surface">
                Predict Your Final Degree Class Today.
              </h2>
              <p className="text-[16px] text-on-surface-variant leading-relaxed">
                Input your desired graduation class, and our "Target Achievement" engine works backwards
                to tell you exactly what GPA you need in each remaining semester. See the impact of
                potential carry-overs or grade changes before they happen.
              </p>
              <div className="flex gap-4">
                <div className="flex-1 p-4 rounded-xl bg-surface-container">
                  <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wide">Target</p>
                  <p className="text-[16px] font-semibold text-primary">First Class</p>
                </div>
                <div className="flex-1 p-4 rounded-xl bg-surface-container">
                  <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wide">Req. Avg</p>
                  <p className="text-[16px] font-semibold text-secondary">4.62 / 5.0</p>
                </div>
              </div>
            </div>
          </div>

          {/* Study Plan — text left, image right */}
          <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center reveal">
            <div className="space-y-6">
              <span className="text-tertiary text-[12px] font-medium uppercase tracking-wider">Cognitive Optimization</span>
              <h2 className="text-[36px] font-bold leading-[1.1] tracking-tight text-on-surface">
                AI-Powered Study Schedules That Actually Work.
              </h2>
              <p className="text-[16px] text-on-surface-variant leading-relaxed">
                Based on course credit loads and your historical performance, GradePath generates a study
                schedule optimized for spacing and interleaving — scientific techniques proven to improve
                exam performance for Nigerian undergraduates.
              </p>
              <Link href="/register" className="inline-block bg-primary-container text-on-primary-container px-6 py-3 rounded-lg text-[16px] font-semibold hover:bg-primary hover:text-on-primary transition-all">
                Generate My Plan
              </Link>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-tertiary/5 rounded-[2rem] blur-2xl" />
              <div className="relative bg-white p-2 rounded-2xl border border-slate-100 shadow-xl overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={PLAN_IMG} alt="AI study schedule calendar interface" className="w-full rounded-xl" />
              </div>
            </div>
          </div>

        </section>

        {/* ── Stats Banner ── */}
        <section className="bg-primary text-on-primary py-16 reveal">
          <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-12 text-center">
            <div className="space-y-2">
              <p className="text-[40px] font-bold tracking-tight">50+</p>
              <p className="text-[12px] font-medium opacity-80 uppercase tracking-widest">Nigerian Universities</p>
            </div>
            <div className="space-y-2">
              <p className="text-[40px] font-bold tracking-tight">10k+</p>
              <p className="text-[12px] font-medium opacity-80 uppercase tracking-widest">Active Students</p>
            </div>
            <div className="space-y-2">
              <p className="text-[40px] font-bold tracking-tight">100k+</p>
              <p className="text-[12px] font-medium opacity-80 uppercase tracking-widest">Courses Logged</p>
            </div>
          </div>
        </section>

        {/* ── How It Works ── */}
        <section className="max-w-[1280px] mx-auto px-6 py-24 reveal">
          <div className="text-center mb-16">
            <h2 className="text-[24px] font-bold text-on-surface">Your Roadmap to Excellence</h2>
          </div>
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-8 left-0 w-full h-0.5 bg-outline-variant/30 -z-10" />
            {[
              { n: '1', title: 'Join Your School', desc: 'Find your university and department to auto-load your official course curriculum.' },
              { n: '2', title: 'Input Your Grades', desc: 'Enter current or expected grades. We handle the complex credit load calculations.' },
              { n: '3', title: 'Optimize Your Path', desc: 'Get your predictions and study plans. Follow the path to your target class.' },
            ].map(step => (
              <div key={step.n} className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-white border-4 border-surface shadow-md flex items-center justify-center text-[24px] font-bold text-primary ring-2 ring-primary/20">
                  {step.n}
                </div>
                <h3 className="text-[20px] font-semibold">{step.title}</h3>
                <p className="text-on-surface-variant text-[14px] px-4">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Bottom CTA ── */}
        <section className="max-w-[1280px] mx-auto px-6 py-24 reveal">
          <div className="bg-surface-container-highest rounded-3xl p-12 text-center space-y-8 relative overflow-hidden">
            {/* Decorative blobs */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/5 rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />
            <h2 className="relative text-[28px] font-bold leading-9 tracking-tight text-on-surface max-w-2xl mx-auto">
              Join thousands of Nigerian students aiming for First Class.
            </h2>
            <p className="relative text-[16px] text-on-surface-variant">
              Create your free account today and start your journey with academic clarity.
            </p>
            <div className="relative flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register" className="bg-primary text-on-primary px-10 py-4 rounded-xl text-[16px] font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all">
                Create Free Account
              </Link>
              <button className="bg-white border border-outline-variant px-10 py-4 rounded-xl text-[16px] font-semibold hover:bg-surface-container-low transition-all">
                Talk to Academic Advisor
              </button>
            </div>
          </div>
        </section>

      </main>

      {/* ── Footer ── */}
      <footer className="w-full py-8 bg-surface-container-lowest border-t border-surface-container-high">
        <div className="flex flex-col md:flex-row justify-between items-center px-6 max-w-[1280px] mx-auto gap-4">
          <div className="flex flex-col items-center md:items-start gap-1">
            <span className="text-[20px] font-bold text-primary">GradePath</span>
            <p className="text-on-surface-variant text-[14px]">© 2024 GradePath. Empowering Academic Excellence in Nigeria.</p>
          </div>
          <div className="flex gap-8">
            {['Privacy Policy', 'Terms of Service', 'Help Center', 'Contact Us'].map(link => (
              <a key={link} href="#" className="text-on-surface-variant hover:text-primary underline transition-all text-[14px]">
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
}
