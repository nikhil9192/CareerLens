import { Response, NextFunction } from "express";
import { supabase } from "../lib/supabase";
import { AuthRequest } from "../middleware/auth";
import { AppError } from "../lib/errors";

const CONTENT_TYPES = ["reading", "quiz", "task"] as const;
const CORRECT_ANSWERS = ["A", "B", "C", "D"] as const;

// The DB column is `is_published`; we expose it to clients as `published`
// using PostgREST column aliasing so the API contract stays stable.
const LEVEL_SELECT =
  "id, level_number, title, title_hi, description, description_hi, published:is_published";
const CONTENT_SELECT =
  "id, level_id, type, title, title_hi, body, body_hi, position, published:is_published";
const CONTENT_SUMMARY_SELECT =
  "id, level_id, type, title, title_hi, position, published:is_published";

function getStudentId(req: AuthRequest): string {
  const studentId = req.user?.userId ?? req.userId;
  if (!studentId) {
    throw new AppError("Unauthorized", 401);
  }
  return studentId;
}

function nowIso(): string {
  return new Date().toISOString();
}

// ============================================================
// ADMIN — LEVELS
// ============================================================
export async function createLevel(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { level_number, title, title_hi, description, description_hi, published } =
      req.body as Record<string, unknown>;

    if (typeof level_number !== "number" || typeof title !== "string" || !title.trim()) {
      throw new AppError("level_number (number) and title (string) are required", 400);
    }

    const { data, error } = await supabase
      .from("ai_literacy_levels")
      .insert({
        level_number,
        title,
        title_hi: title_hi ?? null,
        description: description ?? null,
        description_hi: description_hi ?? null,
        is_published: Boolean(published),
      })
      .select(LEVEL_SELECT)
      .single();

    if (error) throw new AppError(error.message, 500);
    res.status(201).json({ level: data });
  } catch (err) {
    next(err);
  }
}

export async function updateLevel(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const { level_number, title, title_hi, description, description_hi, published } =
      req.body as Record<string, unknown>;

    const patch: Record<string, unknown> = {};
    if (level_number !== undefined) patch.level_number = level_number;
    if (title !== undefined) patch.title = title;
    if (title_hi !== undefined) patch.title_hi = title_hi;
    if (description !== undefined) patch.description = description;
    if (description_hi !== undefined) patch.description_hi = description_hi;
    if (published !== undefined) patch.is_published = Boolean(published);

    const { data, error } = await supabase
      .from("ai_literacy_levels")
      .update(patch)
      .eq("id", id)
      .select(LEVEL_SELECT)
      .single();

    if (error) throw new AppError(error.message, 500);
    if (!data) throw new AppError("Level not found", 404);
    res.json({ level: data });
  } catch (err) {
    next(err);
  }
}

export async function deleteLevel(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from("ai_literacy_levels")
      .delete()
      .eq("id", id);

    if (error) throw new AppError(error.message, 500);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

// ============================================================
// ADMIN — CONTENT
// ============================================================
export async function createContent(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { level_id, type, title, title_hi, body, body_hi, position, published } =
      req.body as Record<string, unknown>;

    if (typeof level_id !== "string" || !level_id) {
      throw new AppError("level_id is required", 400);
    }
    if (typeof type !== "string" || !CONTENT_TYPES.includes(type as never)) {
      throw new AppError("type must be one of reading, quiz, task", 400);
    }
    if (typeof title !== "string" || !title.trim()) {
      throw new AppError("title is required", 400);
    }

    const { data, error } = await supabase
      .from("ai_literacy_content")
      .insert({
        level_id,
        type,
        title,
        title_hi: title_hi ?? null,
        body: body ?? null,
        body_hi: body_hi ?? null,
        position: typeof position === "number" ? position : 0,
        is_published: Boolean(published),
      })
      .select(CONTENT_SELECT)
      .single();

    if (error) throw new AppError(error.message, 500);
    res.status(201).json({ content: data });
  } catch (err) {
    next(err);
  }
}

