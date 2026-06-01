export interface CareerQuestion {
  id: number;
  text: string;
  category: string;
  cluster_tag: string;
  options: string[];
}

export interface AnswerInput {
  question_number: number;
  question_text: string;
  selected_option: string;
  cluster_tag: string;
}

export interface InterestResponse {
  id?: string;
  student_id: string;
  question_number: number;
  question_text: string;
  selected_option: string;
  cluster_tag: string;
  created_at?: string;
}

export interface Career {
  id: string;
  title: string;
  cluster: string;
  required_subjects: string[];
  min_marks: number;
  salary_range: string;
  growth_trend: string;
  entry_path: string;
  description: string;
}

export interface StudentMark {
  subject: string;
  marks: number;
  total_marks: number;
}

export interface CareerMatchResult {
  rank: number;
  match_score: number;
  reasoning: string;
  career: Career;
}

export const CAREER_QUESTIONS: CareerQuestion[] = [
  {
    id: 1,
    text: "Which activity excites you most?",
    category: "Interest",
    cluster_tag: "general",
    options: [
      "Building & coding things",
      "Helping & teaching people",
      "Analysing data & research",
      "Creating art & design",
      "Leading & organising teams",
    ],
  },
  {
    id: 2,
    text: "In free time you naturally?",
    category: "Interest",
    cluster_tag: "general",
    options: [
      "Code or build projects",
      "Read and research",
      "Talk to people",
      "Draw or create things",
      "Plan and organise",
    ],
  },
  {
    id: 3,
    text: "Which subject felt effortless?",
    category: "Interest",
    cluster_tag: "general",
    options: [
      "Mathematics",
      "Science & Biology",
      "Languages & Literature",
      "Commerce & Economics",
      "Arts & Computers",
    ],
  },
  {
    id: 4,
    text: "Rate your problem-solving ability",
    category: "Skills",
    cluster_tag: "analytical",
    options: [
      "Very strong - I love challenges",
      "Good - I manage most problems",
      "Average - I need some help",
      "Below average - I struggle often",
    ],
  },
  {
    id: 5,
    text: "Can you explain complex topics simply?",
    category: "Skills",
    cluster_tag: "communication",
    options: [
      "Yes, always and clearly",
      "Sometimes with effort",
      "Rarely, I find it hard",
    ],
  },
  {
    id: 6,
    text: "Comfort with numbers and logic?",
    category: "Skills",
    cluster_tag: "analytical",
    options: [
      "Love numbers, very comfortable",
      "Okay with basic maths",
      "Prefer words over numbers",
      "Avoid numbers if possible",
    ],
  },
  {
    id: 7,
    text: "In group projects your role?",
    category: "Communication",
    cluster_tag: "social",
    options: [
      "Presenter - I speak for the group",
      "Researcher - I find information",
      "Planner - I organise the work",
      "Builder - I execute the tasks",
      "Supporter - I help everyone",
    ],
  },
  {
    id: 8,
    text: "Public speaking feels?",
    category: "Communication",
    cluster_tag: "social",
    options: [
      "Exciting, I love it",
      "Okay, I can manage",
      "Stressful but I do it",
      "Very uncomfortable",
    ],
  },
  {
    id: 9,
    text: "You prefer to communicate via?",
    category: "Communication",
    cluster_tag: "social",
    options: [
      "Written - emails and reports",
      "Verbal - calls and meetings",
      "Both equally",
    ],
  },
  {
    id: 10,
    text: "Ideal work environment?",
    category: "WorkStyle",
    cluster_tag: "general",
    options: [
      "Alone with full focus",
      "Small team collaboration",
      "Large team, always together",
    ],
  },
  {
    id: 11,
    text: "Handling deadlines under pressure?",
    category: "WorkStyle",
    cluster_tag: "general",
    options: [
      "Thrive - pressure motivates me",
      "Manage okay with planning",
      "Find it stressful but cope",
      "Struggle significantly",
    ],
  },
  {
    id: 12,
    text: "Prefer work type?",
    category: "WorkStyle",
    cluster_tag: "general",
    options: [
      "Structured routine tasks",
      "Mix of routine and creative",
      "Unpredictable creative challenges",
    ],
  },
  {
    id: 13,
    text: "Most important in career?",
    category: "Values",
    cluster_tag: "general",
    options: [
      "High salary and financial security",
      "Making social impact",
      "Creative freedom",
      "Job security and stability",
      "Learning and growth",
    ],
  },
  {
    id: 14,
    text: "Work arrangement preference?",
    category: "Values",
    cluster_tag: "general",
    options: [
      "Job in established company",
      "Start my own business",
      "Freelance independently",
      "Government/public sector job",
    ],
  },
  {
    id: 15,
    text: "5-year vision?",
    category: "Values",
    cluster_tag: "general",
    options: [
      "Technical expert in my field",
      "Managing a team",
      "Running my own venture",
      "Researcher or academic",
      "Helping people directly",
    ],
  },
];

const HOLLAND_QUESTION_MAP: Record<string, number[]> = {
  Investigative: [4, 6],
  Social: [7, 8, 9],
  Artistic: [1, 2, 3],
  Conventional: [13, 14],
  Enterprising: [10, 11, 15],
  Realistic: [12],
};

const HOLLAND_TYPES = Object.keys(HOLLAND_QUESTION_MAP);

function normalizeCluster(value: string): string {
  const lower = value.toLowerCase();
  return HOLLAND_TYPES.find((h) => h.toLowerCase() === lower) ?? value;
}

function optionPoints(question: CareerQuestion, selectedOption: string): number {
  const index = question.options.indexOf(selectedOption);
  if (index < 0) return 1;
  return question.options.length - index;
}

