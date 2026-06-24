export type ContentType = "reading" | "quiz" | "task";
export type CorrectAnswer = "A" | "B" | "C" | "D";
export type ProgressStatus = "in_progress" | "completed";

export interface AiLiteracyLevel {
  id: string;
  level_number: number;
  title: string;
  title_hi: string | null;
  description: string | null;
  description_hi: string | null;
  published: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AiLiteracyContent {
  id: string;
  level_id: string;
  type: ContentType;
  title: string;
  title_hi: string | null;
  body: string | null;
  body_hi: string | null;
  position: number;
  published: boolean;
  created_at?: string;
  updated_at?: string;
}

/** Lightweight content shape returned by the student level-content list. */
export interface AiLiteracyContentSummary {
  id: string;
  level_id: string;
  type: ContentType;
  title: string;
  title_hi: string | null;
  position: number;
  published: boolean;
}

export interface AiLiteracyQuizQuestion {
  id: string;
  content_id: string;
  question_text: string;
  question_text_hi: string | null;
  option_a: string;
  option_a_hi: string | null;
  option_b: string;
  option_b_hi: string | null;
  option_c: string;
  option_c_hi: string | null;
  option_d: string;
  option_d_hi: string | null;
  correct_answer: CorrectAnswer;
  explanation: string | null;
  explanation_hi: string | null;
  position: number;
}

/** A student's progress row for a single content item. */
export interface AiLiteracyProgress {
  id: string;
  content_id: string;
  status: ProgressStatus;
  score: number | null;
  total_questions: number | null;
  completed_at: string | null;
}

/** Joined progress row returned to the admin progress viewer. */
export interface AdminProgressRow {
  id: string;
  status: string;
  score: number | null;
  total_questions: number | null;
  completed_at: string | null;
  students: {
    name: string | null;
    class_grade: string | number | null;
    schools: { name: string | null } | null;
  } | null;
  ai_literacy_content: {
    title: string | null;
    type: string | null;
    level_id: string | null;
    ai_literacy_levels: {
      level_number: number | null;
      title: string | null;
    } | null;
  } | null;
}

// ---- Request payloads ----
export interface LevelInput {
  level_number?: number;
  title?: string;
  title_hi?: string | null;
  description?: string | null;
  description_hi?: string | null;
  published?: boolean;
}

export interface ContentInput {
  level_id?: string;
  type?: ContentType;
  title?: string;
  title_hi?: string | null;
  body?: string | null;
  body_hi?: string | null;
  position?: number;
  published?: boolean;
}

export interface QuizQuestionInput {
  content_id?: string;
  question_text?: string;
  question_text_hi?: string | null;
  option_a?: string;
  option_a_hi?: string | null;
  option_b?: string;
  option_b_hi?: string | null;
  option_c?: string;
  option_c_hi?: string | null;
  option_d?: string;
  option_d_hi?: string | null;
  correct_answer?: CorrectAnswer;
  explanation?: string | null;
  explanation_hi?: string | null;
  position?: number;
}
