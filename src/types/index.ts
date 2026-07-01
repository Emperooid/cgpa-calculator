export interface School {
  id: string;
  name: string;
  shortName?: string;
  country: string;
  gradingScale: 'FIVE_POINT' | 'FOUR_POINT';
}

export interface Faculty {
  id: string;
  name: string;
  shortName?: string;
  schoolId: string;
}

export interface Department {
  id: string;
  name: string;
  shortName?: string;
  facultyId: string;
  faculty?: Faculty;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  units: number;
  isCompulsory: boolean;
}

export interface Student {
  id: string;
  name: string;
  matricYear?: number;
  schoolId: string;
  departmentId: string;
  currentLevel: number;
  targetGrade?: string;
  targetCgpa?: number;
  school?: School;
  department?: Department;
}

export interface User {
  id: string;
  email: string;
  role: 'STUDENT' | 'ADMIN' | 'CONTRIBUTOR';
  student?: Student;
}

export interface SemesterRecord {
  id: string;
  level: number;
  semester: number;
  year: number;
  gpa: number;
  totalUnits: number;
  gradeRecords?: GradeRecord[];
}

export interface GradeRecord {
  id: string;
  courseId: string;
  grade: string;
  gradePoint: number;
  course?: Course;
}

export interface GradeEntry {
  courseId: string;
  code: string;
  title: string;
  units: number;
  grade: string;
}

export interface Analytics {
  cgpa: number;
  currentClass: string;
  semesterTrend: { label: string; gpa: number; totalUnits: number }[];
  gradeDistribution: Record<string, number>;
  strongestCourse?: string;
  weakestCourse?: string;
  totalUnitsCompleted: number;
  chances: { class: string; possible: boolean }[];
}

export interface Prediction {
  currentCgpa: number;
  targetCgpa: number;
  totalUnitsDone: number;
  remainingUnits: number;
  requiredGPA: number | null;
  maxAchievableCgpa: number;
  isPossible: boolean;
  currentClass: string;
  targetClass: string;
  message: string;
}

export interface StudyPlan {
  id: string;
  targetGrade: string;
  targetCgpa: number;
  plan: {
    weekly: Record<string, string[]>;
    studyHoursPerDay: number;
    tips: string[];
    totalWeeklyHours: number;
  };
  createdAt: string;
}

export const GRADES_5 = ['A', 'B', 'C', 'D', 'E', 'F'] as const;
export const GRADES_4 = ['A', 'B', 'C', 'D', 'F'] as const;

export const GRADE_POINTS_5: Record<string, number> = { A: 5, B: 4, C: 3, D: 2, E: 1, F: 0 };
export const GRADE_POINTS_4: Record<string, number> = { A: 4, B: 3, C: 2, D: 1, F: 0 };

export const GRADE_CLASSES = [
  { label: 'First Class', min: 4.5 },
  { label: 'Second Class Upper (2:1)', min: 3.5 },
  { label: 'Second Class Lower (2:2)', min: 2.4 },
  { label: 'Third Class', min: 1.5 },
  { label: 'Pass', min: 1.0 },
];

export const LEVELS = [100, 200, 300, 400, 500];