export function getQuestions(): CareerQuestion[] {
  return CAREER_QUESTIONS;
}

export function calculateHollandScores(
  answers: AnswerInput[]
): Record<string, number> {
  const scores: Record<string, number> = Object.fromEntries(
    HOLLAND_TYPES.map((type) => [type, 0])
  );

  for (const answer of answers) {
    for (const [holland, questionNumbers] of Object.entries(
      HOLLAND_QUESTION_MAP
    )) {
      if (!questionNumbers.includes(answer.question_number)) continue;

      const question = CAREER_QUESTIONS.find(
        (q) => q.id === answer.question_number
      );
      if (!question) continue;

      scores[holland] += optionPoints(question, answer.selected_option);
    }
  }

  return scores;
}

function subjectPercentages(
  marks: StudentMark[]
): Map<string, number> {
  const totals = new Map<string, { earned: number; possible: number }>();

  for (const mark of marks) {
    const key = mark.subject.trim();
    const existing = totals.get(key) ?? { earned: 0, possible: 0 };
    existing.earned += mark.marks;
    existing.possible += mark.total_marks;
    totals.set(key, existing);
  }

  const percentages = new Map<string, number>();
  for (const [subject, { earned, possible }] of totals) {
    percentages.set(
      subject,
      possible > 0 ? Math.round((earned / possible) * 100) : 0
    );
  }

  return percentages;
}

function averagePercentage(marks: StudentMark[]): number {
  if (marks.length === 0) return 0;

  const totalEarned = marks.reduce((sum, m) => sum + m.marks, 0);
  const totalPossible = marks.reduce((sum, m) => sum + m.total_marks, 0);

  return totalPossible > 0
    ? Math.round((totalEarned / totalPossible) * 100)
    : 0;
}

function subjectMatches(
  subjectPercentages: Map<string, number>,
  requiredSubject: string,
  minMarks: number
): boolean {
  const normalizedRequired = requiredSubject.trim().toLowerCase();

  for (const [subject, pct] of subjectPercentages) {
    if (
      subject.toLowerCase().includes(normalizedRequired) ||
      normalizedRequired.includes(subject.toLowerCase())
    ) {
      return pct >= minMarks;
    }
  }

  return false;
}

function buildReasoning(
  career: Career,
  hollandScores: Record<string, number>,
  avgPct: number,
  requiredMet: number,
  requiredTotal: number,
  marksCount: number
): string {
  const careerCluster = normalizeCluster(career.cluster);
  const clusterScore = hollandScores[careerCluster] ?? 0;
  const topCluster = Object.entries(hollandScores).sort(
    (a, b) => b[1] - a[1]
  )[0]?.[0];

  const parts: string[] = [];

  if (clusterScore > 0) {
    parts.push(
      `Your ${careerCluster} interest profile aligns with this career path.`
    );
  } else if (topCluster) {
    parts.push(
      `Based on your ${topCluster} strengths, this career offers a complementary fit.`
    );
  }

  if (marksCount === 0) {
    parts.push(
      "Add your marks to improve match accuracy for subject requirements."
    );
  } else if (avgPct >= career.min_marks) {
    parts.push(
      `Your overall marks (${avgPct}%) meet the minimum requirement of ${career.min_marks}%.`
    );
  } else {
    parts.push(
      `Your overall marks (${avgPct}%) are below the ${career.min_marks}% threshold but this career remains a stretch goal.`
    );
  }

  if (requiredTotal > 0) {
    parts.push(`Required subjects met: ${requiredMet}/${requiredTotal}.`);
  }

  return parts.join(" ");
}

function calculateMatchScore(
  career: Career,
  hollandScores: Record<string, number>,
  studentMarks: StudentMark[]
): { score: number; reasoning: string } {
  const careerCluster = normalizeCluster(career.cluster);
  const maxHolland = Math.max(...Object.values(hollandScores), 1);
  const clusterScore = hollandScores[careerCluster] ?? 0;
  const clusterPoints = (clusterScore / maxHolland) * 40;

  const avgPct = averagePercentage(studentMarks);
  const marksPoints =
    avgPct >= career.min_marks
      ? 30
      : career.min_marks > 0
        ? Math.min(30, (avgPct / career.min_marks) * 30)
        : 30;

  const required = career.required_subjects ?? [];
  const subjectPct = subjectPercentages(studentMarks);
  let requiredMet = 0;

  if (required.length === 0) {
    requiredMet = 0;
  } else {
    for (const subj of required) {
      if (subjectMatches(subjectPct, subj, career.min_marks)) {
        requiredMet++;
      }
    }
  }

  const requiredPoints =
    required.length === 0 ? 30 : (requiredMet / required.length) * 30;

  const score = Math.round(
    Math.min(100, clusterPoints + marksPoints + requiredPoints)
  );

  const reasoning = buildReasoning(
    career,
    hollandScores,
    avgPct,
    requiredMet,
    required.length,
    studentMarks.length
  );

  return { score, reasoning };
}

export function matchCareersToStudent(
  answers: AnswerInput[],
  careers: Career[],
  studentMarks: StudentMark[]
): CareerMatchResult[] {
  const hollandScores = calculateHollandScores(answers);

  const scored = careers.map((career) => {
    const { score, reasoning } = calculateMatchScore(
      career,
      hollandScores,
      studentMarks
    );
    return { career, match_score: score, reasoning };
  });

  scored.sort((a, b) => b.match_score - a.match_score);

  return scored.slice(0, 3).map((item, index) => ({
    rank: index + 1,
    match_score: item.match_score,
    reasoning: item.reasoning,
    career: item.career,
  }));
}
