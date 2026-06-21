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

export interface CareerAnswer {
  question_number: number;
  question_text: string;
  selected_option: string;
  cluster_tag: string;
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

export interface CareerMatch {
  id?: string;
  rank: number;
  match_score: number;
  reasoning: string;
  generated_at?: string;
  career: Career | null;
}

export interface CareerResultsResponse {
  hasResults: boolean;
  matches?: CareerMatch[];
}

export interface SubmitCareerResponse {
  matches: {
    rank: number;
    match_score: number;
    reasoning: string;
    career: Career;
  }[];
}