export async function updateContent(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const { type, title, title_hi, body, body_hi, position, published } =
      req.body as Record<string, unknown>;

    if (type !== undefined && !CONTENT_TYPES.includes(type as never)) {
      throw new AppError("type must be one of reading, quiz, task", 400);
    }

    const patch: Record<string, unknown> = {};
    if (type !== undefined) patch.type = type;
    if (title !== undefined) patch.title = title;
    if (title_hi !== undefined) patch.title_hi = title_hi;
    if (body !== undefined) patch.body = body;
    if (body_hi !== undefined) patch.body_hi = body_hi;
    if (position !== undefined) patch.position = position;
    if (published !== undefined) patch.is_published = Boolean(published);

    const { data, error } = await supabase
      .from("ai_literacy_content")
      .update(patch)
      .eq("id", id)
      .select(CONTENT_SELECT)
      .single();

    if (error) throw new AppError(error.message, 500);
    if (!data) throw new AppError("Content not found", 404);
    res.json({ content: data });
  } catch (err) {
    next(err);
  }
}

export async function deleteContent(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from("ai_literacy_content")
      .delete()
      .eq("id", id);

    if (error) throw new AppError(error.message, 500);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

// ============================================================
// ADMIN — QUIZ QUESTIONS
// ============================================================
function validateQuizBody(body: Record<string, unknown>, partial: boolean): void {
  const required = [
    "question_text",
    "option_a",
    "option_b",
    "option_c",
    "option_d",
    "correct_answer",
  ];
  if (!partial) {
    for (const field of required) {
      if (typeof body[field] !== "string" || !(body[field] as string).trim()) {
        throw new AppError(`${field} is required`, 400);
      }
    }
  }
  if (
    body.correct_answer !== undefined &&
    !CORRECT_ANSWERS.includes(body.correct_answer as never)
  ) {
    throw new AppError("correct_answer must be A, B, C, or D", 400);
  }
}

export async function createQuizQuestion(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const body = req.body as Record<string, unknown>;
    if (typeof body.content_id !== "string" || !body.content_id) {
      throw new AppError("content_id is required", 400);
    }
    validateQuizBody(body, false);

    const { data, error } = await supabase
      .from("ai_literacy_quiz_questions")
      .insert({
        content_id: body.content_id,
        question_text: body.question_text,
        question_text_hi: body.question_text_hi ?? null,
        option_a: body.option_a,
        option_a_hi: body.option_a_hi ?? null,
        option_b: body.option_b,
        option_b_hi: body.option_b_hi ?? null,
        option_c: body.option_c,
        option_c_hi: body.option_c_hi ?? null,
        option_d: body.option_d,
        option_d_hi: body.option_d_hi ?? null,
        correct_answer: body.correct_answer,
        explanation: body.explanation ?? null,
        explanation_hi: body.explanation_hi ?? null,
        position: typeof body.position === "number" ? body.position : 0,
      })
      .select()
      .single();

    if (error) throw new AppError(error.message, 500);
    res.status(201).json({ question: data });
  } catch (err) {
    next(err);
  }
}

export async function updateQuizQuestion(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const body = req.body as Record<string, unknown>;
    validateQuizBody(body, true);

    const fields = [
      "question_text",
      "question_text_hi",
      "option_a",
      "option_a_hi",
      "option_b",
      "option_b_hi",
      "option_c",
      "option_c_hi",
      "option_d",
      "option_d_hi",
      "correct_answer",
      "explanation",
      "explanation_hi",
      "position",
    ];
    const patch: Record<string, unknown> = {};
    for (const field of fields) {
      if (body[field] !== undefined) patch[field] = body[field];
    }

    const { data, error } = await supabase
      .from("ai_literacy_quiz_questions")
      .update(patch)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new AppError(error.message, 500);
    if (!data) throw new AppError("Question not found", 404);
    res.json({ question: data });
  } catch (err) {
    next(err);
  }
}

export async function deleteQuizQuestion(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from("ai_literacy_quiz_questions")
      .delete()
      .eq("id", id);

    if (error) throw new AppError(error.message, 500);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

// ============================================================
// ADMIN — READ (needed for the admin panel: includes unpublished)
// ============================================================
export async function adminListLevels(
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { data, error } = await supabase
      .from("ai_literacy_levels")
      .select(LEVEL_SELECT)
      .order("level_number", { ascending: true });

    if (error) throw new AppError(error.message, 500);
    res.json({ levels: data ?? [] });
  } catch (err) {
    next(err);
  }
}

