import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "../lib/supabase";
import { AppError } from "../lib/errors";

const DAILY_MESSAGE_LIMIT = 20;
const HISTORY_LIMIT = 10;

// Free-tier keys work with 2.5 models; 2.0 models often return 429 (quota 0).
const GEMINI_MODELS = ["gemini-2.5-flash", "gemini-flash-latest"] as const;
const GEMINI_RETRY_DELAY_MS = 2000;
const GEMINI_MAX_ATTEMPTS = 2;

function getErrorDetail(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

function isModelNotFoundError(detail: string): boolean {
  const lower = detail.toLowerCase();
  return lower.includes("404") || lower.includes("not found");
}

function isRetryableGeminiError(detail: string): boolean {
  const lower = detail.toLowerCase();
  return (
    lower.includes("429") ||
    lower.includes("503") ||
    lower.includes("resource exhausted") ||
    lower.includes("overloaded")
  );
}

function mapGeminiFailureToAppError(detail: string): AppError {
  const lower = detail.toLowerCase();

  if (lower.includes("api key") || lower.includes("api_key")) {
    return new AppError(
      "Invalid GEMINI_API_KEY. Get a free key from aistudio.google.com",
      500
    );
  }
  if (
    lower.includes("429") ||
    lower.includes("resource exhausted") ||
    lower.includes("quota")
  ) {
    return new AppError(
      "AI service is temporarily busy. Please wait 30 seconds and try again.",
      503
    );
  }
  if (lower.includes("timeout") || lower.includes("fetch failed")) {
    return new AppError(
      "Connection to AI timed out. Please check your network and try again.",
      503
    );
  }
  return new AppError(
    "Could not get an AI response right now. Please try again in a moment.",
    503
  );
}

function buildGeminiHistory(
  rows: HistoryRow[]
): { role: "user" | "model"; parts: { text: string }[] }[] {
  const chronological = [...rows]
    .sort((a, b) => {
      const aTime = a.created_at ? Date.parse(a.created_at) : 0;
      const bTime = b.created_at ? Date.parse(b.created_at) : 0;
      if (aTime !== bTime) return aTime - bTime;
      if (a.role === b.role) return 0;
      return a.role === "user" ? -1 : 1;
    })
    .map((entry) => ({
      role: entry.role === "user" ? ("user" as const) : ("model" as const),
      parts: [{ text: entry.message }],
    }));

  // Gemini requires history to start with "user" and alternate user/model.
  let start = 0;
  while (start < chronological.length && chronological[start].role === "model") {
    start++;
  }

  const normalized: typeof chronological = [];
  for (const entry of chronological.slice(start)) {
    const last = normalized[normalized.length - 1];
    if (last && last.role === entry.role) {
      continue;
    }
    normalized.push(entry);
  }

  if (normalized.length > 0 && normalized[normalized.length - 1].role === "user") {
    normalized.pop();
  }

  return normalized;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isMissingTableError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("does not exist") ||
    lower.includes("ai_conversations") ||
    lower.includes("schema cache")
  );
}

interface SchoolInfo {
  name: string;
  city: string;
  state: string;
}

interface StudentRow {
  name: string;
  class_grade: string;
  gender: string;
  medium: string;
  schools: SchoolInfo | SchoolInfo[] | null;
}

interface MarkRow {
  subject: string;
  marks: number;
  total_marks: number;
  exam_term: string;
}

interface CareerMatchRow {
  match_score: number;
  rank: number;
  careers:
    | {
        title: string;
        cluster: string;
        salary_range: string;
        growth_trend: string;
        entry_path: string;
      }
    | {
        title: string;
        cluster: string;
        salary_range: string;
        growth_trend: string;
        entry_path: string;
      }[]
    | null;
}

interface TeacherAssessmentRow {
  curiosity: number;
  communication: number;
  leadership: number;
  persistence: number;
  creativity: number;
  observation_note: string | null;
}

interface HistoryRow {
  role: string;
  message: string;
  created_at?: string;
}

function unwrapSchool(
  schools: StudentRow["schools"]
): SchoolInfo | null {
  if (!schools) return null;
  return Array.isArray(schools) ? schools[0] ?? null : schools;
}

