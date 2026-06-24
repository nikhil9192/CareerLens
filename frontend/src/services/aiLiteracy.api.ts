import { apiGet, apiPost } from "../lib/api";
import type {
  AiLiteracyLevel,
  AiLiteracyContent,
  AiLiteracyContentSummary,
  AiLiteracyQuizQuestion,
  AiLiteracyProgress,
  ProgressStatus,
} from "../types/aiLiteracy";

/** Minimum completion of a level required to unlock the next one. */
export const UNLOCK_THRESHOLD = 80;

export async function fetchLevels(): Promise<AiLiteracyLevel[]> {
  const data = (await apiGet("/api/ai-literacy/levels")) as {
    levels: AiLiteracyLevel[];
  };
  return data.levels ?? [];
}

export async function fetchLevelContent(
  levelId: string
): Promise<AiLiteracyContentSummary[]> {
  const data = (await apiGet(`/api/ai-literacy/levels/${levelId}/content`)) as {
    content: AiLiteracyContentSummary[];
  };
  return data.content ?? [];
}

export async function fetchContentItem(contentId: string): Promise<{
  content: AiLiteracyContent;
  questions: AiLiteracyQuizQuestion[];
}> {
  const data = (await apiGet(`/api/ai-literacy/content/${contentId}`)) as {
    content: AiLiteracyContent;
    questions: AiLiteracyQuizQuestion[];
  };
  return { content: data.content, questions: data.questions ?? [] };
}

export async function fetchMyProgress(): Promise<AiLiteracyProgress[]> {
  const data = (await apiGet("/api/ai-literacy/my-progress")) as {
    progress: AiLiteracyProgress[];
  };
  return data.progress ?? [];
}

export async function saveProgress(payload: {
  content_id: string;
  status?: ProgressStatus;
  score?: number;
  total_questions?: number;
}): Promise<AiLiteracyProgress> {
  const data = (await apiPost("/api/ai-literacy/progress", payload)) as {
    progress: AiLiteracyProgress;
  };
  return data.progress;
}

export interface LevelOverview extends AiLiteracyLevel {
  content: AiLiteracyContentSummary[];
  total: number;
  completed: number;
  pct: number;
  locked: boolean;
}

/**
 * Loads all published levels with their content, the student's progress, and
 * computed completion % + lock state. A level is locked when the previous
 * level's completion is below UNLOCK_THRESHOLD. Level 1 is always unlocked.
 */
export async function fetchLiteracyOverview(): Promise<{
  levels: LevelOverview[];
  progress: AiLiteracyProgress[];
  completedIds: Set<string>;
}> {
  const [levels, progress] = await Promise.all([
    fetchLevels(),
    fetchMyProgress(),
  ]);

  const contentLists = await Promise.all(
    levels.map((level) => fetchLevelContent(level.id))
  );

  const completedIds = new Set(
    progress.filter((p) => p.status === "completed").map((p) => p.content_id)
  );

  const enriched: LevelOverview[] = levels.map((level, index) => {
    const content = contentLists[index];
    const total = content.length;
    const completed = content.filter((c) => completedIds.has(c.id)).length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { ...level, content, total, completed, pct, locked: false };
  });

  for (let i = 1; i < enriched.length; i++) {
    enriched[i].locked = enriched[i - 1].pct < UNLOCK_THRESHOLD;
  }

  return { levels: enriched, progress, completedIds };
}
