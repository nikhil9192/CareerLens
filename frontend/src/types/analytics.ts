export type Trend = "up" | "down" | "stable";

export interface SemesterGpa {
  semester: string;
  gpa: number;
  subjectCount: number;
}

export interface GpaAnalytics {
  overallGpa: number;
  semesterBreakdown: SemesterGpa[];
  trend: Trend;
  change: number;
}

export interface SubjectScore {
  name: string;
  score: number;
  grade: string;
  status?: "pass" | "fail";
}

export interface SubjectAnalytics {
  topSubjects: SubjectScore[];
  weakSubjects: SubjectScore[];
  all: SubjectScore[];
}

export interface RankingAnalytics {
  rank: number;
  totalStudents: number;
  percentile: number;
  batch: string;
}

export interface AnalyticsSummary {
  gpa: GpaAnalytics;
  subjects: SubjectAnalytics;
  ranking: RankingAnalytics;
}