function unwrapCareer(
  careers: CareerMatchRow["careers"]
): { title: string } | null {
  if (!careers) return null;
  return Array.isArray(careers) ? careers[0] ?? null : careers;
}

function getGeminiClient(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new AppError(
      "AI service not configured. Add GEMINI_API_KEY to Railway and backend/.env",
      500
    );
  }
  return new GoogleGenerativeAI(apiKey);
}

async function callGemini(
  systemPrompt: string,
  conversationHistory: { role: "user" | "model"; parts: { text: string }[] }[],
  message: string
): Promise<string> {
  const genAI = getGeminiClient();
  let lastError: unknown;

  for (const modelName of GEMINI_MODELS) {
    for (let attempt = 0; attempt < GEMINI_MAX_ATTEMPTS; attempt++) {
      try {
        if (attempt > 0) {
          await sleep(GEMINI_RETRY_DELAY_MS);
        }

        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: systemPrompt,
        });

        const chat = model.startChat({ history: conversationHistory });
        const result = await chat.sendMessage(message);
        const text = result.response.text();

        if (!text?.trim()) {
          throw new Error("Empty response from Gemini");
        }

        console.info(
          `[ai] Response generated with model: ${modelName} (attempt ${attempt + 1})`
        );
        return text;
      } catch (err) {
        lastError = err;
        const detail = getErrorDetail(err);
        console.error(
          `[ai] Model ${modelName} attempt ${attempt + 1} failed:`,
          detail
        );

        if (isModelNotFoundError(detail)) {
          break;
        }
        if (!isRetryableGeminiError(detail) || attempt === GEMINI_MAX_ATTEMPTS - 1) {
          break;
        }
      }
    }
  }

  throw mapGeminiFailureToAppError(getErrorDetail(lastError));
}

async function fetchStudentContext(studentId: string) {
  const [studentResult, marksResult, quizResult, matchesResult, teacherResult, historyResult] =
    await Promise.all([
      supabase
        .from("students")
        .select("name, class_grade, gender, medium, schools(name, city, state)")
        .eq("id", studentId)
        .single(),

      supabase
        .from("marks")
        .select("subject, marks, total_marks, exam_term")
        .eq("student_id", studentId),

      supabase
        .from("interest_responses")
        .select("question_number, selected_option, cluster_tag")
        .eq("student_id", studentId)
        .order("question_number"),

      supabase
        .from("career_matches")
        .select(
          "match_score, rank, careers(title, cluster, salary_range, growth_trend, entry_path)"
        )
        .eq("student_id", studentId)
        .order("rank"),

      supabase
        .from("teacher_assessments")
        .select(
          "curiosity, communication, leadership, persistence, creativity, observation_note"
        )
        .eq("student_id", studentId)
        .maybeSingle(),

      supabase
        .from("ai_conversations")
        .select("role, message, created_at")
        .eq("student_id", studentId)
        .order("created_at", { ascending: false })
        .limit(HISTORY_LIMIT),
    ]);

  if (studentResult.error || !studentResult.data) {
    throw new AppError(studentResult.error?.message ?? "Student not found", 404);
  }

  if (marksResult.error) {
    throw new AppError(marksResult.error.message, 500);
  }

  if (quizResult.error) {
    throw new AppError(quizResult.error.message, 500);
  }

  if (matchesResult.error) {
    throw new AppError(matchesResult.error.message, 500);
  }

  if (teacherResult.error) {
    throw new AppError(teacherResult.error.message, 500);
  }

  if (historyResult.error) {
    if (isMissingTableError(historyResult.error.message)) {
      console.warn("[ai] ai_conversations table missing — run ai_conversations_setup.sql");
    } else {
      throw new AppError(historyResult.error.message, 500);
    }
  }

  return {
    student: studentResult.data as StudentRow,
    marks: (marksResult.data ?? []) as MarkRow[],
    quiz: quizResult.data ?? [],
    matches: (matchesResult.data ?? []) as CareerMatchRow[],
    teacher: (teacherResult.data as TeacherAssessmentRow | null) ?? null,
    history: (historyResult.error ? [] : (historyResult.data ?? [])) as HistoryRow[],
  };
}