export async function adminListLevelContent(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("ai_literacy_content")
      .select(CONTENT_SELECT)
      .eq("level_id", id)
      .order("position", { ascending: true });

    if (error) throw new AppError(error.message, 500);
    res.json({ content: data ?? [] });
  } catch (err) {
    next(err);
  }
}

export async function adminGetContent(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const { data: content, error: contentError } = await supabase
      .from("ai_literacy_content")
      .select(CONTENT_SELECT)
      .eq("id", id)
      .single();

    if (contentError) throw new AppError(contentError.message, 500);
    if (!content) throw new AppError("Content not found", 404);

    const { data: questions, error: questionsError } = await supabase
      .from("ai_literacy_quiz_questions")
      .select("*")
      .eq("content_id", id)
      .order("position", { ascending: true });

    if (questionsError) throw new AppError(questionsError.message, 500);
    res.json({ content, questions: questions ?? [] });
  } catch (err) {
    next(err);
  }
}

export async function adminListProgress(
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { data, error } = await supabase
      .from("ai_literacy_progress")
      .select(
        "id, status, score, total_questions, completed_at, " +
          "students(name, class_grade, schools(name)), " +
          "ai_literacy_content(title, type, level_id, ai_literacy_levels(level_number, title))"
      )
      .order("completed_at", { ascending: false });

    if (error) throw new AppError(error.message, 500);
    res.json({ progress: data ?? [] });
  } catch (err) {
    next(err);
  }
}

// ============================================================
// STUDENT — READ
// ============================================================
export async function getLevels(
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { data, error } = await supabase
      .from("ai_literacy_levels")
      .select(LEVEL_SELECT)
      .eq("is_published", true)
      .order("level_number", { ascending: true });

    if (error) throw new AppError(error.message, 500);
    res.json({ levels: data ?? [] });
  } catch (err) {
    next(err);
  }
}

export async function getLevelContent(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("ai_literacy_content")
      .select(CONTENT_SUMMARY_SELECT)
      .eq("level_id", id)
      .eq("is_published", true)
      .order("position", { ascending: true });

    if (error) throw new AppError(error.message, 500);
    res.json({ content: data ?? [] });
  } catch (err) {
    next(err);
  }
}

export async function getContentItem(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const { data: content, error: contentError } = await supabase
      .from("ai_literacy_content")
      .select(CONTENT_SELECT)
      .eq("id", id)
      .eq("is_published", true)
      .single();

    if (contentError) throw new AppError(contentError.message, 500);
    if (!content) throw new AppError("Content not found", 404);

    let questions: unknown[] = [];
    if (content.type === "quiz") {
      const { data: questionData, error: questionsError } = await supabase
        .from("ai_literacy_quiz_questions")
        .select("*")
        .eq("content_id", id)
        .order("position", { ascending: true });

      if (questionsError) throw new AppError(questionsError.message, 500);
      questions = questionData ?? [];
    }

    res.json({ content, questions });
  } catch (err) {
    next(err);
  }
}

// ============================================================
// STUDENT — PROGRESS
// ============================================================
export async function saveProgress(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const studentId = getStudentId(req);
    const { content_id, status, score, total_questions } = req.body as Record<
      string,
      unknown
    >;

    if (typeof content_id !== "string" || !content_id) {
      throw new AppError("content_id is required", 400);
    }

    const finalStatus =
      status === "in_progress" ? "in_progress" : "completed";

    const row = {
      student_id: studentId,
      content_id,
      status: finalStatus,
      score: typeof score === "number" ? score : null,
      total_questions: typeof total_questions === "number" ? total_questions : null,
      completed_at: finalStatus === "completed" ? nowIso() : null,
    };

    const { data, error } = await supabase
      .from("ai_literacy_progress")
      .upsert(row, { onConflict: "student_id,content_id" })
      .select()
      .single();

    if (error) throw new AppError(error.message, 500);
    res.json({ progress: data });
  } catch (err) {
    next(err);
  }
}

export async function getMyProgress(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const studentId = getStudentId(req);
    const { data, error } = await supabase
      .from("ai_literacy_progress")
      .select("id, content_id, status, score, total_questions, completed_at")
      .eq("student_id", studentId);

    if (error) throw new AppError(error.message, 500);
    res.json({ progress: data ?? [] });
  } catch (err) {
    next(err);
  }
}
