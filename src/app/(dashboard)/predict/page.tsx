'use client';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { gpaService } from '@/services/gpa.service';
import { Prediction, GRADE_CLASSES } from '@/types';

const inputCls = 'w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-lg text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow';
const labelCls = 'block text-[11px] font-semibold text-on-surface-variant mb-2 uppercase tracking-wide';

export default function PredictPage() {
  const [form, setForm] = useState({ currentCgpa: '', totalUnitsDone: '', targetCgpa: '', remainingUnits: '' });
  const [result, setResult] = useState<Prediction | null>(null);

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

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-[28px] font-bold tracking-tight text-on-background">CGPA Predictor</h1>
        <p className="text-sm text-on-surface-variant mt-1">Find out exactly what GPA you need each semester to hit your target.</p>
      </div>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6">
        <h2 className="text-[16px] font-semibold text-on-surface mb-5 flex items-center gap-2">
          <span className="material-symbols-outlined text-outline">tune</span>
          Your Academic Details
        </h2>
        <div className="grid grid-cols-2 gap-4">
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

        {/* Quick presets */}
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
        <div className={`rounded-xl border p-6 ${result.isPossible
          ? 'bg-secondary-container/30 border-on-secondary-container/20'
          : 'bg-error-container/30 border-on-error-container/20'}`}>
          <div className="flex items-center gap-2 mb-3">
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 22, fontVariationSettings: "'FILL' 1" }}
            >
              {result.isPossible ? 'check_circle' : 'warning'}
            </span>
            <h3 className={`text-[18px] font-bold ${result.isPossible ? 'text-on-secondary-container' : 'text-on-error-container'}`}>
              {result.isPossible ? 'Target is Achievable!' : 'Target Not Achievable'}
            </h3>
          </div>

          <p className={`text-sm mb-5 ${result.isPossible ? 'text-on-secondary-container' : 'text-on-error-container'} opacity-80`}>
            {result.message}
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface-container-lowest rounded-xl p-4">
              <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wide mb-1">Current CGPA</p>
              <p className="text-[28px] font-bold text-on-surface">{result.currentCgpa.toFixed(2)}</p>
              <p className="text-xs text-on-surface-variant mt-1">{result.currentClass}</p>
            </div>
            <div className="bg-surface-container-lowest rounded-xl p-4">
              <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wide mb-1">Target CGPA</p>
              <p className="text-[28px] font-bold text-on-surface">{result.targetCgpa.toFixed(2)}</p>
              <p className="text-xs text-on-surface-variant mt-1">{result.targetClass}</p>
            </div>
            {result.isPossible && result.requiredGPA !== null && (
              <div className="relative overflow-hidden bg-primary text-on-primary rounded-xl p-4 col-span-2">
                <div className="absolute inset-0 bg-linear-to-r from-primary to-surface-tint opacity-80 pointer-events-none" />
                <div className="relative z-10">
                  <p className="text-[11px] font-semibold text-primary-fixed opacity-80 uppercase tracking-wide mb-1">Required GPA Per Remaining Semester</p>
                  <p className="text-[36px] font-bold leading-none">{result.requiredGPA.toFixed(2)}</p>
                  <p className="text-primary-fixed text-xs mt-1 opacity-70">over the remaining {result.remainingUnits} units</p>
                </div>
              </div>
            )}
            <div className="bg-surface-container-lowest rounded-xl p-4">
              <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wide mb-1">Max Achievable</p>
              <p className="text-[28px] font-bold text-on-surface">{result.maxAchievableCgpa.toFixed(2)}</p>
              <p className="text-xs text-on-surface-variant mt-1">if you score all A's</p>
            </div>
            <div className="bg-surface-container-lowest rounded-xl p-4">
              <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wide mb-1">Remaining Units</p>
              <p className="text-[28px] font-bold text-on-surface">{result.remainingUnits}</p>
              <p className="text-xs text-on-surface-variant mt-1">credit units left</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