async function assertWithinRateLimit(studentId: string): Promise<void> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { count, error } = await supabase
    .from("ai_conversations")
    .select("id", { count: "exact", head: true })
    .eq("student_id", studentId)
    .eq("role", "user")
    .gte("created_at", since);

  if (error) {
    if (isMissingTableError(error.message)) {
      return;
    }
    throw new AppError(error.message, 500);
  }

  if ((count ?? 0) >= DAILY_MESSAGE_LIMIT) {
    throw new AppError(
      "Daily message limit reached (20 messages). Please try again tomorrow.",
      429
    );
  }
}

function buildSystemPrompt(
  student: StudentRow,
  marks: MarkRow[],
  matches: CareerMatchRow[],
  teacher: TeacherAssessmentRow | null,
  quiz: { question_number: number; selected_option: string; cluster_tag: string }[]
): string {
  const school = unwrapSchool(student.schools);
  const avgMarks = marks.length
    ? Math.round(marks.reduce((sum, mark) => sum + mark.marks, 0) / marks.length)
    : null;

  const strongSubjects = marks.filter((m) => m.marks >= 70).map((m) => m.subject);
  const weakSubjects = marks.filter((m) => m.marks < 50).map((m) => m.subject);
  const topCareerMatch = matches[0];
  const topCareer = unwrapCareer(topCareerMatch?.careers ?? null)?.title ?? "Not assessed yet";
  const topMatch = topCareerMatch?.match_score ?? null;
  const studentLanguage = student.medium || "English";
  const mathMarks = marks.find((m) => m.subject === "Math")?.marks ?? "good";

  const marksLines =
    marks.map((m) => `${m.subject}: ${m.marks}/${m.total_marks}`).join("\n") ||
    "Not entered yet";

  const matchLines =
    matches
      .map((m) => {
        const career = unwrapCareer(m.careers);
        return `${m.rank}. ${career?.title ?? "Unknown"} — ${m.match_score}% match`;
      })
      .join("\n") || "Quiz not taken yet";

  const quizLines =
    quiz
      .map((q) => `Q${q.question_number}: ${q.selected_option}`)
      .join("\n") || "Not taken yet";

  const languageRules =
    studentLanguage === "Hindi"
      ? 'Respond in simple Hindi mixed with English (Hinglish). Use Hindi for emotions and explanations, English for technical terms. Example: "Tumhara Math strong hai, isliye Software Engineer ek achha option hai."'
      : "Respond in simple English. Avoid complex words. Write like you are speaking to a 14-year-old.";

  return `
You are CareerLens AI — a friendly, wise career counsellor for Indian school students.
You are like a knowledgeable elder brother or sister who gives honest, practical advice.

STUDENT PROFILE (use this in every response):
━━━━━━━━━━━━━━━━━━━━━━━━
Name: ${student.name}
Class: ${student.class_grade}
School: ${school?.name ?? "N/A"}, ${school?.city ?? ""}
Medium: ${studentLanguage}
━━━━━━━━━━━━━━━━━━━━━━━━
MARKS:
${marksLines}
Average: ${avgMarks !== null ? `${avgMarks}%` : "Not available"}
Strong subjects: ${strongSubjects.join(", ") || "None above 70"}
Weak subjects: ${weakSubjects.join(", ") || "None below 50"}
━━━━━━━━━━━━━━━━━━━━━━━━
CAREER MATCHES:
${matchLines}
Top match: ${topCareer}${topMatch !== null ? ` (${topMatch}%)` : ""}
━━━━━━━━━━━━━━━━━━━━━━━━
QUIZ RESPONSES:
${quizLines}
━━━━━━━━━━━━━━━━━━━━━━━━
TEACHER ASSESSMENT:
Curiosity: ${teacher?.curiosity ?? "?"}/5
Communication: ${teacher?.communication ?? "?"}/5
Leadership: ${teacher?.leadership ?? "?"}/5
Persistence: ${teacher?.persistence ?? "?"}/5
Creativity: ${teacher?.creativity ?? "?"}/5
Teacher note: ${teacher?.observation_note ?? "No note added"}
━━━━━━━━━━━━━━━━━━━━━━━━

LANGUAGE RULES:
${languageRules}

RESPONSE RULES:
1. Maximum 150 words per response
2. Always be encouraging and realistic — never discouraging
3. Use student name occasionally to make it personal
4. Give specific actionable steps, not vague advice
5. Only answer career, study, stream selection, college, and motivation questions
6. If asked about homework, relationships, or anything non-career:
   Say "Main sirf career aur padhai ke baare mein help kar sakta hoon. Koi career question poochho!"
7. When marks are available, always reference them specifically
8. When career matches are available, always reference the top match
9. End responses with an encouraging line or follow-up question

EXAMPLE RESPONSES:
User: "Which stream should I take?"
Good: "${student.name}, tumhare Math mein ${mathMarks} marks hain. Science stream (PCM) tumhare liye best rahega. Top career match ${topCareer} ke liye yahi zaruri hai. Class 11 mein Physics, Chemistry, Maths lo. Koi doubt hai?"

User: "Am I good enough for engineering?"
Good: "Bilkul! Tumhara average ${avgMarks ?? "your current"}% hai aur ${topCareer} ke liye minimum marks se ${avgMarks !== null ? `${avgMarks - 60} above` : "close"} ho. Bas ${weakSubjects[0] ?? "weak subjects"} thoda improve karo. Engineers bante hain mehnat se, IQ se nahi. Tum kar sakte ho!"
`.trim();
}

