export interface QuizOption {
  text: string;
  text_hi: string;
}

export interface CareerQuestion {
  id: number;
  text: string;
  text_hi: string;
  category: string;
  cluster_tag: string;
  options: QuizOption[];
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
    text_hi: "कौन सी गतिविधि आपको सबसे ज़्यादा उत्साहित करती है?",
    category: "Interest",
    cluster_tag: "general",
    options: [
      { text: "Building & coding things", text_hi: "चीज़ें बनाना और कोडिंग करना" },
      { text: "Helping & teaching people", text_hi: "लोगों की मदद करना और सिखाना" },
      { text: "Analysing data & research", text_hi: "डेटा का विश्लेषण और शोध करना" },
      { text: "Creating art & design", text_hi: "कला और डिज़ाइन बनाना" },
      { text: "Leading & organising teams", text_hi: "टीम का नेतृत्व और आयोजन करना" },
    ],
  },
  {
    id: 2,
    text: "In free time you naturally?",
    text_hi: "खाली समय में आप स्वाभाविक रूप से क्या करते हैं?",
    category: "Interest",
    cluster_tag: "general",
    options: [
      { text: "Code or build projects", text_hi: "कोडिंग या प्रोजेक्ट बनाना" },
      { text: "Read and research", text_hi: "पढ़ना और शोध करना" },
      { text: "Talk to people", text_hi: "लोगों से बातें करना" },
      { text: "Draw or create things", text_hi: "चित्र बनाना या कुछ रचना करना" },
      { text: "Plan and organise", text_hi: "योजना बनाना और व्यवस्थित करना" },
    ],
  },
  {
    id: 3,
    text: "Which subject felt effortless?",
    text_hi: "कौन सा विषय आपको आसान लगा?",
    category: "Interest",
    cluster_tag: "general",
    options: [
      { text: "Mathematics", text_hi: "गणित" },
      { text: "Science & Biology", text_hi: "विज्ञान और जीव विज्ञान" },
      { text: "Languages & Literature", text_hi: "भाषाएँ और साहित्य" },
      { text: "Commerce & Economics", text_hi: "वाणिज्य और अर्थशास्त्र" },
      { text: "Arts & Computers", text_hi: "कला और कंप्यूटर" },
    ],
  },
  {
    id: 4,
    text: "Rate your problem-solving ability",
    text_hi: "आप समस्याएँ कितनी अच्छी तरह सुलझाते हैं?",
    category: "Skills",
    cluster_tag: "analytical",
    options: [
      { text: "Very strong - I love challenges", text_hi: "बहुत मज़बूत - मुझे चुनौतियाँ पसंद हैं" },
      { text: "Good - I manage most problems", text_hi: "अच्छी - मैं ज़्यादातर समस्याएँ हल कर लेता हूँ" },
      { text: "Average - I need some help", text_hi: "औसत - मुझे थोड़ी मदद चाहिए" },
      { text: "Below average - I struggle often", text_hi: "औसत से कम - मुझे अक्सर मुश्किल होती है" },
    ],
  },
  {
    id: 5,
    text: "Can you explain complex topics simply?",
    text_hi: "क्या आप कठिन विषयों को आसानी से समझा सकते हैं?",
    category: "Skills",
    cluster_tag: "communication",
    options: [
      { text: "Yes, always and clearly", text_hi: "हाँ, हमेशा और साफ़-साफ़" },
      { text: "Sometimes with effort", text_hi: "कभी-कभी, थोड़ी कोशिश से" },
      { text: "Rarely, I find it hard", text_hi: "बहुत कम, मुझे यह मुश्किल लगता है" },
    ],
  },
  {
    id: 6,
    text: "Comfort with numbers and logic?",
    text_hi: "संख्याओं और तर्क के साथ आप कितने सहज हैं?",
    category: "Skills",
    cluster_tag: "analytical",
    options: [
      { text: "Love numbers, very comfortable", text_hi: "संख्याएँ पसंद हैं, बहुत सहज हूँ" },
      { text: "Okay with basic maths", text_hi: "बुनियादी गणित ठीक है" },
      { text: "Prefer words over numbers", text_hi: "संख्याओं से ज़्यादा शब्द पसंद हैं" },
      { text: "Avoid numbers if possible", text_hi: "हो सके तो संख्याओं से बचता हूँ" },
    ],
  },
  {
    id: 7,
    text: "In group projects your role?",
    text_hi: "समूह के कामों में आपकी भूमिका क्या होती है?",
    category: "Communication",
    cluster_tag: "social",
    options: [
      { text: "Presenter - I speak for the group", text_hi: "प्रस्तुतकर्ता - मैं समूह के लिए बोलता हूँ" },
      { text: "Researcher - I find information", text_hi: "शोधकर्ता - मैं जानकारी ढूँढता हूँ" },
      { text: "Planner - I organise the work", text_hi: "योजनाकार - मैं काम व्यवस्थित करता हूँ" },
      { text: "Builder - I execute the tasks", text_hi: "कार्यकर्ता - मैं काम पूरा करता हूँ" },
      { text: "Supporter - I help everyone", text_hi: "सहायक - मैं सबकी मदद करता हूँ" },
    ],
  },
  {
    id: 8,
    text: "Public speaking feels?",
    text_hi: "सबके सामने बोलना आपको कैसा लगता है?",
    category: "Communication",
    cluster_tag: "social",
    options: [
      { text: "Exciting, I love it", text_hi: "रोमांचक, मुझे यह बहुत पसंद है" },
      { text: "Okay, I can manage", text_hi: "ठीक है, मैं कर लेता हूँ" },
      { text: "Stressful but I do it", text_hi: "तनाव होता है पर मैं कर लेता हूँ" },
      { text: "Very uncomfortable", text_hi: "बहुत असहज लगता है" },
    ],
  },
  {
    id: 9,
    text: "You prefer to communicate via?",
    text_hi: "आप किस तरह बात करना पसंद करते हैं?",
    category: "Communication",
    cluster_tag: "social",
    options: [
      { text: "Written - emails and reports", text_hi: "लिखकर - ईमेल और रिपोर्ट" },
      { text: "Verbal - calls and meetings", text_hi: "बोलकर - कॉल और मीटिंग" },
      { text: "Both equally", text_hi: "दोनों बराबर" },
    ],
  },
  {
    id: 10,
    text: "Ideal work environment?",
    text_hi: "आपके लिए सबसे अच्छा काम का माहौल कौन सा है?",
    category: "WorkStyle",
    cluster_tag: "general",
    options: [
      { text: "Alone with full focus", text_hi: "अकेले, पूरे ध्यान के साथ" },
      { text: "Small team collaboration", text_hi: "छोटी टीम के साथ मिलकर" },
      { text: "Large team, always together", text_hi: "बड़ी टीम, हमेशा साथ" },
    ],
  },
  {
    id: 11,
    text: "Handling deadlines under pressure?",
    text_hi: "दबाव में समय-सीमा को आप कैसे संभालते हैं?",
    category: "WorkStyle",
    cluster_tag: "general",
    options: [
      { text: "Thrive - pressure motivates me", text_hi: "बढ़िया करता हूँ - दबाव मुझे प्रेरित करता है" },
      { text: "Manage okay with planning", text_hi: "योजना से ठीक संभाल लेता हूँ" },
      { text: "Find it stressful but cope", text_hi: "तनाव होता है पर निभा लेता हूँ" },
      { text: "Struggle significantly", text_hi: "मुझे काफ़ी मुश्किल होती है" },
    ],
  },
  {
    id: 12,
    text: "Prefer work type?",
    text_hi: "आप किस तरह का काम पसंद करते हैं?",
    category: "WorkStyle",
    cluster_tag: "general",
    options: [
      { text: "Structured routine tasks", text_hi: "तय और नियमित काम" },
      { text: "Mix of routine and creative", text_hi: "नियमित और रचनात्मक का मेल" },
      { text: "Unpredictable creative challenges", text_hi: "नई और रचनात्मक चुनौतियाँ" },
    ],
  },
  {
    id: 13,
    text: "Most important in career?",
    text_hi: "करियर में आपके लिए सबसे ज़रूरी क्या है?",
    category: "Values",
    cluster_tag: "general",
    options: [
      { text: "High salary and financial security", text_hi: "अच्छी तनख्वाह और पैसों की सुरक्षा" },
      { text: "Making social impact", text_hi: "समाज के लिए कुछ अच्छा करना" },
      { text: "Creative freedom", text_hi: "रचनात्मक आज़ादी" },
      { text: "Job security and stability", text_hi: "नौकरी की सुरक्षा और स्थिरता" },
      { text: "Learning and growth", text_hi: "सीखना और आगे बढ़ना" },
    ],
  },
  {
    id: 14,
    text: "Work arrangement preference?",
    text_hi: "आप किस तरह का काम-तरीका पसंद करते हैं?",
    category: "Values",
    cluster_tag: "general",
    options: [
      { text: "Job in established company", text_hi: "किसी बड़ी कंपनी में नौकरी" },
      { text: "Start my own business", text_hi: "अपना खुद का व्यापार शुरू करना" },
      { text: "Freelance independently", text_hi: "स्वतंत्र रूप से फ्रीलांस काम" },
      { text: "Government/public sector job", text_hi: "सरकारी नौकरी" },
    ],
  },
  {
    id: 15,
    text: "5-year vision?",
    text_hi: "अगले 5 साल के लिए आपका सपना क्या है?",
    category: "Values",
    cluster_tag: "general",
    options: [
      { text: "Technical expert in my field", text_hi: "अपने क्षेत्र में तकनीकी विशेषज्ञ बनना" },
      { text: "Managing a team", text_hi: "एक टीम का नेतृत्व करना" },
      { text: "Running my own venture", text_hi: "अपना खुद का काम चलाना" },
      { text: "Researcher or academic", text_hi: "शोधकर्ता या शिक्षक बनना" },
      { text: "Helping people directly", text_hi: "सीधे लोगों की मदद करना" },
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
