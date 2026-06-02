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

export interface TeacherAssessment {
  curiosity: number;
  communication: number;
  leadership: number;
  persistence: number;
  creativity: number;
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

const CLUSTER_TYPES = [
  "Investigative",
  "Social",
  "Artistic",
  "Conventional",
  "Enterprising",
  "Realistic",
] as const;

type ClusterType = (typeof CLUSTER_TYPES)[number];

function emptyClusterScores(): Record<ClusterType, number> {
  return {
    Investigative: 0,
    Social: 0,
    Artistic: 0,
    Conventional: 0,
    Enterprising: 0,
    Realistic: 0,
  };
}

function normalizeCluster(value: string): ClusterType | null {
  const match = CLUSTER_TYPES.find(
    (cluster) => cluster.toLowerCase() === value.trim().toLowerCase()
  );
  return match ?? null;
}

export function calculateClusterScores(
  responses: Pick<InterestResponse, "question_number" | "selected_option">[]
): Record<ClusterType, number> {
  const clusterScores = emptyClusterScores();

  for (const response of responses) {
    const q = response.question_number;
    const opt = response.selected_option;

    if (q === 1) {
      if (opt.includes("Building")) clusterScores.Investigative += 2;
      if (opt.includes("Helping")) clusterScores.Social += 2;
      if (opt.includes("Analysing")) clusterScores.Investigative += 2;
      if (opt.includes("Creating")) clusterScores.Artistic += 2;
      if (opt.includes("Leading")) clusterScores.Enterprising += 2;
    }

    if (q === 2) {
      if (opt.includes("Code") || opt.includes("build"))
        clusterScores.Investigative += 2;
      if (opt.includes("Read") || opt.includes("research"))
        clusterScores.Investigative += 1;
      if (opt.includes("Talk")) clusterScores.Social += 2;
      if (opt.includes("Draw") || opt.includes("create"))
        clusterScores.Artistic += 2;
      if (opt.includes("Plan") || opt.includes("organise"))
        clusterScores.Conventional += 2;
    }

    if (q === 3) {
      if (opt.includes("Mathematics")) {
        clusterScores.Investigative += 2;
        clusterScores.Conventional += 1;
      }
      if (opt.includes("Science")) {
        clusterScores.Investigative += 2;
        clusterScores.Realistic += 1;
      }
      if (opt.includes("Languages")) {
        clusterScores.Social += 2;
        clusterScores.Artistic += 1;
      }
      if (opt.includes("Commerce")) {
        clusterScores.Conventional += 2;
        clusterScores.Enterprising += 1;
      }
      if (opt.includes("Arts")) clusterScores.Artistic += 3;
    }

    if (q === 7) {
      if (opt.includes("Presenter")) clusterScores.Enterprising += 2;
      if (opt.includes("Researcher")) clusterScores.Investigative += 2;
      if (opt.includes("Planner")) clusterScores.Conventional += 2;
      if (opt.includes("Builder")) clusterScores.Realistic += 2;
      if (opt.includes("Supporter")) clusterScores.Social += 2;
    }

    if (q === 10) {
      if (opt.includes("Alone")) clusterScores.Investigative += 1;
      if (opt.includes("Small team")) clusterScores.Conventional += 1;
      if (opt.includes("Large team")) clusterScores.Social += 1;
    }

    if (q === 13) {
      if (opt.includes("salary")) clusterScores.Conventional += 2;
      if (opt.includes("Social impact")) clusterScores.Social += 2;
      if (opt.includes("Creative")) clusterScores.Artistic += 2;
      if (opt.includes("security")) clusterScores.Conventional += 1;
      if (opt.includes("Learning")) clusterScores.Investigative += 1;
    }

    if (q === 14) {
      if (opt.includes("business")) clusterScores.Enterprising += 3;
      if (opt.includes("Freelance")) clusterScores.Artistic += 1;
      if (opt.includes("Government")) clusterScores.Conventional += 2;
    }

    if (q === 15) {
      if (opt.includes("Technical")) clusterScores.Investigative += 2;
      if (opt.includes("manager")) clusterScores.Enterprising += 2;
      if (opt.includes("venture")) clusterScores.Enterprising += 3;
      if (opt.includes("Researcher")) clusterScores.Investigative += 2;
      if (opt.includes("Helping")) clusterScores.Social += 2;
    }
  }

  return clusterScores;
}

function applyTeacherBonus(
  clusterScores: Record<ClusterType, number>,
  assessment: TeacherAssessment | null | undefined
): Record<ClusterType, number> {
  if (!assessment) return clusterScores;

  const teacherBonus: Record<ClusterType, number> = {
    Investigative: assessment.curiosity * 0.5,
    Social: assessment.communication * 0.5,
    Enterprising: assessment.leadership * 0.5,
    Conventional: assessment.persistence * 0.5,
    Artistic: assessment.creativity * 0.5,
    Realistic: 0,
  };

  const adjusted = { ...clusterScores };
  for (const cluster of CLUSTER_TYPES) {
    adjusted[cluster] += teacherBonus[cluster];
  }

  return adjusted;
}

function averageMarks(marks: StudentMark[]): number {
  if (marks.length === 0) return 0;
  const total = marks.reduce((sum, mark) => sum + mark.marks, 0);
  return total / marks.length;
}

function strongSubjects(marks: StudentMark[]): string[] {
  return marks.filter((mark) => mark.marks >= 70).map((mark) => mark.subject);
}

function subjectMatchesRequired(
  strong: string[],
  required: string
): boolean {
  const normalizedRequired = required.trim().toLowerCase();
  return strong.some((subject) => {
    const normalizedSubject = subject.trim().toLowerCase();
    return (
      normalizedSubject === normalizedRequired ||
      normalizedSubject.includes(normalizedRequired) ||
      normalizedRequired.includes(normalizedSubject)
    );
  });
}

function buildReasoning(
  career: Career,
  clusterScores: Record<ClusterType, number>,
  avgMarks: number
): string {
  const topCluster =
    Object.entries(clusterScores).sort((a, b) => b[1] - a[1])[0]?.[0] ??
    career.cluster;

  const reasoning =
    `Your ${topCluster.toLowerCase()} interests align with this career. ` +
    (avgMarks >= career.min_marks
      ? "Your marks qualify you for this path. "
      : `Work on improving your marks by ${Math.max(
          0,
          career.min_marks - Math.round(avgMarks)
        )} points. `) +
    (career.growth_trend === "Rising"
      ? "This is a growing field with good future prospects."
      : "This is a stable career with consistent opportunities.");

  return reasoning;
}

function scoreCareer(
  career: Career,
  clusterScores: Record<ClusterType, number>,
  avgMarks: number,
  strong: string[]
): { match_score: number; reasoning: string } {
  let score = 0;

  const maxCluster = Math.max(...Object.values(clusterScores), 0);
  const careerCluster = normalizeCluster(career.cluster);
  const careerClusterScore = careerCluster
    ? clusterScores[careerCluster]
    : 0;
  const clusterPoints =
    maxCluster > 0 ? (careerClusterScore / maxCluster) * 40 : 0;
  score += clusterPoints;

  if (avgMarks >= career.min_marks) {
    score += 30;
  } else if (avgMarks >= career.min_marks - 10) {
    score += 20;
  } else if (avgMarks >= career.min_marks - 20) {
    score += 10;
  }

  const requiredSubjects = career.required_subjects ?? [];
  if (requiredSubjects.includes("Any subject")) {
    score += 15;
  } else if (requiredSubjects.length > 0) {
    const subjectMatchCount = requiredSubjects.filter((subject) =>
      subjectMatchesRequired(strong, subject)
    ).length;
    score +=
      (subjectMatchCount / Math.max(requiredSubjects.length, 1)) * 20;
  }

  if (career.growth_trend === "Rising") {
    score += 10;
  } else if (career.growth_trend === "Stable") {
    score += 5;
  }

  const reasoning = buildReasoning(career, clusterScores, avgMarks);

  return {
    match_score: Math.min(Math.round(score), 100),
    reasoning,
  };
}

export function getQuestions(): CareerQuestion[] {
  return CAREER_QUESTIONS;
}

export function matchCareersToStudent(
  answers: AnswerInput[],
  careers: Career[],
  studentMarks: StudentMark[],
  assessment?: TeacherAssessment | null
): CareerMatchResult[] {
  const responses = answers.map((answer) => ({
    question_number: answer.question_number,
    selected_option: answer.selected_option,
  }));

  let clusterScores = calculateClusterScores(responses);
  clusterScores = applyTeacherBonus(clusterScores, assessment);

  const avgMarks = averageMarks(studentMarks);
  const strong = strongSubjects(studentMarks);

  const scored = careers.map((career) => {
    const { match_score, reasoning } = scoreCareer(
      career,
      clusterScores,
      avgMarks,
      strong
    );
    return { career, match_score, reasoning };
  });

  scored.sort((a, b) => b.match_score - a.match_score);

  return scored.slice(0, 3).map((item, index) => ({
    rank: index + 1,
    match_score: item.match_score,
    reasoning: item.reasoning,
    career: item.career,
  }));
}
