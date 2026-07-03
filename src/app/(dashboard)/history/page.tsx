'use client';
import { useQuery } from '@tanstack/react-query';
import { studentsService } from '@/services/students.service';
import { SemesterRecord } from '@/types';
import { useState } from 'react';

const GRADE_COLOR: Record<string, string> = {
  A: 'bg-secondary-container text-on-secondary-container',
  B: 'bg-primary-container text-on-primary-container',
  C: 'bg-tertiary-container text-on-tertiary-container',
  D: 'bg-error-container text-error',
  E: 'bg-error-container text-error',
  F: 'bg-error text-on-error',
};

export default function HistoryPage() {
  const { data: history, isLoading } = useQuery<SemesterRecord[]>({
    queryKey: ['history'],
    queryFn: studentsService.getHistory,
  });

  const [open, setOpen] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 bg-surface-container-lowest rounded-xl border border-outline-variant animate-pulse" />
        ))}
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="text-center py-20">
        <span className="material-symbols-outlined text-outline" style={{ fontSize: 48 }}>history</span>
        <p className="text-on-surface-variant text-lg mt-3">No grade history yet.</p>
        <p className="text-outline text-sm mt-1">Submit your first semester grades in the Calculator.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-on-surface">Grade History</h1>
      <p className="text-on-surface-variant">All your recorded semesters.</p>

      {history.map((sem) => {
        const key = sem.id;
        const isOpen = open === key;
        return (
          <div key={key} className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
            <button
              onClick={() => setOpen(isOpen ? null : key)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-surface-container transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary-container flex items-center justify-center">
                  <span className="text-on-primary-container font-bold text-sm">{sem.level}L</span>
                </div>
                <div className="text-left">
                  <p className="font-semibold text-on-surface">{sem.level} Level — Semester {sem.semester}</p>
                  <p className="text-sm text-outline">{sem.year} · {sem.totalUnits} units</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-outline">GPA</p>
                  <p className="text-xl font-bold text-primary">{sem.gpa.toFixed(2)}</p>
                </div>
                <span
                  className={`material-symbols-outlined text-outline transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  style={{ fontSize: 20 }}
                >
                  expand_more
                </span>
              </div>
            </button>

            {isOpen && sem.gradeRecords && (
              <div className="border-t border-outline-variant overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-surface-container-low">
                    <tr>
                      <th className="text-left px-5 py-2.5 text-on-surface-variant font-medium">Code</th>
                      <th className="text-left px-5 py-2.5 text-on-surface-variant font-medium">Course</th>
                      <th className="text-center px-4 py-2.5 text-on-surface-variant font-medium">Units</th>
                      <th className="text-center px-4 py-2.5 text-on-surface-variant font-medium">Grade</th>
                      <th className="text-center px-4 py-2.5 text-on-surface-variant font-medium">GP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {sem.gradeRecords.map(r => (
                      <tr key={r.id} className="hover:bg-surface-container">
                        <td className="px-5 py-2.5 font-mono text-on-surface-variant">{r.course?.code}</td>
                        <td className="px-5 py-2.5 text-on-surface">{r.course?.title}</td>
                        <td className="px-4 py-2.5 text-center text-on-surface-variant">{r.course?.units}</td>
                        <td className="px-4 py-2.5 text-center">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${GRADE_COLOR[r.grade] ?? 'bg-surface-container text-on-surface-variant'}`}>
                            {r.grade}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-center font-semibold text-on-surface">{r.gradePoint.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
