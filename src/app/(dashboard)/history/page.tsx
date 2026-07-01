'use client';
import { useQuery } from '@tanstack/react-query';
import { studentsService } from '@/services/students.service';
import { SemesterRecord } from '@/types';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

const GRADE_COLOR: Record<string, string> = {
  A: 'bg-emerald-100 text-emerald-700',
  B: 'bg-blue-100 text-blue-700',
  C: 'bg-amber-100 text-amber-700',
  D: 'bg-orange-100 text-orange-700',
  E: 'bg-red-100 text-red-700',
  F: 'bg-red-200 text-red-800',
};

export default function HistoryPage() {
  const { data: history, isLoading } = useQuery<SemesterRecord[]>({
    queryKey: ['history'],
    queryFn: studentsService.getHistory,
  });

  const [open, setOpen] = useState<string | null>(null);

  if (isLoading) return <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-white rounded-xl border border-slate-100 animate-pulse" />)}</div>;

  if (!history || history.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400 text-lg">No grade history yet.</p>
        <p className="text-slate-400 text-sm mt-1">Submit your first semester grades in the Calculator.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Grade History</h1>
      <p className="text-slate-500">All your recorded semesters.</p>

      {history.map((sem) => {
        const key = sem.id;
        const isOpen = open === key;
        return (
          <div key={key} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <button
              onClick={() => setOpen(isOpen ? null : key)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <span className="text-indigo-700 font-bold text-sm">{sem.level}L</span>
                </div>
                <div className="text-left">
                  <p className="font-semibold text-slate-900">{sem.level} Level — Semester {sem.semester}</p>
                  <p className="text-sm text-slate-400">{sem.year} · {sem.totalUnits} units</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-slate-400">GPA</p>
                  <p className="text-xl font-bold text-indigo-600">{sem.gpa.toFixed(2)}</p>
                </div>
                <ChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </div>
            </button>

            {isOpen && sem.gradeRecords && (
              <div className="border-t border-slate-100 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left px-5 py-2.5 text-slate-500 font-medium">Code</th>
                      <th className="text-left px-5 py-2.5 text-slate-500 font-medium">Course</th>
                      <th className="text-center px-4 py-2.5 text-slate-500 font-medium">Units</th>
                      <th className="text-center px-4 py-2.5 text-slate-500 font-medium">Grade</th>
                      <th className="text-center px-4 py-2.5 text-slate-500 font-medium">GP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {sem.gradeRecords.map(r => (
                      <tr key={r.id} className="hover:bg-slate-50">
                        <td className="px-5 py-2.5 font-mono text-slate-600">{r.course?.code}</td>
                        <td className="px-5 py-2.5 text-slate-700">{r.course?.title}</td>
                        <td className="px-4 py-2.5 text-center text-slate-600">{r.course?.units}</td>
                        <td className="px-4 py-2.5 text-center">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${GRADE_COLOR[r.grade] ?? 'bg-slate-100 text-slate-600'}`}>
                            {r.grade}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-center font-semibold text-slate-700">{r.gradePoint.toFixed(1)}</td>
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
