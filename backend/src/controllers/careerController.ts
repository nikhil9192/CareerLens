import { Response, NextFunction } from "express";
import { supabase } from "../lib/supabase";
import { AuthRequest } from "../middleware/auth";
import { AppError } from "../lib/errors";
import {
  getQuestions,
  matchCareersToStudent,
  AnswerInput,
  Career,
  StudentMark,
  TeacherAssessment,
  CareerMatchResult,
} from "../services/careerService";

function getStudentId(req: AuthRequest): string {
  const studentId = req.user?.userId ?? req.userId;
  if (!studentId) {
    throw new AppError("Unauthorized", 401);
  }
  return studentId;
}

function validateAnswers(answers: unknown): AnswerInput[] {
  if (!Array.isArray(answers) || answers.length !== 15) {
    throw new AppError("answers must be an array of exactly 15 items", 400);
  }

  const seen = new Set<number>();

  for (const item of answers) {
    if (
      typeof item !== "object" ||
      item === null ||
      typeof item.question_number !== "number" ||
      item.question_number < 1 ||
      item.question_number > 15 ||
      typeof item.question_text !== "string" ||
      typeof item.selected_option !== "string" ||
      typeof item.cluster_tag !== "string"
    ) {
      throw new AppError(
        "Each answer must include question_number, question_text, selected_option, and cluster_tag",
        400
      );
    }

    if (seen.has(item.question_number)) {
      throw new AppError("Duplicate question_number in answers", 400);
    }
    seen.add(item.question_number);
  }

  return answers as AnswerInput[];
}

export async function listQuestions(
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    res.json(getQuestions());
  } catch (err) {
    next(err);
  }
}

export async function submitAssessment(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const studentId = getStudentId(req);
    const { answers: rawAnswers } = req.body as { answers?: unknown };
    const answers = validateAnswers(rawAnswers);

    const { error: deleteResponsesError } = await supabase
      .from("interest_responses")
      .delete()
      .eq("student_id", studentId);

    if (deleteResponsesError) {
      throw new AppError(deleteResponsesError.message, 500);
    }

    const responseRows = answers.map((answer) => ({
      student_id: studentId,
      question_number: answer.question_number,
      question_text: answer.question_text,
      selected_option: answer.selected_option,
      cluster_tag: answer.cluster_tag,
    }));

    const { error: insertResponsesError } = await supabase
      .from("interest_responses")
      .insert(responseRows);

    if (insertResponsesError) {
      throw new AppError(insertResponsesError.message, 500);
    }

    const { data: marksData, error: marksError } = await supabase
      .from("marks")
      .select("subject, marks, total_marks")
      .eq("student_id", studentId);

    if (marksError) {
      throw new AppError(marksError.message, 500);
    }

    const studentMarks = (marksData ?? []) as StudentMark[];

    const { data: assessmentData, error: assessmentError } = await supabase
      .from("teacher_assessments")
      .select("curiosity, communication, leadership, persistence, creativity")
      .eq("student_id", studentId)
      .maybeSingle();

    if (assessmentError) {
      throw new AppError(assessmentError.message, 500);
    }

    const teacherAssessment = (assessmentData as TeacherAssessment | null) ?? null;

    const { data: careersData, error: careersError } = await supabase
      .from("careers")
      .select("*");

    if (careersError) {
      throw new AppError(careersError.message, 500);
    }

    const careers = (careersData ?? []) as Career[];
    const topMatches = matchCareersToStudent(
      answers,
      careers,
      studentMarks,
      teacherAssessment
    );

    const { error: deleteMatchesError } = await supabase
      .from("career_matches")
      .delete()
      .eq("student_id", studentId);

    if (deleteMatchesError) {
      throw new AppError(deleteMatchesError.message, 500);
    }

    if (topMatches.length > 0) {
      const matchRows = topMatches.map((match) => ({
        student_id: studentId,
        career_id: match.career.id,
        match_score: match.match_score,
        reasoning: match.reasoning,
        rank: match.rank,
        generated_at: new Date().toISOString(),
      }));

      const { error: insertMatchesError } = await supabase
        .from("career_matches")
        .insert(matchRows);

      if (insertMatchesError) {
        throw new AppError(insertMatchesError.message, 500);
      }
    }

    res.status(201).json({ matches: topMatches });
  } catch (err) {
    next(err);
  }
}

export async function getResults(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const studentId = getStudentId(req);

    const { data, error } = await supabase
      .from("career_matches")
      .select(
        "id, student_id, career_id, match_score, reasoning, rank, generated_at, careers(*)"
      )
      .eq("student_id", studentId)
      .order("rank", { ascending: true });

    if (error) {
      throw new AppError(error.message, 500);
    }

    if (!data || data.length === 0) {
      res.json({ hasResults: false });
      return;
    }

    const matches = data.map((row) => {
      const career = (row.careers as unknown) as Career | null;
      return {
        id: row.id,
        rank: row.rank,
        match_score: row.match_score,
        reasoning: row.reasoning,
        generated_at: row.generated_at,
        career,
      };
    });

    res.json({ hasResults: true, matches });
  } catch (err) {
    next(err);
  }
}

export async function retakeAssessment(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const studentId = getStudentId(req);

    const { error: responsesError } = await supabase
      .from("interest_responses")
      .delete()
      .eq("student_id", studentId);

    if (responsesError) {
      throw new AppError(responsesError.message, 500);
    }

    const { error: matchesError } = await supabase
      .from("career_matches")
      .delete()
      .eq("student_id", studentId);

    if (matchesError) {
      throw new AppError(matchesError.message, 500);
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

export type { CareerMatchResult };
