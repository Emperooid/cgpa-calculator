'use client';
import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { coursesService } from '@/services/courses.service';
import { gpaService } from '@/services/gpa.service';
import { useAuthStore } from '@/store/auth.store';
import { Course, GRADES_5, GRADE_POINTS_5 } from '@/types';

const LEVELS = [100, 200, 300, 400, 500];

interface GradeRow {
  courseId: string;
  code: string;
  title: string;
  units: number;
  grade: string;
}

function gradeClass(gpa: number) {
  if (gpa >= 4.5) return 'First Class';
  if (gpa >= 3.5) return '2nd Class Upper';
  if (gpa >= 2.4) return '2nd Class Lower';
  if (gpa >= 1.5) return 'Third Class';
  if (gpa >= 1.0) return 'Pass';
  return 'Fail';
}

const selectCls = 'w-full px-3 py-2.5 bg-surface border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow appearance-none';
const labelCls = 'block text-[11px] font-semibold text-on-surface-variant mb-2 uppercase tracking-wide';

export default function CalculatorPage() {
  const { user } = useAuthStore();
  const dept = user?.student?.departmentId ?? '';

  const [level, setLevel] = useState<number>(user?.student?.currentLevel ?? 100);
  const [semester, setSemester] = useState<number>(1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [rows, setRows] = useState<GradeRow[]>([]);
  const [manualRow, setManualRow] = useState({ code: '', title: '', units: 3, grade: 'A' });
  const [result, setResult] = useState<{ gpa: number; totalUnits: number; cgpa: number } | null>(null);

  const { data: courses, isLoading: loadingCourses } = useQuery<Course[]>({
    queryKey: ['courses', dept, level, semester],
    queryFn: () => coursesService.forSemester(dept, level, semester),
    enabled: !!dept,
  });

  useEffect(() => {
    if (courses && courses.length > 0) {
      setRows(courses.map(c => ({ courseId: c.id, code: c.code, title: c.title, units: c.units, grade: 'A' })));
    }
  }, [courses]);

  const submitMutation = useMutation({
    mutationFn: (grades: { courseId: string; grade: string }[]) =>
      gpaService.submitSemester({ level, semester, year, grades }),
    onSuccess: (data) => {
      setResult(data);
      toast.success(`GPA: ${data.gpa.toFixed(2)} | CGPA: ${data.cgpa.toFixed(2)}`);
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Submission failed'),
  });

  const calcGPA = () => {
    const pts = rows.filter(r => r.grade && r.units);
    if (!pts.length) return null;
    const qp = pts.reduce((a, r) => a + (GRADE_POINTS_5[r.grade] ?? 0) * r.units, 0);
    const tu = pts.reduce((a, r) => a + r.units, 0);
    return { gpa: qp / tu, totalUnits: tu };
  };

  const liveResult = calcGPA();

  const addManualRow = () => {
    if (!manualRow.code || !manualRow.title) { toast.error('Enter course code and title'); return; }
    setRows(prev => [...prev, { courseId: `manual-${Date.now()}`, ...manualRow }]);
    setManualRow({ code: '', title: '', units: 3, grade: 'A' });
  };

  const removeRow = (i: number) => setRows(prev => prev.filter((_, idx) => idx !== i));
  const updateGrade = (i: number, grade: string) =>
    setRows(prev => prev.map((r, idx) => idx === i ? { ...r, grade } : r));

  const [contributing, setContributing] = useState(false);
  const gradeFileRef = useRef<HTMLInputElement>(null);
  const courseFileRef = useRef<HTMLInputElement>(null);

  const handleCourseFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = (e.target?.result as string) ?? '';
      const lines = text.trim().split('\n').map(l => l.trim()).filter(Boolean);
      const parsed: GradeRow[] = [];
      for (const line of lines) {
        const sep = line.includes('\t') ? '\t' : ',';
        const cols = line.split(sep).map(c => c.trim().replace(/^["']|["']$/g, ''));
        if (cols.length < 2) continue;
        const code = cols[0].toUpperCase();
        const title = cols[1];
        const units = parseInt(cols[2] ?? '3', 10);
        if (!code || !title || /^(code|course.?code)$/i.test(code)) continue;
        parsed.push({
          courseId: `manual-${Date.now()}-${parsed.length}`,
          code, title,
          units: isNaN(units) || units < 1 || units > 6 ? 3 : units,
          grade: 'A',
        });
      }
      if (!parsed.length) { toast.error('No valid courses found. Use format: CODE, TITLE, UNITS'); return; }
      setRows(parsed);
      toast.success(`${parsed.length} course${parsed.length !== 1 ? 's' : ''} loaded`);
    };
    reader.readAsText(file);
  };

  const handleGradeFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = (e.target?.result as string) ?? '';
      const lines = text.trim().split('\n').map(l => l.trim()).filter(Boolean);
      let matched = 0;
      setRows(prev => {
        const next = [...prev];
        for (const line of lines) {
          const sep = line.includes('\t') ? '\t' : ',';
          const [rawCode, rawGrade] = line.split(sep).map(c => c.trim().replace(/^["']|["']$/g, ''));
          if (!rawCode || !rawGrade) continue;
          const code = rawCode.toUpperCase();
          const grade = rawGrade.toUpperCase();
          if (!['A','B','C','D','E','F'].includes(grade)) continue;
          const idx = next.findIndex(r => r.code.toUpperCase() === code);
          if (idx !== -1) { next[idx] = { ...next[idx], grade }; matched++; }
        }
        return next;
      });
      toast.success(matched ? `${matched} grade${matched !== 1 ? 's' : ''} applied from file` : 'No matching courses found');
    };
    reader.readAsText(file);
  };

  const handleSubmit = async () => {
    if (!rows.length) return;

    let allRows = [...rows];
    const manualRows = allRows.filter(r => r.courseId.startsWith('manual-'));

    // Auto-contribute manual courses to the DB so they get real IDs
    if (manualRows.length > 0) {
      if (!dept) {
        toast.error('Set your department in Settings before saving manual courses.');
        return;
      }
      setContributing(true);
      try {
        const created = await Promise.all(
          manualRows.map(r =>
            coursesService.create({
              code: r.code, title: r.title, units: r.units,
              departmentId: dept, level, semester, isCompulsory: false,
            }),
          ),
        );
        allRows = allRows.map(r => {
          if (!r.courseId.startsWith('manual-')) return r;
          const idx = manualRows.findIndex(m => m.courseId === r.courseId);
          return { ...r, courseId: created[idx].id };
        });
        setRows(allRows);
        toast.success(`${manualRows.length} manual course${manualRows.length !== 1 ? 's' : ''} added to database`);
      } catch (e: any) {
        toast.error(e.response?.data?.message ?? 'Could not save manual courses');
        setContributing(false);
        return;
      } finally {
        setContributing(false);
      }
    }

    const grades = allRows.map(r => ({ courseId: r.courseId, grade: r.grade }));
    submitMutation.mutate(grades);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-on-background">GPA Calculator</h1>
        <p className="text-xs text-on-surface-variant mt-1">Select your semester, enter grades, and save to your record.</p>
      </div>

      {/* Semester selector */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6">
        <h2 className="text-[16px] font-semibold text-on-surface mb-5 flex items-center gap-2">
          <span className="material-symbols-outlined text-outline">tune</span>
          Semester Details
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Level</label>
            <div className="relative">
              <select value={level} onChange={e => setLevel(+e.target.value)} className={selectCls}>
                {LEVELS.map(l => <option key={l} value={l}>{l} Level</option>)}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-2.5 text-outline pointer-events-none" style={{ fontSize: 18 }}>expand_more</span>
            </div>
          </div>
          <div>
            <label className={labelCls}>Semester</label>
            <div className="relative">
              <select value={semester} onChange={e => setSemester(+e.target.value)} className={selectCls}>
                <option value={1}>First Semester</option>
                <option value={2}>Second Semester</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-2.5 text-outline pointer-events-none" style={{ fontSize: 18 }}>expand_more</span>
            </div>
          </div>
          <div>
            <label className={labelCls}>Academic Year</label>
            <input
              type="number"
              value={year}
              onChange={e => setYear(+e.target.value)}
              className="w-full px-3 py-2.5 bg-surface border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow"
            />
          </div>
        </div>
      </div>

      {/* Live GPA banner */}
      {liveResult && (
        <div className="relative overflow-hidden bg-primary text-on-primary rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
          <div className="absolute inset-0 bg-linear-to-r from-primary to-surface-tint opacity-80 pointer-events-none" />
          <div className="relative z-10">
            <p className="text-[11px] font-semibold text-primary-fixed uppercase tracking-wider mb-1">Live GPA Preview</p>
            <p className="text-3xl sm:text-4xl font-bold leading-none">{liveResult.gpa.toFixed(2)}</p>
            <p className="text-primary-fixed text-xs mt-1">{liveResult.totalUnits} credit units</p>
          </div>
          <div className="relative z-10 text-right bg-surface-tint/40 backdrop-blur-md px-4 py-2.5 rounded-lg border border-on-primary/10">
            <p className="text-[10px] font-semibold text-primary-fixed opacity-80 uppercase tracking-wide mb-1">Grade Class</p>
            <p className="text-[16px] font-bold">{gradeClass(liveResult.gpa)}</p>
          </div>
        </div>
      )}

      {/* Courses table */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
        <input
          ref={gradeFileRef}
          type="file"
          accept=".csv,.txt,.tsv"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleGradeFile(f); e.target.value = ''; }}
        />
        <input
          ref={courseFileRef}
          type="file"
          accept=".csv,.txt,.tsv"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleCourseFile(f); e.target.value = ''; }}
        />
        <div className="px-4 sm:px-6 py-4 border-b border-outline-variant flex flex-wrap items-center justify-between gap-y-2">
          <h2 className="text-[16px] font-semibold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-outline">list_alt</span>
            Courses
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => courseFileRef.current?.click()}
              title="Upload course list CSV (Code, Title, Units per row)"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary border border-primary/30 rounded-lg hover:bg-primary/10 transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>upload</span>
              Upload Courses
            </button>
            {rows.length > 0 && (
              <button
                onClick={() => gradeFileRef.current?.click()}
                title="Upload result sheet CSV (Code, Grade per row)"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary border border-primary/30 rounded-lg hover:bg-primary/10 transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>upload_file</span>
                Upload Results
              </button>
            )}
            <span className="text-xs font-semibold text-on-surface-variant bg-surface-container px-2.5 py-1 rounded-full">
              {rows.length} course{rows.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {loadingCourses ? (
          <div className="p-4 space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton h-11 rounded-lg" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="p-10 text-center">
            <span className="material-symbols-outlined text-outline mb-3" style={{ fontSize: 40, display: 'block' }}>library_books</span>
            {dept ? (
              <>
                <p className="text-sm font-semibold text-on-surface mb-1">No courses for this semester yet</p>
                <p className="text-sm text-on-surface-variant mb-4 max-w-xs mx-auto">
                  Your department hasn&apos;t had courses added for this level and semester. Be the first to contribute!
                </p>
                <Link
                  href="/contribute"
                  className="inline-flex items-center gap-2 bg-primary text-on-primary text-sm font-semibold px-4 py-2 rounded-lg hover:bg-surface-tint transition-colors"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>volunteer_activism</span>
                  Go to Contribute
                </Link>
                <p className="text-xs text-on-surface-variant mt-4">Or add courses manually below to calculate without saving.</p>
              </>
            ) : (
              <p className="text-sm text-on-surface-variant">Set your department in Settings to auto-load courses, or add them manually below.</p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-container">
                <tr>
                  <th className="text-left px-6 py-3 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wide">Code</th>
                  <th className="text-left px-6 py-3 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wide">Course Title</th>
                  <th className="text-center px-3 py-3 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wide">Units</th>
                  <th className="text-center px-3 py-3 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wide">Grade</th>
                  <th className="text-center px-3 py-3 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wide">GP</th>
                  <th className="px-3 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/50">
                {rows.map((row, i) => (
                  <tr key={i} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-6 py-3 font-mono text-[13px] text-on-surface font-medium">{row.code}</td>
                    <td className="px-6 py-3 text-on-surface max-w-xs truncate">{row.title}</td>
                    <td className="px-3 py-3 text-center text-on-surface-variant">{row.units}</td>
                    <td className="px-3 py-3 text-center">
                      <select
                        value={row.grade}
                        onChange={e => updateGrade(i, e.target.value)}
                        className="px-2 py-1 rounded-lg border border-outline-variant text-sm text-on-surface bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        {GRADES_5.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </td>
                    <td className="px-3 py-3 text-center font-bold text-primary">
                      {((GRADE_POINTS_5[row.grade] ?? 0) * row.units).toFixed(0)}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <button onClick={() => removeRow(i)} className="text-outline hover:text-error transition-colors">
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Manual add row */}
        <div className="px-6 py-4 border-t border-outline-variant bg-surface-container">
          <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wide mb-3">Add course manually</p>
          <div className="flex gap-2 flex-wrap">
            <input
              value={manualRow.code}
              onChange={e => setManualRow(p => ({ ...p, code: e.target.value.toUpperCase() }))}
              placeholder="MTH101"
              className="px-3 py-2 rounded-lg border border-outline-variant text-sm bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary w-24"
            />
            <input
              value={manualRow.title}
              onChange={e => setManualRow(p => ({ ...p, title: e.target.value }))}
              placeholder="Course title"
              className="flex-1 min-w-[160px] px-3 py-2 rounded-lg border border-outline-variant text-sm bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <select
              value={manualRow.units}
              onChange={e => setManualRow(p => ({ ...p, units: +e.target.value }))}
              className="px-3 py-2 rounded-lg border border-outline-variant text-sm bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {[1, 2, 3, 4, 5, 6].map(u => <option key={u} value={u}>{u}u</option>)}
            </select>
            <select
              value={manualRow.grade}
              onChange={e => setManualRow(p => ({ ...p, grade: e.target.value }))}
              className="px-3 py-2 rounded-lg border border-outline-variant text-sm bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {GRADES_5.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            <button onClick={addManualRow} className="flex items-center gap-1.5 px-4 py-2 bg-on-surface text-surface text-sm rounded-lg hover:opacity-80 transition-opacity">
              <span className="material-symbols-outlined" style={{ fontSize: 15 }}>add</span>
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Success card */}
      {result && (
        <div className="bg-secondary-container/40 border border-on-secondary-container/20 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-secondary" style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            <h3 className="font-semibold text-on-secondary-container">Grades Saved Successfully</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-surface-container-lowest rounded-lg p-3 text-center">
              <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wide mb-1">Semester GPA</p>
              <p className="text-2xl font-bold text-primary">{result.gpa.toFixed(2)}</p>
            </div>
            <div className="bg-surface-container-lowest rounded-lg p-3 text-center">
              <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wide mb-1">Units</p>
              <p className="text-2xl font-bold text-on-surface">{result.totalUnits}</p>
            </div>
            <div className="bg-surface-container-lowest rounded-lg p-3 text-center">
              <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wide mb-1">CGPA</p>
              <p className="text-2xl font-bold text-primary">{result.cgpa.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!rows.length || submitMutation.isPending || contributing}
        className="flex items-center gap-2 bg-primary text-on-primary font-semibold px-6 py-3 rounded-lg shadow-sm hover:bg-surface-tint transition-all disabled:opacity-50"
      >
        {contributing ? 'Adding courses…' : submitMutation.isPending ? 'Saving…' : (
          <>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>save</span>
            Save & Calculate CGPA
          </>
        )}
      </button>
    </div>
  );
}