export async function handleChat(
  studentId: string,
  message: string
): Promise<{ response: string; studentName: string }> {
  const trimmed = message.trim();
  if (!trimmed) {
    throw new AppError("Message cannot be empty", 400);
  }

  await assertWithinRateLimit(studentId);

  const context = await fetchStudentContext(studentId);
  const systemPrompt = buildSystemPrompt(
    context.student,
    context.marks,
    context.matches,
    context.teacher,
    context.quiz as { question_number: number; selected_option: string; cluster_tag: string }[]
  );

  const conversationHistory = buildGeminiHistory(context.history);

  try {
    const aiResponse = await callGemini(
      systemPrompt,
      conversationHistory,
      trimmed
    );

    const savedAt = Date.now();
    const { error: insertError } = await supabase
      .from("ai_conversations")
      .insert([
        {
          student_id: studentId,
          role: "user",
          message: trimmed,
          created_at: new Date(savedAt).toISOString(),
        },
        {
          student_id: studentId,
          role: "assistant",
          message: aiResponse,
          created_at: new Date(savedAt + 1).toISOString(),
        },
      ]);

    if (insertError) {
      if (isMissingTableError(insertError.message)) {
        console.warn("[ai] Could not save chat — ai_conversations table missing");
      } else {
        throw new AppError(insertError.message, 500);
      }
    }

    return {
      response: aiResponse,
      studentName: context.student.name,
    };
  } catch (err) {
    if (err instanceof AppError) throw err;

    console.error("[ai] Unexpected chat error:", getErrorDetail(err));
    throw mapGeminiFailureToAppError(getErrorDetail(err));
  }
}

const MAX_AUDIO_BYTES = 10 * 1024 * 1024;

const SUPPORTED_AUDIO_MIME_TYPES = [
  "audio/webm",
  "audio/mp4",
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/ogg",
  "audio/aac",
  "audio/flac",
];

const TRANSCRIBE_PROMPT =
  "Transcribe this audio exactly as spoken. The speaker is an Indian student " +
  "and may speak Hindi, English, or Hinglish (mix of both). " +
  "Return ONLY the transcribed words with no extra commentary. " +
  "If there is no clear speech in the audio, return exactly: [NO_SPEECH]";

