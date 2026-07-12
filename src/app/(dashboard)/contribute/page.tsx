'use client';
import { useState, useEffect, useRef } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { schoolsService } from '@/services/schools.service';
import { coursesService } from '@/services/courses.service';
import { School, Faculty, Department } from '@/types';

interface CourseEntry { code: string; title: string; units: number; isCompulsory: boolean }
const blank = (): CourseEntry => ({ code: '', title: '', units: 3, isCompulsory: true });

const LEVELS = [100, 200, 300, 400, 500];
const inputClass = 'w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-shadow';

function parseCoursesFromText(text: string): CourseEntry[] {
  const lines = text.trim().split('\n').map(l => l.trim()).filter(Boolean);
  const result: CourseEntry[] = [];
  for (const line of lines) {
    const sep = line.includes('\t') ? '\t' : ',';
    const cols = line.split(sep).map(c => c.trim().replace(/^["']|["']$/g, ''));
    if (cols.length < 2) continue;
    const code = cols[0].toUpperCase();
    const title = cols[1];
    const units = parseInt(cols[2] ?? '3', 10);
    if (!code || !title || /^(code|course.?code)$/i.test(code)) continue;
    result.push({ code, title, units: isNaN(units) || units < 1 || units > 6 ? 3 : units, isCompulsory: true });
  }
  return result;
}

type EntryMode = 'manual' | 'upload' | 'paste';

export default function ContributePage() {
  const [schoolSearch, setSchoolSearch] = useState('');
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [level, setLevel] = useState(100);
  const [semester, setSemester] = useState(1);
  const [courses, setCourses] = useState<CourseEntry[]>([blank()]);
  const [newSchoolName, setNewSchoolName] = useState('');
  const [newFacultyName, setNewFacultyName] = useState('');
  const [newDeptName, setNewDeptName] = useState('');
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [entryMode, setEntryMode] = useState<EntryMode>('manual');
  const [pasteText, setPasteText] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: schools } = useQuery<School[]>({
    queryKey: ['schools', schoolSearch],
    queryFn: () => schoolsService.getAll(schoolSearch),
  });

  useEffect(() => {
    if (!selectedSchool) return;
    schoolsService.getFaculties(selectedSchool.id).then(setFaculties).catch(() => setFaculties([]));
  }, [selectedSchool]);

  useEffect(() => {
    if (!selectedFaculty) return;
    schoolsService.getDepartments(selectedFaculty.id).then(setDepartments).catch(() => setDepartments([]));
  }, [selectedFaculty]);

  const addSchoolMutation = useMutation({
    mutationFn: () => schoolsService.create({ name: newSchoolName }),
    onSuccess: (data) => { setSelectedSchool(data); toast.success(`${data.name} added!`); },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Failed'),
  });

  const addFacultyMutation = useMutation({
    mutationFn: () => schoolsService.createFaculty({ name: newFacultyName, schoolId: selectedSchool!.id }),
    onSuccess: (data) => { setSelectedFaculty(data); toast.success(`${data.name} added!`); },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Failed'),
  });

  const addDeptMutation = useMutation({
    mutationFn: () => schoolsService.createDepartment({ name: newDeptName, facultyId: selectedFaculty!.id }),
    onSuccess: (data) => { setSelectedDept(data); toast.success(`${data.name} added!`); },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Failed'),
  });

  const addCoursesMutation = useMutation({
    mutationFn: () =>
      coursesService.bulkCreate({
        departmentId: selectedDept!.id,
        level,
        semester,
        courses: courses.filter(c => c.code && c.title),
      }),
    onSuccess: () => {
      toast.success('Courses added! Thank you for contributing');
      setCourses([blank()]);
      setEntryMode('manual');
      setPasteText('');
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Failed'),
  });

  const updateCourse = (i: number, field: keyof CourseEntry, value: any) =>
    setCourses(prev => prev.map((c, idx) => idx === i ? { ...c, [field]: value } : c));

  const handleFile = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseCoursesFromText(text);
      if (!parsed.length) { toast.error('No valid courses found. Use format: CODE, TITLE, UNITS'); return; }
      setCourses(parsed);
      setEntryMode('manual');
      toast.success(`${parsed.length} course${parsed.length !== 1 ? 's' : ''} loaded from file`);
    };
    reader.readAsText(file);
  };

  const handlePasteImport = () => {
    const parsed = parseCoursesFromText(pasteText);
    if (!parsed.length) { toast.error('No valid courses found. Use format: CODE, TITLE, UNITS'); return; }
    setCourses(parsed);
    setEntryMode('manual');
    setPasteText('');
    toast.success(`${parsed.length} course${parsed.length !== 1 ? 's' : ''} imported`);
  };

  const validCourses = courses.filter(c => c.code && c.title).length;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-on-surface">Contribute to the Database</h1>
        <p className="text-sm text-on-surface-variant mt-1">Help your fellow students by adding your department's courses.</p>
      </div>

      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex gap-3">
        <span className="material-symbols-outlined text-primary mt-0.5 shrink-0" style={{ fontSize: 20 }}>group</span>
        <p className="text-sm text-on-surface">
          Once you add courses, every student from your department will have them automatically loaded in the calculator. Be the first contributor!
        </p>
      </div>

      {/* Step 1: School */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-5">
        <h2 className="font-semibold text-on-surface mb-3">Step 1 — School</h2>
        {selectedSchool ? (
          <div className="flex items-center justify-between">
            <span className="text-secondary font-medium flex items-center gap-1.5">
              <span className="material-symbols-outlined" style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              {selectedSchool.name}
            </span>
            <button onClick={() => { setSelectedSchool(null); setSelectedFaculty(null); setSelectedDept(null); }} className="text-xs text-outline hover:text-on-surface transition-colors">Change</button>
          </div>
        ) : (
          <div className="space-y-3">
            <input value={schoolSearch} onChange={e => setSchoolSearch(e.target.value)} placeholder="Search school..." className={inputClass} />
            {schools && schools.length > 0 && (
              <div className="border border-outline-variant rounded-lg divide-y divide-outline-variant max-h-40 overflow-auto">
                {schools.map(s => (
                  <button key={s.id} onClick={() => setSelectedSchool(s)} className="w-full text-left px-3 py-2 text-sm hover:bg-surface-container text-on-surface transition-colors">
                    {s.name}
                  </button>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input value={newSchoolName} onChange={e => setNewSchoolName(e.target.value)} placeholder="School not found? Add it..." className="flex-1 px-3 py-2 rounded-lg border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-shadow" />
              <button onClick={() => addSchoolMutation.mutate()} disabled={!newSchoolName || addSchoolMutation.isPending} className="px-4 py-2 bg-primary text-on-primary text-sm rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center">
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Step 2: Faculty */}
      {selectedSchool && (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-5">
          <h2 className="font-semibold text-on-surface mb-3">Step 2 — Faculty</h2>
          {selectedFaculty ? (
            <div className="flex items-center justify-between">
              <span className="text-secondary font-medium flex items-center gap-1.5">
                <span className="material-symbols-outlined" style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                {selectedFaculty.name}
              </span>
              <button onClick={() => { setSelectedFaculty(null); setSelectedDept(null); }} className="text-xs text-outline hover:text-on-surface transition-colors">Change</button>
            </div>
          ) : (
            <div className="space-y-3">
              {faculties.length > 0 && (
                <div className="border border-outline-variant rounded-lg divide-y divide-outline-variant max-h-40 overflow-auto">
                  {faculties.map(f => (
                    <button key={f.id} onClick={() => setSelectedFaculty(f)} className="w-full text-left px-3 py-2 text-sm hover:bg-surface-container text-on-surface transition-colors">
                      {f.name}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <input value={newFacultyName} onChange={e => setNewFacultyName(e.target.value)} placeholder="Faculty not listed? Add it..." className="flex-1 px-3 py-2 rounded-lg border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-shadow" />
                <button onClick={() => addFacultyMutation.mutate()} disabled={!newFacultyName || addFacultyMutation.isPending} className="px-4 py-2 bg-primary text-on-primary text-sm rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center">
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Department */}
      {selectedFaculty && (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-5">
          <h2 className="font-semibold text-on-surface mb-3">Step 3 — Department</h2>
          {selectedDept ? (
            <div className="flex items-center justify-between">
              <span className="text-secondary font-medium flex items-center gap-1.5">
                <span className="material-symbols-outlined" style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                {selectedDept.name}
              </span>
              <button onClick={() => setSelectedDept(null)} className="text-xs text-outline hover:text-on-surface transition-colors">Change</button>
            </div>
          ) : (
            <div className="space-y-3">
              {departments.length > 0 && (
                <div className="border border-outline-variant rounded-lg divide-y divide-outline-variant max-h-40 overflow-auto">
                  {departments.map(d => (
                    <button key={d.id} onClick={() => setSelectedDept(d)} className="w-full text-left px-3 py-2 text-sm hover:bg-surface-container text-on-surface transition-colors">
                      {d.name}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <input value={newDeptName} onChange={e => setNewDeptName(e.target.value)} placeholder="Department not listed? Add it..." className="flex-1 px-3 py-2 rounded-lg border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-shadow" />
                <button onClick={() => addDeptMutation.mutate()} disabled={!newDeptName || addDeptMutation.isPending} className="px-4 py-2 bg-primary text-on-primary text-sm rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center">
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 4: Courses */}
      {selectedDept && (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-5">
          <h2 className="font-semibold text-on-surface mb-4">Step 4 — Add Courses</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-1">Level</label>
              <select value={level} onChange={e => setLevel(+e.target.value)} className={inputClass}>
                {LEVELS.map(l => <option key={l} value={l}>{l} Level</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-1">Semester</label>
              <select value={semester} onChange={e => setSemester(+e.target.value)} className={inputClass}>
                <option value={1}>First Semester</option>
                <option value={2}>Second Semester</option>
              </select>
            </div>
          </div>

          {/* Mode tabs */}
          <div className="flex gap-1 p-1 bg-surface-container rounded-lg mb-4">
            {(['manual', 'upload', 'paste'] as EntryMode[]).map(m => (
              <button
                key={m}
                onClick={() => setEntryMode(m)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  entryMode === m
                    ? 'bg-surface-container-lowest text-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                  {m === 'manual' ? 'edit' : m === 'upload' ? 'upload_file' : 'content_paste'}
                </span>
                {m === 'manual' ? 'Manual' : m === 'upload' ? 'Upload File' : 'Paste Data'}
              </button>
            ))}
          </div>

          {/* Upload mode */}
          {entryMode === 'upload' && (
            <div className="mb-4">
              <input
                ref={fileRef}
                type="file"
                accept=".csv,.txt,.tsv"
                className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }}
              />
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  dragOver ? 'border-primary bg-primary/5' : 'border-outline-variant hover:border-primary/50 hover:bg-surface-container'
                }`}
              >
                <span className="material-symbols-outlined text-outline mb-2 block" style={{ fontSize: 36 }}>upload_file</span>
                <p className="text-sm font-medium text-on-surface">Drop your file here or click to browse</p>
                <p className="text-xs text-on-surface-variant mt-1">Supports CSV, TSV, or plain text</p>
              </div>
              <div className="mt-3 p-3 bg-surface-container rounded-lg">
                <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wide mb-1.5">Expected format (one course per line)</p>
                <pre className="text-xs text-on-surface font-mono">MTH101, Elementary Mathematics I, 3{'\n'}PHY101, General Physics I, 3{'\n'}CHM101, General Chemistry I, 3</pre>
              </div>
            </div>
          )}

          {/* Paste mode */}
          {entryMode === 'paste' && (
            <div className="mb-4 space-y-3">
              <p className="text-xs text-on-surface-variant">
                Copy your course list from Excel, Google Sheets, or any text source and paste it below.
                Each row should have: <span className="font-mono font-semibold">Code, Title, Units</span>
              </p>
              <textarea
                value={pasteText}
                onChange={e => setPasteText(e.target.value)}
                placeholder={'MTH101\tElementary Mathematics I\t3\nPHY101\tGeneral Physics I\t3'}
                rows={8}
                className="w-full px-3 py-2.5 rounded-lg border border-outline-variant bg-surface text-on-surface text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary transition-shadow resize-none"
              />
              <button
                onClick={handlePasteImport}
                disabled={!pasteText.trim()}
                className="w-full bg-primary text-on-primary font-semibold py-2.5 rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>content_paste</span>
                Import {parseCoursesFromText(pasteText).length || ''} Courses
              </button>
            </div>
          )}

          {/* Manual entry (always shown, also shown after import for review) */}
          {entryMode === 'manual' && (
            <>
              <div className="space-y-2 mb-3">
                {courses.map((c, i) => (
                  <div key={i} className="flex flex-wrap gap-2 items-center">
                    <input
                      value={c.code}
                      onChange={e => updateCourse(i, 'code', e.target.value.toUpperCase())}
                      placeholder="MTH101"
                      className="w-24 shrink-0 px-2 py-1.5 rounded border border-outline-variant bg-surface text-on-surface text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <input
                      value={c.title}
                      onChange={e => updateCourse(i, 'title', e.target.value)}
                      placeholder="Course title"
                      className="flex-1 min-w-30 px-2 py-1.5 rounded border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <select
                      value={c.units}
                      onChange={e => updateCourse(i, 'units', +e.target.value)}
                      className="w-16 px-2 py-1.5 rounded border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {[1, 2, 3, 4, 5, 6].map(u => <option key={u} value={u}>{u}u</option>)}
                    </select>
                    <button
                      onClick={() => setCourses(prev => prev.filter((_, j) => j !== i))}
                      className="text-outline hover:text-error transition-colors p-1"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setCourses(prev => [...prev, blank()])}
                className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-medium mb-5 transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
                Add another course
              </button>
            </>
          )}

          {/* Submit — shown in all modes except paste */}
          {entryMode !== 'paste' && (
            <button
              onClick={() => addCoursesMutation.mutate()}
              disabled={addCoursesMutation.isPending || validCourses === 0}
              className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-on-primary font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {addCoursesMutation.isPending ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-on-primary/30 border-t-on-primary animate-spin" />
                  Submitting…
                </>
              ) : (
                `Submit ${validCourses} Course${validCourses !== 1 ? 's' : ''}`
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
