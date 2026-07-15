'use client';
import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { gpaService } from '@/services/gpa.service';
import { Prediction, Pathway, GRADE_CLASSES, Analytics } from '@/types';

const inputCls = 'w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-lg text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow';
const labelCls = 'block text-[11px] font-semibold text-on-surface-variant mb-2 uppercase tracking-wide';

const PATHWAY_STYLE = {
  Conservative: { bg: 'bg-primary-container/40 border-on-primary-container/20', text: 'text-on-primary-container', badge: 'bg-primary text-on-primary', icon: 'workspace_premium' },
  Balanced:     { bg: 'bg-secondary-container/40 border-on-secondary-container/20', text: 'text-on-secondary-container', badge: 'bg-secondary text-on-secondary', icon: 'balance' },
  Flexible:     { bg: 'bg-tertiary-container/40 border-on-tertiary-container/20', text: 'text-on-tertiary-container', badge: 'bg-tertiary text-on-tertiary', icon: 'adjust' },
} as const;

function PathwayCard({ pathway, targetCgpa }: { pathway: Pathway; targetCgpa: number }) {
  const style = PATHWAY_STYLE[pathway.name as keyof typeof PATHWAY_STYLE] ?? PATHWAY_STYLE.Flexible;
  return (
    <div className={`rounded-xl border p-4 ${style.bg}`}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className={`material-symbols-outlined ${style.text}`} style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}>{style.icon}</span>
          <span className={`text-[13px] font-bold ${style.text}`}>Pathway {pathway.name === 'Conservative' ? 'A' : pathway.name === 'Balanced' ? 'B' : 'C'} — {pathway.name}</span>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${pathway.achievesTarget ? style.badge : 'bg-error text-on-error'}`}>
          {pathway.achievesTarget ? '✓ Achieves target' : '✗ Falls short'}
        </span>
      </div>

      <p className={`text-xs mb-3 opacity-80 ${style.text}`}>{pathway.hint}</p>

      <div className="flex gap-3 mb-3">
        <div className="flex-1 bg-surface-container-lowest rounded-lg p-2.5 text-center">
          <p className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wide mb-0.5">Avg GPA Needed</p>
          <p className="text-xl font-bold text-on-surface">{pathway.avgSemesterGPA.toFixed(2)}</p>
        </div>
        <div className="flex-1 bg-surface-container-lowest rounded-lg p-2.5 text-center">
          <p className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wide mb-0.5">Projected CGPA</p>
          <p className={`text-xl font-bold ${pathway.achievesTarget ? 'text-primary' : 'text-error'}`}>{pathway.projectedCgpa.toFixed(2)}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {pathway.gradeUnits.map(g => (
          <span key={g.grade} className="text-[11px] font-semibold bg-surface-container-lowest text-on-surface px-2 py-0.5 rounded-full">
            {g.pct}% {g.grade} <span className="text-outline">({g.units}u)</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function PredictPage() {
  const [form, setForm] = useState({ currentCgpa: '', totalUnitsDone: '', targetCgpa: '', remainingUnits: '' });
  const [result, setResult] = useState<Prediction | null>(null);

  const { data: analytics, isLoading: analyticsLoading } = useQuery<Analytics>({
    queryKey: ['analytics'],
    queryFn: gpaService.getAnalytics,
    retry: false,
  });

  useEffect(() => {
    if (!analytics || analytics.totalUnitsCompleted === 0) return;
    setForm(prev => ({
      ...prev,
      currentCgpa: prev.currentCgpa || analytics.cgpa.toFixed(2),
      totalUnitsDone: prev.totalUnitsDone || String(analytics.totalUnitsCompleted),
    }));
  }, [analytics]);

  const mutation = useMutation({
    mutationFn: () => gpaService.quickPredict({
      currentCgpa: +form.currentCgpa, totalUnitsDone: +form.totalUnitsDone,
      targetCgpa: +form.targetCgpa, remainingUnits: +form.remainingUnits,
      scale: 'FIVE_POINT',
    }),
    onSuccess: (data) => setResult(data),
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Prediction failed'),
  });

  const update = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));
  const canSubmit = form.currentCgpa && form.totalUnitsDone && form.targetCgpa && form.remainingUnits && !mutation.isPending;

  if (analyticsLoading) {
    return (
      <div className="space-y-6 max-w-2xl">
        <div className="space-y-1.5">
          <div className="skeleton h-7 w-40 rounded-lg" />
          <div className="skeleton h-4 w-72 rounded-lg" />
        </div>
        <div className="skeleton h-80 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-on-background">CGPA Predictor</h1>
        <p className="text-xs text-on-surface-variant mt-1">Find out exactly what GPA you need — and which grade strategy gets you there.</p>
      </div>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6">
        <h2 className="text-[16px] font-semibold text-on-surface mb-5 flex items-center gap-2">
          <span className="material-symbols-outlined text-outline">tune</span>
          Your Academic Details
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { key: 'currentCgpa', label: 'Current CGPA', placeholder: '3.65', hint: '0 – 5.0' },
            { key: 'totalUnitsDone', label: 'Units Completed', placeholder: '72', hint: 'All semesters combined' },
            { key: 'targetCgpa', label: 'Target CGPA', placeholder: '4.50', hint: 'First Class = 4.5+' },
            { key: 'remainingUnits', label: 'Remaining Units', placeholder: '48', hint: 'Units left to finish degree' },
          ].map(({ key, label, placeholder, hint }) => (
            <div key={key}>
              <label className={labelCls}>{label}</label>
              <input
                type="number" step="0.01"
                value={form[key as keyof typeof form]}
                onChange={e => update(key, e.target.value)}
                placeholder={placeholder}
                className={inputCls}
              />
              <p className="text-xs text-on-surface-variant mt-1">{hint}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 p-4 bg-surface-container rounded-lg">
          <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wide mb-3">Quick Target Presets</p>
          <div className="flex flex-wrap gap-2">
            {GRADE_CLASSES.map(gc => (
              <button
                key={gc.label}
                onClick={() => update('targetCgpa', gc.min.toString())}
                className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                  form.targetCgpa === gc.min.toString()
                    ? 'bg-primary text-on-primary border-primary'
                    : 'border-outline-variant text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {gc.label} ({gc.min}+)
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => mutation.mutate()}
          disabled={!canSubmit}
          className="mt-5 w-full bg-primary text-on-primary font-semibold py-3 rounded-lg shadow-sm hover:bg-surface-tint transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}>target</span>
          {mutation.isPending ? 'Calculating…' : 'Calculate What I Need'}
        </button>
      </div>

      {result && (
        <>
          {/* Summary */}
          <div className={`rounded-xl border p-6 ${result.isPossible
            ? 'bg-secondary-container/30 border-on-secondary-container/20'
            : 'bg-error-container/30 border-on-error-container/20'}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined" style={{ fontSize: 22, fontVariationSettings: "'FILL' 1" }}>
                {result.isPossible ? 'check_circle' : 'warning'}
              </span>
              <h3 className={`text-[15px] font-bold ${result.isPossible ? 'text-on-secondary-container' : 'text-on-error-container'}`}>
                {result.isPossible ? 'Target is Achievable!' : 'Target Not Achievable'}
              </h3>
            </div>
            <p className={`text-sm mb-5 ${result.isPossible ? 'text-on-secondary-container' : 'text-on-error-container'} opacity-80`}>
              {result.message}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface-container-lowest rounded-xl p-4">
                <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wide mb-1">Current CGPA</p>
                <p className="text-2xl font-bold text-on-surface">{result.currentCgpa.toFixed(2)}</p>
                <p className="text-xs text-on-surface-variant mt-1">{result.currentClass}</p>
              </div>
              <div className="bg-surface-container-lowest rounded-xl p-4">
                <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wide mb-1">Target CGPA</p>
                <p className="text-2xl font-bold text-on-surface">{result.targetCgpa.toFixed(2)}</p>
                <p className="text-xs text-on-surface-variant mt-1">{result.targetClass}</p>
              </div>
              {result.isPossible && result.requiredGPA !== null && (
                <div className="relative overflow-hidden bg-primary text-on-primary rounded-xl p-4 col-span-2">
                  <div className="absolute inset-0 bg-linear-to-r from-primary to-surface-tint opacity-80 pointer-events-none" />
                  <div className="relative z-10">
                    <p className="text-[11px] font-semibold text-primary-fixed opacity-80 uppercase tracking-wide mb-1">Required GPA Per Remaining Semester</p>
                    <p className="text-3xl font-bold leading-none">{result.requiredGPA.toFixed(2)}</p>
                    <p className="text-primary-fixed text-xs mt-1 opacity-70">over the remaining {result.remainingUnits} units</p>
                  </div>
                </div>
              )}
              <div className="bg-surface-container-lowest rounded-xl p-4">
                <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wide mb-1">Max Achievable</p>
                <p className="text-2xl font-bold text-on-surface">{result.maxAchievableCgpa.toFixed(2)}</p>
                <p className="text-xs text-on-surface-variant mt-1">if you score all A's</p>
              </div>
              <div className="bg-surface-container-lowest rounded-xl p-4">
                <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wide mb-1">Remaining Units</p>
                <p className="text-2xl font-bold text-on-surface">{result.remainingUnits}</p>
                <p className="text-xs text-on-surface-variant mt-1">credit units left</p>
              </div>
            </div>
          </div>

          {/* Grade Pathways */}
          {result.pathways?.length > 0 && (
            <div>
              <h2 className="text-[15px] font-bold text-on-surface mb-1 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: 18 }}>fork_right</span>
                Grade Pathways
              </h2>
              <p className="text-xs text-on-surface-variant mb-4">Three realistic strategies to reach your target. Pick the one that fits your discipline.</p>
              <div className="space-y-3">
                {result.pathways.map(p => (
                  <PathwayCard key={p.name} pathway={p} targetCgpa={result.targetCgpa} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