async function transcribeAudio(
  audioBase64: string,
  mimeType: string
): Promise<string> {
  const genAI = getGeminiClient();
  let lastError: unknown;

  for (const modelName of GEMINI_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent([
        { inlineData: { data: audioBase64, mimeType } },
        { text: TRANSCRIBE_PROMPT },
      ]);
      const text = result.response.text().trim();

      console.info(`[ai] Audio transcribed with model: ${modelName}`);
      return text;
    } catch (err) {
      lastError = err;
      console.error(
        `[ai] Transcription with ${modelName} failed:`,
        getErrorDetail(err)
      );
    }
  }

  throw mapGeminiFailureToAppError(getErrorDetail(lastError));
}

export async function handleVoiceChat(
  studentId: string,
  audioBase64: string,
  mimeType: string
): Promise<{ transcript: string; response: string; studentName: string }> {
  // MediaRecorder sends types like "audio/webm;codecs=opus" — keep only the base type
  const baseMimeType = mimeType.split(";")[0].trim().toLowerCase();
  if (!SUPPORTED_AUDIO_MIME_TYPES.includes(baseMimeType)) {
    throw new AppError(
      "Unsupported audio format. Please try recording again.",
      400
    );
  }

  const approxBytes = Math.floor((audioBase64.length * 3) / 4);
  if (approxBytes > MAX_AUDIO_BYTES) {
    throw new AppError(
      "Audio is too long. Please keep your question under 1 minute.",
      400
    );
  }
  if (approxBytes < 1000) {
    throw new AppError(
      "Recording was too short. Hold the mic and speak your question.",
      400
    );
  }

  const transcript = await transcribeAudio(audioBase64, baseMimeType);

  if (!transcript || transcript.includes("[NO_SPEECH]")) {
    throw new AppError(
      "Could not hear anything clearly. Please speak again near the mic.",
      400
    );
  }

  const chatResult = await handleChat(studentId, transcript);

  return {
    transcript,
    response: chatResult.response,
    studentName: chatResult.studentName,
  };
}

export async function getChatHistory(studentId: string): Promise<HistoryRow[]> {
  const { data, error } = await supabase
    .from("ai_conversations")
    .select("role, message, created_at")
    .eq("student_id", studentId)
    .order("created_at", { ascending: true })
    .limit(50);

  if (error) {
    if (isMissingTableError(error.message)) {
      return [];
    }
    throw new AppError(error.message, 500);
  }

  return (data ?? []) as HistoryRow[];
}

export async function clearChatHistory(studentId: string): Promise<void> {
  const { error } = await supabase
    .from("ai_conversations")
    .delete()
    .eq("student_id", studentId);

  if (error && !isMissingTableError(error.message)) {
    throw new AppError(error.message, 500);
  }
}

export async function getSuggestions(studentId: string): Promise<string[]> {
  const [marksResult, matchesResult] = await Promise.all([
    supabase
      .from("marks")
      .select("subject, marks")
      .eq("student_id", studentId),
    supabase
      .from("career_matches")
      .select("match_score, rank, careers(title)")
      .eq("student_id", studentId)
      .order("rank"),
  ]);

  if (marksResult.error) {
    throw new AppError(marksResult.error.message, 500);
  }

  if (matchesResult.error) {
    throw new AppError(matchesResult.error.message, 500);
  }

  const marks = marksResult.data ?? [];
  const matches = matchesResult.data ?? [];

  const suggestions: string[] = [];

  if (!marks.length) {
    suggestions.push("How do I start entering my marks?");
  }

  if (!matches.length) {
    suggestions.push("How do I take the career quiz?");
  }

  if (matches.length) {
    const top = matches[0] as CareerMatchRow;
    const title = unwrapCareer(top.careers)?.title;
    if (title) {
      suggestions.push(`What is ${title} career?`);
    }
  }

  if (marks.length) {
    const sorted = [...marks].sort(
      (a, b) => (a as MarkRow).marks - (b as MarkRow).marks
    );
    const weakest = sorted[0] as { subject: string; marks: number };
    if (weakest?.subject) {
      suggestions.push(`How do I improve my ${weakest.subject}?`);
    }
  }

  suggestions.push("Which stream should I choose after Class 10?");
  suggestions.push("How do I explain my career choice to my parents?");

  return suggestions.slice(0, 4);
}
