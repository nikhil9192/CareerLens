/**
 * One-time migration script: translate English quiz questions and career
 * descriptions to Hindi using the Gemini API and save them to Supabase.
 *
 * Run manually (NOT part of the running server):
 *   npm run translate:hindi
 *
 * Safe to re-run: it only processes rows whose *_hi columns are still NULL,
 * so already-translated rows are skipped.
 */
import dotenv from "dotenv";
dotenv.config();

import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "../src/lib/supabase";

// Same primary model the AI counselling feature uses.
const GEMINI_MODEL = "gemini-2.5-flash";
const DELAY_BETWEEN_CALLS_MS = 1000;

function getGeminiClient(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing from environment");
  }
  return new GoogleGenerativeAI(apiKey);
}

const genAI = getGeminiClient();
const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

function buildPrompt(text: string): string {
  return `Translate the following text to simple, clear Hindi using Devanagari script. The audience is school students aged 11-17 in rural India, many in Hindi-medium schools. Keep sentences short and easy to understand. Do not use complex or formal vocabulary. Only return the translated Hindi text, nothing else, no explanation, no quotes.

Text to translate: ${text}`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Cache identical English strings so duplicate rows (e.g. the same quiz
// question answered by many students) don't trigger repeat API calls.
const translationCache = new Map<string, string>();

async function translateToHindi(text: string): Promise<string> {
  const trimmed = text.trim();
  const cached = translationCache.get(trimmed);
  if (cached !== undefined) {
    return cached;
  }

  const result = await model.generateContent(buildPrompt(trimmed));
  const hindi = result.response.text().trim();
  if (!hindi) {
    throw new Error("Gemini returned an empty translation");
  }

  translationCache.set(trimmed, hindi);
  // Delay only after a real API call, to avoid rate limits.
  await sleep(DELAY_BETWEEN_CALLS_MS);
  return hindi;
}

function preview(text: string, max = 60): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max)}…` : clean;
}

interface QuestionRow {
  id: string;
  question_text: string | null;
}

interface CareerRow {
  id: string;
  title: string | null;
  description: string | null;
  title_hi: string | null;
  description_hi: string | null;
}

interface RunStats {
  translated: number;
  failed: number;
  failures: string[];
}

async function translateQuestions(stats: RunStats): Promise<void> {
  const { data, error } = await supabase
    .from("interest_responses")
    .select("id, question_text")
    .is("question_text_hi", null);

  if (error) {
    throw new Error(`Failed to fetch interest_responses: ${error.message}`);
  }

  const rows = (data ?? []) as QuestionRow[];
  const total = rows.length;
  console.log(`\n=== Quiz questions: ${total} row(s) to translate ===`);

  for (let i = 0; i < total; i++) {
    const row = rows[i];
    const position = `${i + 1}/${total}`;

    if (!row.question_text || !row.question_text.trim()) {
      console.warn(`Skipped question ${position}: empty question_text (id ${row.id})`);
      continue;
    }

    try {
      const hindi = await translateToHindi(row.question_text);

      const { error: updateError } = await supabase
        .from("interest_responses")
        .update({ question_text_hi: hindi })
        .eq("id", row.id);

      if (updateError) {
        throw new Error(updateError.message);
      }

      stats.translated++;
      console.log(
        `Translated question ${position}: [${preview(row.question_text)}] -> [${preview(hindi)}]`
      );
    } catch (err) {
      stats.failed++;
      const message = err instanceof Error ? err.message : String(err);
      stats.failures.push(`question id ${row.id}: ${message}`);
      console.error(`FAILED question ${position} (id ${row.id}): ${message}`);
    }
  }
}

async function translateCareers(stats: RunStats): Promise<void> {
  const { data, error } = await supabase
    .from("careers")
    .select("id, title, description, title_hi, description_hi")
    .or("title_hi.is.null,description_hi.is.null");

  if (error) {
    throw new Error(`Failed to fetch careers: ${error.message}`);
  }

  const rows = (data ?? []) as CareerRow[];
  const total = rows.length;
  console.log(`\n=== Careers: ${total} row(s) to translate ===`);

  for (let i = 0; i < total; i++) {
    const row = rows[i];
    const position = `${i + 1}/${total}`;
    const update: { title_hi?: string; description_hi?: string } = {};

    try {
      if ((!row.title_hi || !row.title_hi.trim()) && row.title?.trim()) {
        update.title_hi = await translateToHindi(row.title);
        console.log(
          `Translated career title ${position}: [${preview(row.title)}] -> [${preview(update.title_hi)}]`
        );
      }

      if (
        (!row.description_hi || !row.description_hi.trim()) &&
        row.description?.trim()
      ) {
        update.description_hi = await translateToHindi(row.description);
        console.log(
          `Translated career description ${position}: [${preview(row.description)}] -> [${preview(update.description_hi)}]`
        );
      }

      if (Object.keys(update).length === 0) {
        console.warn(`Skipped career ${position}: nothing to translate (id ${row.id})`);
        continue;
      }

      const { error: updateError } = await supabase
        .from("careers")
        .update(update)
        .eq("id", row.id);

      if (updateError) {
        throw new Error(updateError.message);
      }

      stats.translated++;
    } catch (err) {
      stats.failed++;
      const message = err instanceof Error ? err.message : String(err);
      stats.failures.push(`career id ${row.id}: ${message}`);
      console.error(`FAILED career ${position} (id ${row.id}): ${message}`);
    }
  }
}

async function main(): Promise<void> {
  console.log(`Starting Hindi translation with model "${GEMINI_MODEL}"...`);
  const stats: RunStats = { translated: 0, failed: 0, failures: [] };

  await translateQuestions(stats);
  await translateCareers(stats);

  console.log("\n========== SUMMARY ==========");
  console.log(`Rows translated : ${stats.translated}`);
  console.log(`Failures        : ${stats.failed}`);
  if (stats.failures.length > 0) {
    console.log("Failure details:");
    for (const failure of stats.failures) {
      console.log(`  - ${failure}`);
    }
  }
  console.log("=============================");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Script crashed:", err);
    process.exit(1);
  });
